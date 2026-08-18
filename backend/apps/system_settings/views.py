from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin
from .models import SystemSettings
from .serializers import SystemSettingsSerializer


class SystemSettingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(SystemSettingsSerializer(SystemSettings.get()).data)

    def patch(self, request):
        settings_obj = SystemSettings.get()
        serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)