from django.urls import path
from .views import MyJourneyView, CompleteJourneyTaskView
from .views import SubmitJourneyTaskView, VerifyJourneyTaskView, SendBackJourneyTaskView, DeveloperJourneyDetailView, PendingVerificationsView, OnboardingTemplateListView, OnboardingTemplateDetailView

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
    path('journeys/<uuid:user_id>/',
         DeveloperJourneyDetailView.as_view(), name='journey-detail'),
    path('journey-tasks/pending-verification/',
         PendingVerificationsView.as_view(), name='pending-verifications'),
    path('templates/', OnboardingTemplateListView.as_view(), name='template-list'),
    path('templates/<uuid:template_id>/',
         OnboardingTemplateDetailView.as_view(), name='template-detail'),
]
