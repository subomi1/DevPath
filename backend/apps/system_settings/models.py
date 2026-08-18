import uuid
from django.db import models


class SystemSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=100, default='AppZone')
    primary_color = models.CharField(max_length=7, default='#5B2A9E')  # hex color
    min_password_length = models.PositiveIntegerField(default=8)
    require_password_complexity = models.BooleanField(default=True)
    session_timeout_minutes = models.PositiveIntegerField(default=30)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "System Settings"

    def save(self, *args, **kwargs):
        self.pk = 'a0000000-0000-0000-0000-000000000001'  # fixed ID — enforces singleton
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk='a0000000-0000-0000-0000-000000000001')
        return obj