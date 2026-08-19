from .models import Notification


def notify(*, recipient, category, title, body='', object_id=None):
    """
    Single entry point for creating a notification. Every trigger site
    elsewhere in the app (task verified, access request approved, etc.)
    calls this rather than creating Notification objects directly —
    keeps the creation logic in one place if it grows later (e.g. email
    fan-out, push notifications).
    """
    return Notification.objects.create(
        recipient=recipient,
        category=category,
        title=title,
        body=body,
        object_id=object_id,
    )