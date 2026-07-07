from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Category, Blog, Comment, Like


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')


class BlogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog list pages."""

    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = (
            'id',
            'title',
            'slug',
            'excerpt',
            'author',
            'category',
            'featured_image',
            'is_published',
            'likes_count',
            'comments_count',
            'is_liked',
            'created_at',
            'updated_at',
        )

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, blog=obj).exists()
        return False


class BlogDetailSerializer(BlogListSerializer):
    """Full blog detail including content."""

    class Meta(BlogListSerializer.Meta):
        fields = BlogListSerializer.Meta.fields + ('content',)


class BlogWriteSerializer(serializers.ModelSerializer):
    """Create and update blog posts."""

    class Meta:
        model = Blog
        fields = (
            'slug',
            'title',
            'content',
            'excerpt',
            'category',
            'featured_image',
            'is_published',
        )
        read_only_fields = ('slug',)

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'content', 'author', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['blog'] = self.context['blog']
        return super().create(validated_data)
