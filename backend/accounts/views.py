from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
    UserSerializer,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Include user info in the login response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns JWT access + refresh tokens and user info.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Creates a new user and auto-creates their profile via signal.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Registration successful. Please log in.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET    /api/auth/profile/  — view profile
    PUT    /api/auth/profile/  — full update
    PATCH  /api/auth/profile/  — partial update
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Requires old password and new password confirmation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Client-side logout — instruct frontend to delete tokens from localStorage.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'message': 'Logged out successfully.'})


class PublicProfileView(generics.RetrieveAPIView):
    """
    GET /api/auth/profile/<username>/  — public profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return user.profile
