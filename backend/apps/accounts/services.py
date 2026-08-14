from django.utils import timezone
from .models import User, Invitation, PasswordResetToken
from apps.onboarding.services import clone_template_to_journey
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


def invite_developer(*, full_name, email, department, team, job_role,
                     manager, mentor, start_date, onboarding_template, invited_by):
    user = User.objects.create(
        email=email,
        full_name=full_name,
        role='developer',
        status='pending_activation',
        department=department,
        team=team,
        job_role=job_role,
        manager=manager,
        mentor=mentor,
        start_date=start_date,
    )
    user.set_unusable_password()
    user.save()

    invitation = Invitation.objects.create(
        user=user,
        invited_by=invited_by,
        onboarding_template=onboarding_template,
    )

    clone_template_to_journey(
        developer=user, template=onboarding_template)  # ← new line

    # TODO: trigger activation email here once email sending is set up

    return user, invitation


def activate_account(*, token, password):
    """
    Called when the developer clicks their activation link and submits
    a password. Validates the token, sets the password, flips the user
    to active, and invalidates the invitation.
    """
    try:
        invitation = Invitation.objects.select_related('user').get(token=token)
    except Invitation.DoesNotExist:
        raise ValueError('This activation link is not valid.')

    if not invitation.is_valid():
        raise ValueError(
            'This activation link has expired or was already used.')

    user = invitation.user
    user.set_password(password)
    user.status = 'active'
    user.save()

    invitation.accepted_at = timezone.now()
    invitation.save()

    return user


def request_password_reset(*, email):
    """
    Always succeeds from the caller's perspective, regardless of whether
    the email exists — this is deliberate (see Prompt 2 §3): we never want
    to reveal whether a given email has an account.
    """
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return  # silently do nothing — caller still gets a generic success response

    reset_token = PasswordResetToken.objects.create(user=user)
    # TODO: send_password_reset_email(user, reset_token.token)
    return reset_token


def reset_password(*, token, new_password):
    try:
        reset_token = PasswordResetToken.objects.select_related(
            'user').get(token=token)
    except PasswordResetToken.DoesNotExist:
        raise ValueError('This reset link is not valid.')

    if not reset_token.is_valid():
        raise ValueError('This reset link has expired.')

    user = reset_token.user
    user.set_password(new_password)
    user.save()

    reset_token.used_at = timezone.now()
    reset_token.save()

    return user

def change_password(*, user, current_password, new_password):
    """
    Change the password for an authenticated user.

    Steps:
    1. Verify the current password.
    2. Validate the new password using Django's password validators.
    3. Save the new password.
    """

    if not user.check_password(current_password):
        raise ValueError("Your current password is incorrect.")

    if current_password == new_password:
        raise ValueError(
            "Your new password must be different from your current password."
        )

    try:
        validate_password(new_password, user)
    except ValidationError as e:
        raise ValueError(e.messages[0])

    user.set_password(new_password)
    user.save()

    return user
