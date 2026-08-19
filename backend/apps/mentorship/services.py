from django.utils import timezone
from .models import MentorMeeting, MentorNote
from apps.notifications.services import notify


def request_meeting(*, developer, mentor, preferred_time_note=''):
    meeting = MentorMeeting.objects.create(
        developer=developer, mentor=mentor, preferred_time_note=preferred_time_note
    )

    notify(
        recipient=mentor,
        category='mentorship',
        title=f'{developer.full_name} requested a meeting',
        body=preferred_time_note,
        object_id=meeting.id,
    )
    return meeting


def schedule_meeting(*, meeting: MentorMeeting, scheduled_at):
    if meeting.status not in ('requested', 'scheduled'):
        raise ValueError('This meeting cannot be scheduled from its current state.')

    meeting.status = 'scheduled'
    meeting.scheduled_at = scheduled_at
    meeting.save()

    notify(
        recipient=meeting.developer,
        category='mentorship',
        title=f'Meeting scheduled for {scheduled_at.strftime("%b %d, %I:%M %p")}',
        object_id=meeting.id,
    )
    return meeting


def complete_meeting(*, meeting: MentorMeeting):
    if meeting.status != 'scheduled':
        raise ValueError('Only scheduled meetings can be marked completed.')

    meeting.status = 'completed'
    meeting.save()
    return meeting


def cancel_meeting(*, meeting: MentorMeeting):
    if meeting.status in ('completed', 'cancelled'):
        raise ValueError('This meeting cannot be cancelled.')

    meeting.status = 'cancelled'
    meeting.save()
    return meeting