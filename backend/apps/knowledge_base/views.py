from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Category, Tag, Article, Attachment
from .serializers import (
    CategorySerializer, TagSerializer, ArticleListSerializer,
    ArticleDetailSerializer, ArticleWriteSerializer, AttachmentSerializer
)
from apps.accounts.permissions import IsAdmin


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CategorySerializer(Category.objects.all(), many=True).data)


class TagListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(TagSerializer(Tag.objects.all(), many=True).data)


class ArticleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Article.objects.select_related('category', 'author').prefetch_related('tags')

        category_slug = request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        tag = request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__name__iexact=tag)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(body__icontains=search))

        return Response(ArticleListSerializer(queryset.distinct(), many=True).data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can create articles.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ArticleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save(author=request.user)

        return Response(ArticleDetailSerializer(article).data, status=status.HTTP_201_CREATED)


class ArticleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        article = get_object_or_404(
            Article.objects.select_related('category', 'author').prefetch_related('tags', 'attachments'),
            slug=slug,
        )
        Article.objects.filter(id=article.id).update(view_count=article.view_count + 1)
        article.view_count += 1

        return Response(ArticleDetailSerializer(article).data)

    def patch(self, request, slug):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can edit articles.'}, status=status.HTTP_403_FORBIDDEN)

        article = get_object_or_404(Article, slug=slug)
        serializer = ArticleWriteSerializer(article, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(ArticleDetailSerializer(article).data)

    def delete(self, request, slug):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can delete articles.'}, status=status.HTTP_403_FORBIDDEN)

        article = get_object_or_404(Article, slug=slug)
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticleAttachmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can add attachments.'}, status=status.HTTP_403_FORBIDDEN)

        article = get_object_or_404(Article, slug=slug)
        serializer = AttachmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        attachment = serializer.save(article=article)

        return Response(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)