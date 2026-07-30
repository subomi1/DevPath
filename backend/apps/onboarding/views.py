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
