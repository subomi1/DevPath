from rest_framework import serializers
from .models import JourneyTask, JourneyPhase, DeveloperJourney, OnboardingTemplate


class JourneyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = JourneyTask
        fields = [
            'id', 'title', 'description', 'category', 'priority',
            'due_date', 'estimated_minutes', 'verification_type',
            'status', 'completed_at', 'verified_by', 'verified_at',
            'verification_note', 'order',
        ]
        read_only_fields = fields  # nothing here is directly editable via this serializer


class JourneyPhaseSerializer(serializers.ModelSerializer):
    tasks = JourneyTaskSerializer(many=True, read_only=True)

    class Meta:
        model = JourneyPhase
        fields = ['id', 'name', 'order', 'tasks']


class DeveloperJourneySerializer(serializers.ModelSerializer):
    phases = JourneyPhaseSerializer(many=True, read_only=True)

    class Meta:
        model = DeveloperJourney
        fields = ['id', 'started_at', 'completed_at', 'overall_progress', 'phases']
        
class SendBackTaskSerializer(serializers.Serializer):
    reason = serializers.CharField()
    
class OnboardingTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTemplate
        fields = ['id', 'name', 'target_role', 'description', 'is_active']