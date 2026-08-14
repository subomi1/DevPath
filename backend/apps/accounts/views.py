from .serializers import (
    RequestPasswordResetSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)
from .services import (
    request_password_reset,
    reset_password,
    change_password,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView


from .permissions import IsAdminOrHR
from .serializers import InviteDeveloperSerializer, ActivateAccountSerializer, UserSerializer, CustomTokenObtainPairSerializer
from .services import invite_developer, activate_account
from .models import Invitation


class InviteDeveloperView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request):
        serializer = InviteDeveloperSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user, invitation = invite_developer(
            invited_by=request.user,
            **data,
        )

        return Response(
            {'message': f'Invitation sent to {user.full_name}.',
                'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class ActivateAccountView(APIView):
    # public — the developer isn't logged in yet
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ActivateAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = activate_account(**serializer.validated_data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Account activated. Log in to get started.'})


class ValidateInvitationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        try:
            invitation = Invitation.objects.select_related(
                'user').get(token=token)
        except Invitation.DoesNotExist:
            return Response({'detail': 'This activation link is not valid.'}, status=status.HTTP_404_NOT_FOUND)

        if not invitation.is_valid():
            return Response({'detail': 'This activation link has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'full_name': invitation.user.full_name, 'email': invitation.user.email})


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            change_password(
                user=request.user,
                **serializer.validated_data,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_password_reset(**serializer.validated_data)
        # same generic message whether or not the email existed
        return Response({'message': "If an account exists for this email, we've sent a reset link."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            reset_password(**serializer.validated_data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Password reset. Log in with your new password.'})
