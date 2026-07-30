from rest_framework.permissions import BasePermission


class IsHR(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'hr')


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsAdminOrHR(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('admin', 'hr')
        )


class IsManagerOfDeveloper(BasePermission):
    """
    Object-level check: is the requester the manager of the developer
    who owns this task's journey? Used alongside IsAuthenticated on the
    verify/send-back views.
    """

    def has_object_permission(self, request, view, obj):
        developer = obj.phase.journey.developer
        return bool(
            request.user.role == 'manager' and developer.manager_id == request.user.id
        )
