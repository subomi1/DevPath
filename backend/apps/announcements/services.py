from django.db.models import Q
from django.utils import timezone
from .models import Announcement, AnnouncementRead


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


def mark_as_read(*, announcement, user):
    AnnouncementRead.objects.get_or_create(announcement=announcement, user=user)


def get_read_stats(*, announcement):
    """
    Used by the Admin read-rate view: how many people in the resolved
    audience have actually read this, as a percentage.
    """
    from apps.accounts.models import User

    if announcement.audience_scope == 'all':
        audience = User.objects.filter(status='active')
    elif announcement.audience_scope == 'department':
        audience = User.objects.filter(status='active', department=announcement.audience_department)
    elif announcement.audience_scope == 'team':
        audience = User.objects.filter(status='active', team=announcement.audience_team)
    elif announcement.audience_scope == 'manager_team':
        audience = User.objects.filter(status='active', manager=announcement.author)
    else:
        audience = User.objects.none()

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