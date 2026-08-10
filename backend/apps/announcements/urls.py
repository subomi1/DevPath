from django.urls import path
from .views import AnnouncementListCreateView, AnnouncementDetailView, AnnouncementReadStatsView

urlpatterns = [
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('announcements/<uuid:announcement_id>/', AnnouncementDetailView.as_view(), name='announcement-detail'),
    path('announcements/<uuid:announcement_id>/read-stats/', AnnouncementReadStatsView.as_view(), name='announcement-read-stats'),
]