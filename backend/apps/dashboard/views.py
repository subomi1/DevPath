from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.accounts.models import User
from apps.onboarding.models import JourneyTask
from apps.access_request.models import AccessRequest

from apps.onboarding.models import DeveloperJourney, JourneyTask
from apps.onboarding.serializers import JourneyTaskSerializer
from apps.access_request.models import AccessRequest
from apps.announcements.services import get_visible_announcements
from apps.announcements.serializers import AnnouncementSerializer


class DeveloperDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            journey = DeveloperJourney.objects.get(developer=user)
        except DeveloperJourney.DoesNotExist:
            journey = None

        # "today's tasks" = anything current or due today, not yet done
        today_tasks = []
        if journey:
            today_tasks = JourneyTask.objects.filter(
                phase__journey=journey,
                status__in=['current', 'upcoming'],
            ).order_by('order')[:5]

        open_access_requests = AccessRequest.objects.filter(
            developer=user
        ).exclude(status__in=['completed', 'rejected'])

        recent_announcements = get_visible_announcements(user=user)[:3]

        return Response({
            'overall_progress': journey.overall_progress if journey else 0,
            'today_tasks': JourneyTaskSerializer(today_tasks, many=True).data,
            'today_tasks_count': len(today_tasks),
            'open_access_requests_count': open_access_requests.count(),
            'mentor': {
                'id': user.mentor_id,
                'full_name': user.mentor.full_name if user.mentor else None,
            },
            'recent_announcements': AnnouncementSerializer(
                recent_announcements, many=True, context={'request': request}
            ).data,
        })


class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        manager = request.user
        reports = User.objects.filter(manager=manager)

        roster = []
        for dev in reports:
            journey = DeveloperJourney.objects.filter(developer=dev).first()
            roster.append({
                'id': dev.id,
                'full_name': dev.full_name,
                'job_role': dev.job_role,
                'overall_progress': journey.overall_progress if journey else 0,
            })

        overdue_tasks = JourneyTask.objects.filter(
            phase__journey__developer__manager=manager,
            due_date__lt=timezone.now().date(),
        ).exclude(status__in=['completed', 'verified'])

        pending_task_verifications = JourneyTask.objects.filter(
            phase__journey__developer__manager=manager,
            status='completed',
            verification_type='manager_verified',
        )

        pending_access_requests = AccessRequest.objects.filter(
            developer__manager=manager,
        ).exclude(status__in=['completed', 'rejected'])

        avg_progress = 0
        if roster:
            avg_progress = round(sum(r['overall_progress']
                                 for r in roster) / len(roster))

        return Response({
            'assigned_developers_count': reports.count(),
            'average_progress': avg_progress,
            'overdue_tasks_count': overdue_tasks.count(),
            'pending_approvals_count': pending_task_verifications.count() + pending_access_requests.count(),
            'roster': roster,
        })


class HRDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_onboardings = DeveloperJourney.objects.filter(
            completed_at__isnull=True)
        pending_activations = User.objects.filter(
            role='developer', status='pending_activation')
        completed_this_month = DeveloperJourney.objects.filter(
            completed_at__year=timezone.now().year,
            completed_at__month=timezone.now().month,
        )

        onboardings_table = []
        for journey in active_onboardings.select_related('developer'):
            onboardings_table.append({
                'developer_id': journey.developer.id,
                'full_name': journey.developer.full_name,
                'department': journey.developer.department.name if journey.developer.department else None,
                'progress': journey.overall_progress,
            })

        return Response({
            'active_onboardings_count': active_onboardings.count(),
            'pending_activations_count': pending_activations.count(),
            'completed_this_month_count': completed_this_month.count(),
            'onboardings': onboardings_table,
        })


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users_by_role = {
            role: User.objects.filter(role=role).count()
            for role, _ in User.ROLE_CHOICES
        }

        return Response({
            'users_by_role': users_by_role,
            'total_users': User.objects.count(),
        })
