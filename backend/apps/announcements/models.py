import uuid
from django.db import models


class Announcement(models.Model):
    CATEGORY_CHOICES = [
        ('orientation', 'Orientation'),
        ('engineering', 'Engineering'),
        ('office', 'Office'),
        ('maintenance', 'Maintenance'),
        ('training', 'Training'),
    ]

    AUDIENCE_CHOICES = [
        ('all', 'All'),
        ('department', 'Department'),
        ('team', 'Team'),
        ('manager_team', "Manager's Team"),  # a specific manager's direct reports only
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    body = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    author = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='authored_announcements')
    audience_scope = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    audience_department = models.ForeignKey(
        'organization.Department', on_delete=models.SET_NULL, null=True, blank=True
    )
    audience_team = models.ForeignKey(
        'organization.Team', on_delete=models.SET_NULL, null=True, blank=True
    )
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title


class AnnouncementRead(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='reads')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='announcement_reads')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('announcement', 'user')

    def __str__(self):
        return f"{self.user.full_name} read {self.announcement.title}"