from rest_framework import serializers
from .models import AccessRequest, AccessRequestStatusLog


class AccessRequestStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = AccessRequestStatusLog
        fields = ['status', 'changed_by_name', 'changed_at']


class AccessRequestSerializer(serializers.ModelSerializer):
    status_log = AccessRequestStatusLogSerializer(many=True, read_only=True)
    developer_name = serializers.CharField(source='developer.full_name', read_only=True)
    resource_display = serializers.CharField(source='get_resource_display', read_only=True)

    class Meta:
        model = AccessRequest
        fields = [
            'id', 'developer', 'developer_name', 'resource', 'resource_display',
            'resource_other_label', 'access_level', 'justification', 'status',
            'reviewed_by', 'rejection_reason', 'created_at', 'updated_at', 'status_log',
        ]
        read_only_fields = ['id', 'developer', 'status', 'reviewed_by', 'rejection_reason', 'created_at', 'updated_at']


class CreateAccessRequestSerializer(serializers.Serializer):
    resource = serializers.ChoiceField(choices=AccessRequest.RESOURCE_CHOICES)
    resource_other_label = serializers.CharField(max_length=100, required=False, allow_blank=True)
    access_level = serializers.CharField(max_length=100, required=False, allow_blank=True)
    justification = serializers.CharField()

    def validate(self, attrs):
        if attrs['resource'] == 'other' and not attrs.get('resource_other_label'):
            raise serializers.ValidationError(
                {'resource_other_label': 'Required when resource is "other".'}
            )
        return attrs


class RejectAccessRequestSerializer(serializers.Serializer):
    reason = serializers.CharField()