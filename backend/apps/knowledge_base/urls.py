from django.urls import path
from .views import (
    CategoryListView, TagListView, ArticleListCreateView,
    ArticleDetailView, ArticleAttachmentView, AttachmentDeleteView
)

urlpatterns = [
    path('kb/categories/', CategoryListView.as_view(), name='kb-categories'),
    path('kb/tags/', TagListView.as_view(), name='kb-tags'),
    path('kb/articles/', ArticleListCreateView.as_view(),
         name='kb-article-list-create'),
    path('kb/articles/<slug:slug>/',
         ArticleDetailView.as_view(), name='kb-article-detail'),
    path('kb/articles/<slug:slug>/attachments/',
         ArticleAttachmentView.as_view(), name='kb-article-attachments'),
    path('kb/attachments/<uuid:attachment_id>/',
         AttachmentDeleteView.as_view(), name='kb-attachment-delete'),
]
