from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Department, Team
from .serializers import DepartmentSerializer, TeamSerializer


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