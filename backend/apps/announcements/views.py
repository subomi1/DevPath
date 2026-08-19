from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Announcement
from .serializers import AnnouncementSerializer, CreateAnnouncementSerializer, ReadStatsSerializer
from .services import get_visible_announcements, mark_as_read, get_read_stats, notify_audience


class AnnouncementListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = get_visible_announcements(user=request.user)

        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        if request.query_params.get('unread') == 'true':
            queryset = queryset.exclude(reads__user=request.user)

        serializer = AnnouncementSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if request.user.role not in ('manager', 'hr', 'admin'):
            return Response({'detail': 'You do not have permission to publish announcements.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateAnnouncementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # a manager can only publish to their own team, never a wider scope
        if request.user.role == 'manager' and data['audience_scope'] not in ('manager_team', 'team'):
            return Response(
                {'detail': 'Managers can only publish to their own team.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        announcement = Announcement.objects.create(author=request.user, **data)
        notify_audience(announcement=announcement)
        return Response(
            AnnouncementSerializer(announcement, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AnnouncementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, announcement_id):
        announcement = get_object_or_404(Announcement, id=announcement_id)
        mark_as_read(announcement=announcement, user=request.user)  # opening it marks it read

        return Response(AnnouncementSerializer(announcement, context={'request': request}).data)

    def patch(self, request, announcement_id):
        announcement = get_object_or_404(Announcement, id=announcement_id)

        is_author = announcement.author_id == request.user.id
        is_admin = request.user.role == 'admin'
        if not (is_author or is_admin):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        for field in ('title', 'body', 'category'):
            if field in request.data:
                setattr(announcement, field, request.data[field])
        announcement.save()

        return Response(AnnouncementSerializer(announcement, context={'request': request}).data)

    def delete(self, request, announcement_id):
        announcement = get_object_or_404(Announcement, id=announcement_id)

        is_author = announcement.author_id == request.user.id
        is_admin = request.user.role == 'admin'
        if not (is_author or is_admin):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        announcement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AnnouncementReadStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, announcement_id):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can view read statistics.'}, status=status.HTTP_403_FORBIDDEN)

        announcement = get_object_or_404(Announcement, id=announcement_id)
        stats = get_read_stats(announcement=announcement)

        return Response(ReadStatsSerializer(stats).data)