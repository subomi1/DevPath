import uuid
import secrets
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta

# Create your models here.


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('status', 'active')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hr', 'HR'),
        ('manager', 'Manager'),
        ('developer', 'Developer'),
    ]

    STATUS_CHOICES = [
        ('pending_invitation', 'Pending Invitation'),
        ('pending_activation', 'Pending Activation'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ]

    username = None  # remove Django's default username field — we log in with email
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    is_mentor = models.BooleanField(default=False)
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='developer')
    status = models.CharField(
        max_length=25, choices=STATUS_CHOICES, default='pending_invitation')
    job_role = models.CharField(max_length=100, blank=True)

    department = models.ForeignKey(
        'organization.Department', on_delete=models.SET_NULL, null=True, blank=True
    )
    team = models.ForeignKey(
        'organization.Team', on_delete=models.SET_NULL, null=True, blank=True
    )
    manager = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports'
    )
    mentor = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='mentees'
    )

    start_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    # email + password are required by default; nothing extra needed at createsuperuser time
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Invitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='invitation')
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    onboarding_template = models.ForeignKey(
        'onboarding.OnboardingTemplate', on_delete=models.PROTECT)
    token = models.CharField(max_length=64, unique=True,
                             db_index=True, blank=True)
    expires_at = models.DateTimeField(blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_valid(self):
        return self.accepted_at is None and not self.is_expired()

    def __str__(self):
        return f"Invitation for {self.user.email}"


class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=64, unique=True,
                             db_index=True, blank=True)
    expires_at = models.DateTimeField(blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            # much shorter than invitation's 7 days
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def is_valid(self):
        return self.used_at is None and timezone.now() <= self.expires_at
