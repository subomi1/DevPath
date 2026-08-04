from django.urls import path
from .views import (
    AccessRequestListCreateView, AccessRequestDetailView, MarkUnderReviewView,
    ApproveAccessRequestView, RejectAccessRequestView, CompleteAccessRequestView
)

urlpatterns = [
    path('access-requests/', AccessRequestListCreateView.as_view(), name='access-request-list-create'),
    path('access-requests/<uuid:request_id>/', AccessRequestDetailView.as_view(), name='access-request-detail'),
    path('access-requests/<uuid:request_id>/under-review/', MarkUnderReviewView.as_view(), name='access-request-under-review'),
    path('access-requests/<uuid:request_id>/approve/', ApproveAccessRequestView.as_view(), name='access-request-approve'),
    path('access-requests/<uuid:request_id>/reject/', RejectAccessRequestView.as_view(), name='access-request-reject'),
    path('access-requests/<uuid:request_id>/complete/', CompleteAccessRequestView.as_view(), name='access-request-complete'),
]