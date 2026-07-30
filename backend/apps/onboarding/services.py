from datetime import timedelta
from .models import (
    OnboardingTemplate, DeveloperJourney, JourneyPhase, JourneyTask
)


def clone_template_to_journey(*, developer, template: OnboardingTemplate):
    """
    Called once, at invitation time. Copies the template's phase/task
    structure into brand-new, independent rows owned by this developer.
    Editing the original template afterward will never affect journeys
    that already exist — that's the whole point of cloning rather than
    just linking back to the template's tasks directly.
    """
    journey = DeveloperJourney.objects.create(
        developer=developer, template=template)

    is_first_task = True

    for template_phase in template.phases.all():
        journey_phase = JourneyPhase.objects.create(
            journey=journey,
            name=template_phase.name,
            order=template_phase.order,
        )

        for template_task in template_phase.tasks.all():
            due_date = None
            if developer.start_date:
                due_date = developer.start_date + \
                    timedelta(days=template_task.due_offset_days)

            # the very first task in the whole journey starts as 'current',
            # everything else starts 'locked' — matches the hex-node UI states
            status = 'current' if is_first_task else 'locked'
            is_first_task = False

            JourneyTask.objects.create(
                phase=journey_phase,
                title=template_task.title,
                description=template_task.description,
                category=template_task.category,
                priority=template_task.priority,
                due_date=due_date,
                estimated_minutes=template_task.estimated_minutes,
                verification_type=template_task.verification_type,
                status=status,
                order=template_task.order,
            )

    recalculate_progress(journey)
    return journey


def recalculate_progress(journey: DeveloperJourney):
    """
    Stores the journey's completion % directly on the model, rather than
    computing it live on every dashboard/roster read (flagged back in the
    schema doc — this gets called any time a task's status changes).
    """
    tasks = JourneyTask.objects.filter(phase__journey=journey)
    total = tasks.count()

    if total == 0:
        journey.overall_progress = 0
    else:
        done = tasks.filter(status__in=['completed', 'verified']).count()
        journey.overall_progress = round((done / total) * 100)

    journey.save(update_fields=['overall_progress'])
    return journey.overall_progress


def complete_task(*, task: JourneyTask, completed_by):
    """
    Handles a developer marking a self-completed task done. This is where
    the 'unlock the next task' behavior lives — completing one task moves
    the *next* task (by order, within the same phase) from locked to current.
    """
    from django.utils import timezone

    if task.verification_type != 'self':
        raise ValueError(
            'This task requires manager verification and cannot be self-completed.')

    if task.status not in ('current', 'upcoming'):
        raise ValueError(
            'This task cannot be completed from its current state.')

    task.status = 'completed'
    task.completed_at = timezone.now()
    task.save()

    _unlock_next_task(task)
    recalculate_progress(task.phase.journey)

    return task


def _unlock_next_task(completed_task: JourneyTask):
    """
    Finds the next task in order — first checking the same phase, then
    falling through to the next phase's first task if this was the last
    task in its phase — and flips it from locked to current.
    """
    journey = completed_task.phase.journey

    next_in_phase = JourneyTask.objects.filter(
        phase=completed_task.phase, order__gt=completed_task.order
    ).order_by('order').first()

    if next_in_phase:
        if next_in_phase.status == 'locked':
            next_in_phase.status = 'current'
            next_in_phase.save(update_fields=['status'])
        return

    next_phase = JourneyPhase.objects.filter(
        journey=journey, order__gt=completed_task.phase.order
    ).order_by('order').first()

    if next_phase:
        first_task_next_phase = next_phase.tasks.order_by('order').first()
        if first_task_next_phase and first_task_next_phase.status == 'locked':
            first_task_next_phase.status = 'current'
            first_task_next_phase.save(update_fields=['status'])
