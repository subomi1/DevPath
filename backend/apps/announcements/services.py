from django.db.models import Q
from django.utils import timezone
from .models import Announcement, AnnouncementRead
from apps.notifications.services import notify


def get_visible_announcements(*, user):
    """
    Builds the queryset of announcements a given user is allowed to see,
    based on audience_scope. This is what makes one shared feed endpoint
    show different content to a Developer in Engineering vs. a Developer
    in a different department, without the frontend needing to know
    anything about audience rules itself.
    """
    return Announcement.objects.filter(
        Q(audience_scope='all')
        | Q(audience_scope='department', audience_department=user.department)
        | Q(audience_scope='team', audience_team=user.team)
        | Q(audience_scope='manager_team', author=user.manager)
    ).distinct()


def get_audience_users(*, announcement):
    """
    The inverse of get_visible_announcements: given an announcement,
    who is in its audience? Shared by get_read_stats (needs a count)
    and notify_audience (needs to iterate and notify each one) so the
    audience-resolution rules only live in one place.
    """
    from apps.accounts.models import User

    if announcement.audience_scope == 'all':
        return User.objects.filter(status='active')
    elif announcement.audience_scope == 'department':
        return User.objects.filter(status='active', department=announcement.audience_department)
    elif announcement.audience_scope == 'team':
        return User.objects.filter(status='active', team=announcement.audience_team)
    elif announcement.audience_scope == 'manager_team':
        return User.objects.filter(status='active', manager=announcement.author)
    else:
        return User.objects.none()


def notify_audience(*, announcement):
    """
    Fans out a notification to everyone in the announcement's resolved
    audience. Called once, right after publish.
    """
    for user in get_audience_users(announcement=announcement).exclude(id=announcement.author_id):
        notify(
            recipient=user,
            category='announcement',
            title=announcement.title,
            object_id=announcement.id,
        )


def mark_as_read(*, announcement, user):
    AnnouncementRead.objects.get_or_create(announcement=announcement, user=user)


def get_read_stats(*, announcement):
    """
    Used by the Admin read-rate view: how many people in the resolved
    audience have actually read this, as a percentage.
    """
    audience = get_audience_users(announcement=announcement)

    total = audience.count()
    if total == 0:
        return {'total_audience': 0, 'read_count': 0, 'read_percentage': 0}

    read_count = AnnouncementRead.objects.filter(
        announcement=announcement, user__in=audience
    ).count()

    return {
        'total_audience': total,
        'read_count': read_count,
        'read_percentage': round((read_count / total) * 100),
    }