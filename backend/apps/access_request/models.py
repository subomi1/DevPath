import uuid
from django.db import models
from django.db import models

# Create your models here.


class AccessRequest(models.Model):
    RESOURCE_CHOICES = [
        ('github', 'GitHub'),
        ('azure_devops', 'Azure DevOps'),
        ('sql_server', 'SQL Server'),
        ('vpn', 'VPN'),
        ('internal_apis', 'Internal APIs'),
        ('test_environment', 'Test Environment'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    developer = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='access_requests')
    resource = models.CharField(max_length=20, choices=RESOURCE_CHOICES)
    resource_other_label = models.CharField(max_length=100, blank=True)
    access_level = models.CharField(max_length=100, blank=True)
    justification = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='submitted')
    reviewed_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_access_requests'
    )
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.developer.full_name} — {self.get_resource_display()}"


class AccessRequestStatusLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    access_request = models.ForeignKey(
        AccessRequest, on_delete=models.CASCADE, related_name='status_log')
    status = models.CharField(
        max_length=20, choices=AccessRequest.STATUS_CHOICES)
    changed_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['changed_at']

    def __str__(self):
        return f"{self.access_request} → {self.status}"
