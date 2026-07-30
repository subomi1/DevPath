from django.urls import path
from .views import MyJourneyView, CompleteJourneyTaskView
from .views import SubmitJourneyTaskView, VerifyJourneyTaskView, SendBackJourneyTaskView

urlpatterns = [
    path('journeys/me/', MyJourneyView.as_view(), name='my-journey'),
    path('journey-tasks/<uuid:task_id>/complete/',
         CompleteJourneyTaskView.as_view(), name='complete-journey-task'),
    path('journey-tasks/<uuid:task_id>/submit/',
         SubmitJourneyTaskView.as_view(), name='submit-journey-task'),
    path('journey-tasks/<uuid:task_id>/verify/',
         VerifyJourneyTaskView.as_view(), name='verify-journey-task'),
    path('journey-tasks/<uuid:task_id>/send-back/',
         SendBackJourneyTaskView.as_view(), name='send-back-journey-task'),
]
