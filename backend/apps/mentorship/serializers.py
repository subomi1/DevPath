from rest_framework import serializers
from .models import MentorMeeting, MentorNote


class MentorMeetingSerializer(serializers.ModelSerializer):
    developer_name = serializers.CharField(source='developer.full_name', read_only=True)
    mentor_name = serializers.CharField(source='mentor.full_name', read_only=True)

    class Meta:
        model = MentorMeeting
        fields = [
            'id', 'developer', 'developer_name', 'mentor', 'mentor_name',
            'requested_at', 'preferred_time_note', 'scheduled_at', 'status',
        ]
        read_only_fields = ['id', 'developer', 'mentor', 'requested_at', 'status']


class RequestMeetingSerializer(serializers.Serializer):
    preferred_time_note = serializers.CharField(required=False, allow_blank=True)


class ScheduleMeetingSerializer(serializers.Serializer):
    scheduled_at = serializers.DateTimeField()


class MentorNoteSerializer(serializers.ModelSerializer):
    mentor_name = serializers.CharField(source='mentor.full_name', read_only=True)

    class Meta:
        model = MentorNote
        fields = ['id', 'developer', 'mentor', 'mentor_name', 'content', 'is_goal', 'created_at']
        read_only_fields = ['id', 'mentor', 'created_at']


class CreateMentorNoteSerializer(serializers.Serializer):
    developer = serializers.PrimaryKeyRelatedField(queryset=[])  # set in __init__, see below
    content = serializers.CharField()
    is_goal = serializers.BooleanField(default=False)

    def __init__(self, *args, **kwargs):
        from apps.accounts.models import User
        super().__init__(*args, **kwargs)
        self.fields['developer'].queryset = User.objects.filter(role='developer')