from django.urls import path
from .views import (
    DepartmentListView, DepartmentCreateView, DepartmentDetailView,
    TeamListView, TeamCreateView, TeamDetailView,
)

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('departments/create/', DepartmentCreateView.as_view(), name='department-create'),
    path('departments/<uuid:department_id>/', DepartmentDetailView.as_view(), name='department-detail'),
    path('teams/', TeamListView.as_view(), name='team-list'),
    path('teams/create/', TeamCreateView.as_view(), name='team-create'),
    path('teams/<uuid:team_id>/', TeamDetailView.as_view(), name='team-detail'),
]