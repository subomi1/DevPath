import uuid
from django.db import models


class MentorMeeting(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    developer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mentor_meetings_as_developer')
    mentor = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mentor_meetings_as_mentor')
    requested_at = models.DateTimeField(auto_now_add=True)
    preferred_time_note = models.TextField(blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.developer.full_name} ↔ {self.mentor.full_name} ({self.status})"


class MentorNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    developer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mentor_notes_received')
    mentor = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mentor_notes_written')
    content = models.TextField()
    is_goal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note for {self.developer.full_name} by {self.mentor.full_name}"