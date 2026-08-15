from django.urls import path
from .views import DepartmentListView, TeamListView

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('teams/', TeamListView.as_view(), name='team-list'),
]