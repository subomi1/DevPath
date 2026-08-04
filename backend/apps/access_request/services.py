from django.utils import timezone
from .models import AccessRequest, AccessRequestStatusLog


def _log_status(access_request, status, changed_by):
    AccessRequestStatusLog.objects.create(
        access_request=access_request, status=status, changed_by=changed_by
    )


def create_access_request(*, developer, resource, justification,
                          resource_other_label='', access_level=''):
    access_request = AccessRequest.objects.create(
        developer=developer,
        resource=resource,
        resource_other_label=resource_other_label,
        access_level=access_level,
        justification=justification,
    )
    _log_status(access_request, 'submitted', changed_by=developer)
    return access_request


def mark_under_review(*, access_request, reviewed_by):
    if access_request.status != 'submitted':
        raise ValueError('Only submitted requests can be marked under review.')

    access_request.status = 'under_review'
    access_request.reviewed_by = reviewed_by
    access_request.save()
    _log_status(access_request, 'under_review', changed_by=reviewed_by)
    return access_request


def approve_access_request(*, access_request, reviewed_by):
    if access_request.status not in ('submitted', 'under_review'):
        raise ValueError(
            'This request cannot be approved from its current state.')

    access_request.status = 'approved'
    access_request.reviewed_by = reviewed_by
    access_request.save()
    _log_status(access_request, 'approved', changed_by=reviewed_by)
    return access_request


def reject_access_request(*, access_request, reviewed_by, reason):
    if access_request.status not in ('submitted', 'under_review'):
        raise ValueError(
            'This request cannot be rejected from its current state.')

    access_request.status = 'rejected'
    access_request.reviewed_by = reviewed_by
    access_request.rejection_reason = reason
    access_request.save()
    _log_status(access_request, 'rejected', changed_by=reviewed_by)
    return access_request


def complete_access_request(*, access_request, completed_by):
    if access_request.status != 'approved':
        raise ValueError('Only approved requests can be marked completed.')

    access_request.status = 'completed'
    access_request.save()
    _log_status(access_request, 'completed', changed_by=completed_by)
    return access_request
