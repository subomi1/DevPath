from django.shortcuts import get_object_or_404
from .serializers import SendBackTaskSerializer
from .services import submit_task_for_verification, verify_task, send_back_task
from apps.accounts.permissions import IsManagerOfDeveloper
from .services import complete_task
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import DeveloperJourney, JourneyTask
from .serializers import DeveloperJourneySerializer
from .services import recalculate_progress


class MyJourneyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            journey = DeveloperJourney.objects.get(developer=request.user)
        except DeveloperJourney.DoesNotExist:
            return Response({'detail': 'No journey found for this account.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(DeveloperJourneySerializer(journey).data)


class CompleteJourneyTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        try:
            task = JourneyTask.objects.get(
                id=task_id, phase__journey__developer=request.user)
        except JourneyTask.DoesNotExist:
            return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            complete_task(task=task, completed_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Task marked complete.'})


class SubmitJourneyTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        try:
            task = JourneyTask.objects.get(
                id=task_id, phase__journey__developer=request.user)
        except JourneyTask.DoesNotExist:
            return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            submit_task_for_verification(task=task, submitted_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Submitted for manager verification.'})


class VerifyJourneyTaskView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOfDeveloper]

    def post(self, request, task_id):
        task = get_object_or_404(JourneyTask, id=task_id)
        # triggers IsManagerOfDeveloper's object check
        self.check_object_permissions(request, task)

        try:
            verify_task(task=task, verified_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Task verified.'})


class SendBackJourneyTaskView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOfDeveloper]

    def post(self, request, task_id):
        task = get_object_or_404(JourneyTask, id=task_id)
        self.check_object_permissions(request, task)

        serializer = SendBackTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            send_back_task(task=task, reviewed_by=request.user,
                           reason=serializer.validated_data['reason'])
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Task sent back to developer.'})
