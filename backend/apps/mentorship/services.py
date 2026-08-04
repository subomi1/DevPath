from django.utils import timezone
from .models import MentorMeeting, MentorNote


def request_meeting(*, developer, mentor, preferred_time_note=''):
    return MentorMeeting.objects.create(
        developer=developer, mentor=mentor, preferred_time_note=preferred_time_note
    )


def schedule_meeting(*, meeting: MentorMeeting, scheduled_at):
    if meeting.status not in ('requested', 'scheduled'):
        raise ValueError('This meeting cannot be scheduled from its current state.')

    meeting.status = 'scheduled'
    meeting.scheduled_at = scheduled_at
    meeting.save()
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