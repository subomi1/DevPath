from django.shortcuts import get_object_or_404
from apps.accounts.permissions import IsManagerOfDeveloper, IsAdmin
from apps.accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import DeveloperJourney, JourneyTask, OnboardingTemplate, TemplatePhase, TemplateTask
from .serializers import DeveloperJourneySerializer, OnboardingTemplateSerializer, SendBackTaskSerializer, OnboardingTemplateDetailSerializer, OnboardingTemplateWriteSerializer, TemplatePhaseSerializer, TemplateTaskWriteSerializer
from .services import recalculate_progress, submit_task_for_verification, verify_task, send_back_task, complete_task, reorder_items


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


class DeveloperJourneyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        developer = get_object_or_404(User, id=user_id, role='developer')

        is_their_manager = request.user.role == 'manager' and developer.manager_id == request.user.id
        is_hr_or_admin = request.user.role in ('hr', 'admin')

        if not (is_their_manager or is_hr_or_admin):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        journey = DeveloperJourney.objects.filter(developer=developer).first()

        return Response({
            'developer': {
                'id': developer.id,
                'full_name': developer.full_name,
                'email': developer.email,
                'job_role': developer.job_role,
                'start_date': developer.start_date,
            },
            'journey': DeveloperJourneySerializer(journey).data if journey else None,
        })


class PendingVerificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'manager':
            return Response([])

        tasks = JourneyTask.objects.filter(
            phase__journey__developer__manager=request.user,
            status='completed',
            verification_type='manager_verified',
        ).select_related('phase__journey__developer')

        data = [{
            'id': str(t.id),
            'title': t.title,
            'category': t.category,
            'developer_id': str(t.phase.journey.developer.id),
            'developer_name': t.phase.journey.developer.full_name,
        } for t in tasks]

        return Response(data)


class OnboardingTemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = OnboardingTemplate.objects.filter(is_active=True)
        return Response(OnboardingTemplateDetailSerializer(templates, many=True).data)
    
class OnboardingTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        template = get_object_or_404(OnboardingTemplate, id=template_id)
        phases = TemplatePhase.objects.filter(template=template).prefetch_related('tasks').order_by('order')

        return Response({
            'id': template.id,
            'name': template.name,
            'target_role': template.target_role,
            'description': template.description,
            'phases': [
                {
                    'id': phase.id,
                    'name': phase.name,
                    'tasks': [
                        {'id': t.id, 'title': t.title, 'category': t.category, 'verification_type': t.verification_type}
                        for t in phase.tasks.order_by('order')
                    ],
                }
                for phase in phases
            ],
        })
        
class OnboardingTemplateCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = OnboardingTemplateWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        template = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OnboardingTemplateUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, template_id):
        template = get_object_or_404(OnboardingTemplate, id=template_id)
        serializer = OnboardingTemplateWriteSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TemplatePhaseCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = TemplatePhaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phase = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TemplatePhaseDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, phase_id):
        phase = get_object_or_404(TemplatePhase, id=phase_id)
        serializer = TemplatePhaseSerializer(phase, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, phase_id):
        phase = get_object_or_404(TemplatePhase, id=phase_id)
        phase.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReorderPhasesView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        reorder_items(model_class=TemplatePhase, id_order_pairs=request.data)
        return Response({'message': 'Reordered.'})


class TemplateTaskCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = TemplateTaskWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TemplateTaskDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, task_id):
        task = get_object_or_404(TemplateTask, id=task_id)
        serializer = TemplateTaskWriteSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, task_id):
        task = get_object_or_404(TemplateTask, id=task_id)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReorderTasksView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        reorder_items(model_class=TemplateTask, id_order_pairs=request.data)
        return Response({'message': 'Reordered.'})
