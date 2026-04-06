from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    full_name = serializers.CharField(max_length=255, allow_blank=True, required=False)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def create(self, validated_data):
        username = validated_data['username']
        full_name = validated_data.get('full_name', '') or ''
        password = validated_data['password']
        user = User(username=username, full_name=full_name, provider='email')
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get('username'), password=attrs.get('password'))
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        attrs['user'] = user
        return attrs


class GoogleLoginSerializer(serializers.Serializer):
    """
    Dev-friendly endpoint. Frontend can send google user fields directly.
    For production you should verify id_token server-side.
    """

    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(max_length=255, allow_blank=True, required=False)
    google_sub = serializers.CharField(max_length=128, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)

