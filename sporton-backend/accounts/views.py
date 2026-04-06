from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import GoogleLoginSerializer, LoginSerializer, RegisterSerializer

User = get_user_model()


def user_to_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'fullName': user.full_name or user.get_full_name(),
        'email': user.email,
        'provider': user.provider,
        'avatar': None,
    }


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'user': user_to_payload(user),
                **tokens_for_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response(
            {
                'user': user_to_payload(user),
                **tokens_for_user(user),
            },
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        full_name = serializer.validated_data.get('full_name') or ''
        google_sub = serializer.validated_data.get('google_sub') or None
        username = serializer.validated_data.get('username') or None

        user = None
        if google_sub:
            user = User.objects.filter(provider='google', google_sub=google_sub).first()
        if not user and email:
            user = User.objects.filter(email__iexact=email).first()

        if not user:
            # Create new user (ensure unique username)
            base_username = username or email.split('@')[0] or 'google_user'
            candidate = base_username
            i = 1
            while User.objects.filter(username=candidate).exists():
                i += 1
                candidate = f'{base_username}{i}'

            user = User.objects.create_user(
                username=candidate,
                email=email,
                password=None,
                full_name=full_name,
                provider='google',
                google_sub=google_sub,
            )
        else:
            user.provider = 'google'
            user.full_name = full_name or user.full_name
            user.email = user.email or email
            if google_sub:
                user.google_sub = google_sub
            user.save()

        return Response(
            {
                'user': user_to_payload(user),
                **tokens_for_user(user),
            },
            status=status.HTTP_200_OK,
        )

from django.shortcuts import render

# Create your views here.
