from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, NotificationRecipient
from .serializers import AdminSendSerializer, NotificationListSerializer

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(request.user.is_staff or request.user.is_superuser or request.user.username == 'admin')


class NotificationsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(recipients__user=request.user).distinct().order_by('-created_at')
        serializer = NotificationListSerializer(qs, many=True, context={'request': request})
        # Frontend wants newest first.
        return Response({'items': serializer.data, 'count': len(serializer.data)}, status=status.HTTP_200_OK)


class NotificationsMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get('ids', None)
        now = timezone.now()

        recs = NotificationRecipient.objects.filter(user=request.user)
        if ids:
            recs = recs.filter(notification_id__in=ids)

        recs = recs.filter(is_read=False)
        recs.update(is_read=True, read_at=now)
        return Response({'ok': True}, status=status.HTTP_200_OK)


class AdminSendNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        title = serializer.validated_data.get('title') or 'Bildirishnoma'
        message = serializer.validated_data['message']

        notification = Notification.objects.create(
            title=title,
            message=message,
            from_user=request.user if request.user.is_authenticated else None,
        )

        users = User.objects.all()
        NotificationRecipient.objects.bulk_create(
            [NotificationRecipient(notification=notification, user=u) for u in users],
            batch_size=200,
        )

        return Response({'ok': True, 'notificationId': notification.id}, status=status.HTTP_201_CREATED)

from django.shortcuts import render

# Create your views here.
