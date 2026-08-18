from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            'company_name', 'primary_color', 'min_password_length',
            'require_password_complexity', 'session_timeout_minutes', 'updated_at',
        ]
        read_only_fields = ['updated_at']