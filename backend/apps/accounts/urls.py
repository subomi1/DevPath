from django.urls import path
from .views import InviteDeveloperView, ActivateAccountView, ValidateInvitationView, MeView, ResetPasswordView, RequestPasswordResetView, ChangePasswordView, UserListView

urlpatterns = [
    path('invitations/', InviteDeveloperView.as_view(), name='invite-developer'),
    path('activate/', ActivateAccountView.as_view(), name='activate-account'),
    path('invitations/validate/', ValidateInvitationView.as_view(),
         name='validate-invitation'),
    path('users/me/', MeView.as_view(), name='me'),
    path(
        "users/me/change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path('auth/forgot-password/',
         RequestPasswordResetView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('users/', UserListView.as_view(), name='user-list'),
]
