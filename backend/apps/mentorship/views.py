from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import MentorMeeting, MentorNote
from .serializers import (
    MentorMeetingSerializer, RequestMeetingSerializer, ScheduleMeetingSerializer,
    MentorNoteSerializer, CreateMentorNoteSerializer
)
from .services import request_meeting, schedule_meeting, complete_meeting, cancel_meeting


class MyMentorshipView(APIView):
    """Developer's own mentor summary: profile fields come from /users/me/,
    this endpoint adds meetings + visible notes/goals."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        meetings = MentorMeeting.objects.filter(developer=request.user)
        notes = MentorNote.objects.filter(developer=request.user, is_goal=True)  # visibility rule

        return Response({
            'mentor': {
                'id': request.user.mentor_id,
                'full_name': request.user.mentor.full_name if request.user.mentor else None,
                'email': request.user.mentor.email if request.user.mentor else None,
            },
            'meetings': MentorMeetingSerializer(meetings, many=True).data,
            'goals': MentorNoteSerializer(notes, many=True).data,
        })


class RequestMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.mentor:
            return Response({'detail': 'You do not have an assigned mentor.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RequestMeetingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        meeting = request_meeting(
            developer=request.user, mentor=request.user.mentor, **serializer.validated_data
        )
        return Response(MentorMeetingSerializer(meeting).data, status=status.HTTP_201_CREATED)


class MyMenteesView(APIView):
    """Mentor-facing: everyone this user mentors, with full notes (not just goals)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.accounts.models import User
        mentees = User.objects.filter(mentor=request.user)
        meetings = MentorMeeting.objects.filter(mentor=request.user)
        notes = MentorNote.objects.filter(mentor=request.user)

        return Response({
            'mentees': [{'id': m.id, 'full_name': m.full_name, 'email': m.email} for m in mentees],
            'meetings': MentorMeetingSerializer(meetings, many=True).data,
            'notes': MentorNoteSerializer(notes, many=True).data,
        })


class ScheduleMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, meeting_id):
        meeting = get_object_or_404(MentorMeeting, id=meeting_id, mentor=request.user)

        serializer = ScheduleMeetingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            schedule_meeting(meeting=meeting, **serializer.validated_data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MentorMeetingSerializer(meeting).data)


class CancelMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, meeting_id):
        # either party can cancel
        meeting = get_object_or_404(MentorMeeting, id=meeting_id)
        if request.user.id not in (meeting.developer_id, meeting.mentor_id):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            cancel_meeting(meeting=meeting, cancelled_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MentorMeetingSerializer(meeting).data)


class MentorNoteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateMentorNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        developer = serializer.validated_data['developer']
        if developer.mentor_id != request.user.id:
            return Response({'detail': 'You are not this developer\'s mentor.'}, status=status.HTTP_403_FORBIDDEN)

        note = MentorNote.objects.create(mentor=request.user, **serializer.validated_data)
        return Response(MentorNoteSerializer(note).data, status=status.HTTP_201_CREATED)