from rest_framework import serializers
from .models import JourneyTask, JourneyPhase, DeveloperJourney, OnboardingTemplate, TemplatePhase, TemplateTask


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
        fields = ['id', 'started_at', 'completed_at',
                  'overall_progress', 'phases']


class SendBackTaskSerializer(serializers.Serializer):
    reason = serializers.CharField()


class OnboardingTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTemplate
        fields = ['id', 'name', 'target_role', 'description', 'is_active']


class OnboardingTemplateDetailSerializer(serializers.ModelSerializer):
    phase_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingTemplate
        fields = ['id', 'name', 'target_role', 'description',
                  'is_active', 'phase_count', 'task_count']

    def get_phase_count(self, obj):
        return obj.phases.count()

    def get_task_count(self, obj):
        return sum(phase.tasks.count() for phase in obj.phases.all())
    
    
class OnboardingTemplateWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTemplate
        fields = ['id', 'name', 'target_role', 'description', 'is_active']
        read_only_fields = ['id']


class TemplatePhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplatePhase
        fields = ['id', 'template', 'name', 'order']
        read_only_fields = ['id']


class TemplateTaskWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateTask
        fields = [
            'id', 'phase', 'title', 'description', 'category', 'priority',
            'due_offset_days', 'estimated_minutes', 'verification_type', 'order',
        ]
        read_only_fields = ['id']
