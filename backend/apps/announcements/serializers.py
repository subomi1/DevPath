from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'body', 'category', 'author_name',
            'audience_scope', 'audience_department', 'audience_team',
            'published_at', 'updated_at', 'is_read',
        ]
        read_only_fields = ['id', 'published_at', 'updated_at']

    def get_is_read(self, obj):
        user = self.context.get('request').user
        return obj.reads.filter(user=user).exists()


class CreateAnnouncementSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    category = serializers.ChoiceField(choices=Announcement.CATEGORY_CHOICES)
    audience_scope = serializers.ChoiceField(choices=Announcement.AUDIENCE_CHOICES, default='all')
    audience_department = serializers.PrimaryKeyRelatedField(queryset=[], required=False, allow_null=True)
    audience_team = serializers.PrimaryKeyRelatedField(queryset=[], required=False, allow_null=True)

    def __init__(self, *args, **kwargs):
        from apps.organization.models import Department, Team
        super().__init__(*args, **kwargs)
        self.fields['audience_department'].queryset = Department.objects.all()
        self.fields['audience_team'].queryset = Team.objects.all()

    def validate(self, attrs):
        scope = attrs.get('audience_scope')
        if scope == 'department' and not attrs.get('audience_department'):
            raise serializers.ValidationError({'audience_department': 'Required when audience_scope is "department".'})
        if scope == 'team' and not attrs.get('audience_team'):
            raise serializers.ValidationError({'audience_team': 'Required when audience_scope is "team".'})
        return attrs


class ReadStatsSerializer(serializers.Serializer):
    total_audience = serializers.IntegerField()
    read_count = serializers.IntegerField()
    read_percentage = serializers.IntegerField()