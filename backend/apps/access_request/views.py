from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import AccessRequest
from .serializers import (
    AccessRequestSerializer, CreateAccessRequestSerializer, RejectAccessRequestSerializer
)
from .services import (
    create_access_request, mark_under_review, approve_access_request,
    reject_access_request, complete_access_request
)
from .permissions import IsManagerOfRequester


class AccessRequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'developer':
            queryset = AccessRequest.objects.filter(developer=request.user)
        elif request.user.role == 'manager':
            queryset = AccessRequest.objects.filter(developer__manager=request.user)
        else:  # hr, admin
            queryset = AccessRequest.objects.all()

        queryset = queryset.select_related('developer', 'reviewed_by').prefetch_related('status_log')
        return Response(AccessRequestSerializer(queryset, many=True).data)

    def post(self, request):
        serializer = CreateAccessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_request = create_access_request(developer=request.user, **serializer.validated_data)
        return Response(AccessRequestSerializer(access_request).data, status=status.HTTP_201_CREATED)


class AccessRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        access_request = get_object_or_404(AccessRequest, id=request_id)

        is_owner = access_request.developer_id == request.user.id
        is_their_manager = access_request.developer.manager_id == request.user.id
        is_hr_or_admin = request.user.role in ('hr', 'admin')

        if not (is_owner or is_their_manager or is_hr_or_admin):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(AccessRequestSerializer(access_request).data)


class MarkUnderReviewView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOfRequester]

    def post(self, request, request_id):
        access_request = get_object_or_404(AccessRequest, id=request_id)
        self.check_object_permissions(request, access_request)

        try:
            mark_under_review(access_request=access_request, reviewed_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AccessRequestSerializer(access_request).data)


class ApproveAccessRequestView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOfRequester]

    def post(self, request, request_id):
        access_request = get_object_or_404(AccessRequest, id=request_id)
        self.check_object_permissions(request, access_request)

        try:
            approve_access_request(access_request=access_request, reviewed_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AccessRequestSerializer(access_request).data)


class RejectAccessRequestView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOfRequester]

    def post(self, request, request_id):
        access_request = get_object_or_404(AccessRequest, id=request_id)
        self.check_object_permissions(request, access_request)

        serializer = RejectAccessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reject_access_request(
                access_request=access_request, reviewed_by=request.user,
                reason=serializer.validated_data['reason'],
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AccessRequestSerializer(access_request).data)


class CompleteAccessRequestView(APIView):
    permission_classes = [IsAuthenticated]  # manager or admin/HR can mark provisioning done

    def post(self, request, request_id):
        access_request = get_object_or_404(AccessRequest, id=request_id)

        can_complete = (
            request.user.role in ('admin', 'hr')
            or access_request.developer.manager_id == request.user.id
        )
        if not can_complete:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            complete_access_request(access_request=access_request, completed_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AccessRequestSerializer(access_request).data)