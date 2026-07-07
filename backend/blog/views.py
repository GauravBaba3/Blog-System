from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Category, Blog, Comment, Like
from .serializers import (
    CategorySerializer,
    BlogListSerializer,
    BlogDetailSerializer,
    BlogWriteSerializer,
    CommentSerializer,
)
from .permissions import IsAuthorOrReadOnly, IsCommentAuthor


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET  /api/categories/        — list categories (public)
    POST /api/categories/        — create category (auth)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class BlogViewSet(viewsets.ModelViewSet):
    """
    Blog CRUD with search, filter, and pagination.

    GET    /api/blogs/              — list (public)
    POST   /api/blogs/              — create (auth)
    GET    /api/blogs/{slug}/       — detail (public)
    PUT    /api/blogs/{slug}/       — full update (author)
    PATCH  /api/blogs/{slug}/       — partial update (author)
    DELETE /api/blogs/{slug}/       — delete (author)

    Query params: ?search=, ?category=slug, ?ordering=-created_at, ?page=
    """
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def get_queryset(self):
        user = self.request.user
        if self.action in ('retrieve', 'update', 'partial_update', 'destroy') and user.is_authenticated:
            queryset = Blog.objects.filter(
                Q(is_published=True) | Q(author=user)
            ).select_related('author', 'category').prefetch_related('likes', 'comments')
        else:
            queryset = Blog.objects.filter(is_published=True).select_related(
                'author', 'category'
            ).prefetch_related('likes', 'comments')

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__username=author)

        return queryset

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return BlogWriteSerializer
        if self.action == 'retrieve':
            return BlogDetailSerializer
        return BlogListSerializer


class MyBlogsView(generics.ListAPIView):
    """
    GET /api/blogs/my/
    Returns all blogs written by the logged-in user.
    """
    serializer_class = BlogListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Blog.objects.filter(author=self.request.user).select_related(
            'author', 'category'
        ).prefetch_related('likes', 'comments')


class LatestBlogsView(generics.ListAPIView):
    """
    GET /api/blogs/latest/
    Returns the 5 most recent published posts.
    """
    serializer_class = BlogListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Blog.objects.filter(is_published=True).select_related(
            'author', 'category'
        ).prefetch_related('likes', 'comments')[:5]


class LikeToggleView(APIView):
    """
    POST   /api/blogs/{slug}/like/  — like a blog
    DELETE /api/blogs/{slug}/like/  — unlike a blog
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        blog = get_object_or_404(Blog, slug=slug, is_published=True)
        like, created = Like.objects.get_or_create(user=request.user, blog=blog)
        if not created:
            return Response(
                {'message': 'Already liked.'},
                status=status.HTTP_200_OK,
            )
        return Response(
            {'message': 'Blog liked.', 'likes_count': blog.likes_count},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, slug):
        blog = get_object_or_404(Blog, slug=slug, is_published=True)
        deleted, _ = Like.objects.filter(user=request.user, blog=blog).delete()
        if not deleted:
            return Response(
                {'message': 'You have not liked this blog.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'message': 'Blog unliked.', 'likes_count': blog.likes_count},
            status=status.HTTP_200_OK,
        )


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/blogs/{slug}/comments/  — list comments
    POST /api/blogs/{slug}/comments/  — add comment
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        blog = get_object_or_404(Blog, slug=self.kwargs['slug'], is_published=True)
        return blog.comments.select_related('author')

    def perform_create(self, serializer):
        blog = get_object_or_404(Blog, slug=self.kwargs['slug'], is_published=True)
        serializer.save(author=self.request.user, blog=blog)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['blog'] = get_object_or_404(
            Blog, slug=self.kwargs['slug'], is_published=True
        )
        return context


class CommentDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/comments/{id}/
    Delete your own comment.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentAuthor]
