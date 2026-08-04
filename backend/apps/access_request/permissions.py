from rest_framework.permissions import BasePermission


class IsManagerOfRequester(BasePermission):
    """
    Object-level check: is the requester the manager of the developer
    who submitted this access request?
    """
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user.role == 'manager'
            and obj.developer.manager_id == request.user.id
        )