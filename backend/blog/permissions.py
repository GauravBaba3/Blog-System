from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Allow edits only if the user is the author of the blog post."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsCommentAuthor(permissions.BasePermission):
    """Allow delete only if the user wrote the comment."""

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user
