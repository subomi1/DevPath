from django.urls import path
from .views import DeveloperDashboardView, ManagerDashboardView, HRDashboardView, AdminDashboardView

urlpatterns = [
    path('dashboard/developer/', DeveloperDashboardView.as_view(), name='dashboard-developer'),
    path('dashboard/manager/', ManagerDashboardView.as_view(), name='dashboard-manager'),
    path('dashboard/hr/', HRDashboardView.as_view(), name='dashboard-hr'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='dashboard-admin'),
]