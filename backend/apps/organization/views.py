from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Department, Team
from .serializers import DepartmentSerializer, TeamSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.accounts.permissions import IsAdmin


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(DepartmentSerializer(Department.objects.all(), many=True).data)


class TeamListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Team.objects.all()
        department_id = request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        return Response(TeamSerializer(queryset, many=True).data)
    
class DepartmentCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        department = serializer.save()
        return Response(DepartmentSerializer(department).data, status=status.HTTP_201_CREATED)


class DepartmentDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, department_id):
        department = get_object_or_404(Department, id=department_id)
        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, department_id):
        department = get_object_or_404(Department, id=department_id)
        if department.teams.exists():
            return Response(
                {'detail': f'Cannot delete — {department.teams.count()} team(s) still belong to this department.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = TeamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)


class TeamDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)
        serializer = TeamSerializer(team, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, team_id):
        from apps.accounts.models import User
        team = get_object_or_404(Team, id=team_id)
        member_count = User.objects.filter(team=team).count()
        if member_count > 0 and request.query_params.get('confirm') != 'true':
            return Response(
                {'detail': f'{member_count} member(s) belong to this team.', 'member_count': member_count},
                status=status.HTTP_409_CONFLICT,
            )
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)