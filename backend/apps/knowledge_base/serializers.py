from rest_framework import serializers
from .models import Category, Tag, Article, Attachment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'filename', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'filename', 'file_size', 'uploaded_at']


class ArticleListSerializer(serializers.ModelSerializer):
    """Lighter shape for the article grid — no full body, keeps list responses small."""
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'category', 'tags', 'author_name', 'excerpt', 'view_count', 'updated_at']

    def get_excerpt(self, obj):
        return obj.body[:200] + ('...' if len(obj.body) > 200 else '')


class ArticleDetailSerializer(serializers.ModelSerializer):
    """Full shape for the reading view — includes body and attachments."""
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category', 'tags', 'body', 'author_name',
            'view_count', 'created_at', 'updated_at', 'attachments',
        ]


class ArticleWriteSerializer(serializers.ModelSerializer):
    """Admin-only: create/edit an article."""
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)

    class Meta:
        model = Article
        fields = ['id', 'title', 'category', 'tags', 'body']
        read_only_fields = ['id']