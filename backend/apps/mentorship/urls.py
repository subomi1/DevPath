from django.urls import path
from .views import (
    MyMentorshipView, RequestMeetingView, MyMenteesView,
    ScheduleMeetingView, CancelMeetingView, MentorNoteListCreateView
)

urlpatterns = [
    path('mentorship/me/', MyMentorshipView.as_view(), name='my-mentorship'),
    path('mentorship/mentees/', MyMenteesView.as_view(), name='my-mentees'),
    path('mentor-meetings/', RequestMeetingView.as_view(), name='request-meeting'),
    path('mentor-meetings/<uuid:meeting_id>/schedule/', ScheduleMeetingView.as_view(), name='schedule-meeting'),
    path('mentor-meetings/<uuid:meeting_id>/cancel/', CancelMeetingView.as_view(), name='cancel-meeting'),
    path('mentor-notes/', MentorNoteListCreateView.as_view(), name='create-mentor-note'),
]