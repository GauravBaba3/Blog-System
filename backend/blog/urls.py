from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    BlogViewSet,
    MyBlogsView,
    LatestBlogsView,
    LikeToggleView,
    CommentListCreateView,
    CommentDeleteView,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('blogs', BlogViewSet, basename='blog')

# Specific blog paths MUST come before router to avoid slug conflicts
urlpatterns = [
    path('blogs/my/', MyBlogsView.as_view(), name='my-blogs'),
    path('blogs/latest/', LatestBlogsView.as_view(), name='latest-blogs'),
    path('blogs/<slug:slug>/like/', LikeToggleView.as_view(), name='blog-like'),
    path(
        'blogs/<slug:slug>/comments/',
        CommentListCreateView.as_view(),
        name='blog-comments',
    ),
    path('comments/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
    path('', include(router.urls)),
]
