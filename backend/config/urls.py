from django.contrib import admin
from django.urls import path, include
from apps.accounts.views import CustomLoginView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.onboarding.urls')),
    path('api/v1/', include('apps.access_request.urls')),
    path('api/v1/', include('apps.mentorship.urls')),
]
