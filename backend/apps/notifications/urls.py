from django.urls import path
from .views import NotificationListView, UnreadCountView, MarkReadView, MarkAllReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/unread-count/', UnreadCountView.as_view(), name='notification-unread-count'),
    path('notifications/<uuid:notification_id>/mark-read/', MarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
]