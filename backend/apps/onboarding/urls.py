from django.urls import path
from .views import MyJourneyView, CompleteJourneyTaskView

urlpatterns = [
    path('journeys/me/', MyJourneyView.as_view(), name='my-journey'),
    path('journey-tasks/<uuid:task_id>/complete/', CompleteJourneyTaskView.as_view(), name='complete-journey-task'),
]