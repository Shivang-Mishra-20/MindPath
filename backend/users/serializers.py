"""
Users app serializers.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'department', 'avatar_initials']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data returned after login."""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class LoginSerializer(serializers.Serializer):
    """Serializer for login credentials."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
