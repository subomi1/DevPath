import uuid
from django.db import models
from apps.accounts.models import User


class Notification(models.Model):
    CATEGORY_CHOICES = [
        ('task', 'Task'),
        ('access_request', 'Access Request'),
        ('announcement', 'Announcement'),
        ('mentorship', 'Mentorship'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=150)
    body = models.CharField(max_length=255, blank=True)

    # generic-ish link target: frontend routes on category + object_id rather than
    # a real GenericForeignKey — simpler than contenttypes for four known categories
    object_id = models.UUIDField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category}: {self.title} → {self.recipient.email}"