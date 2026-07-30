from rest_framework import serializers
from django.utils.text import slugify
from .models import User
from apps.organization.models import Department, Team
from apps.onboarding.models import OnboardingTemplate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # extra claims embedded directly inside the JWT itself
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # extra data in the response body, alongside the tokens
        data['user'] = UserSerializer(self.user).data
        return data


class InviteDeveloperSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all())
    team = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all())
    job_role = serializers.CharField(
        max_length=100, required=False, allow_blank=True)
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='manager'))
    mentor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    start_date = serializers.DateField()
    onboarding_template = serializers.PrimaryKeyRelatedField(
        queryset=OnboardingTemplate.objects.filter(is_active=True))

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already invited.')
        return value


class ActivateAccountSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'status', 'job_role',
            'department', 'team', 'manager', 'mentor', 'start_date',
            'phone', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
