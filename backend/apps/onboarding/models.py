import uuid
from django.db import models


class OnboardingTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    target_role = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TemplatePhase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        OnboardingTemplate, on_delete=models.CASCADE, related_name='phases')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.template.name} — {self.name}"


class TemplateTask(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    VERIFICATION_CHOICES = [
        ('self', 'Self-completed'),
        ('manager_verified', 'Manager verified'),
        ('automatic', 'Automatic'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phase = models.ForeignKey(
        TemplatePhase, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_offset_days = models.PositiveIntegerField(
        help_text="Days from the developer's start date")
    estimated_minutes = models.PositiveIntegerField(default=30)
    verification_type = models.CharField(
        max_length=20, choices=VERIFICATION_CHOICES, default='self')
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class TemplateTaskResource(models.Model):
    RESOURCE_TYPE_CHOICES = [('link', 'Link'), ('document', 'Document')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        TemplateTask, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    resource_type = models.CharField(
        max_length=10, choices=RESOURCE_TYPE_CHOICES, default='link')
    url = models.URLField(blank=True)
    file = models.FileField(upload_to='task_resources/', blank=True, null=True)

    def __str__(self):
        return self.title


class DeveloperJourney(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    developer = models.OneToOneField(
        'accounts.User', on_delete=models.CASCADE, related_name='journey')
    template = models.ForeignKey(
        OnboardingTemplate, on_delete=models.SET_NULL, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    overall_progress = models.PositiveSmallIntegerField(
        default=0)  # cached %, 0–100

    def __str__(self):
        return f"{self.developer.full_name}'s journey"


class JourneyPhase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    journey = models.ForeignKey(
        DeveloperJourney, on_delete=models.CASCADE, related_name='phases')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.journey.developer.full_name} — {self.name}"


class JourneyTask(models.Model):
    PRIORITY_CHOICES = TemplateTask.PRIORITY_CHOICES
    VERIFICATION_CHOICES = TemplateTask.VERIFICATION_CHOICES
    STATUS_CHOICES = [
        ('locked', 'Locked'),
        ('upcoming', 'Upcoming'),
        ('current', 'Current'),
        ('completed', 'Completed'),
        ('verified', 'Verified'),
        ('sent_back', 'Sent back'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phase = models.ForeignKey(
        JourneyPhase, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=30)
    verification_type = models.CharField(
        max_length=20, choices=VERIFICATION_CHOICES, default='self')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='upcoming')
    completed_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_tasks'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_note = models.TextField(blank=True)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
