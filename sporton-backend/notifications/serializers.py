from rest_framework import serializers

from .models import Notification, NotificationRecipient


class NotificationListSerializer(serializers.ModelSerializer):
    isRead = serializers.SerializerMethodField()
    readAt = serializers.SerializerMethodField()
    fromUser = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at')

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'createdAt', 'isRead', 'readAt', 'fromUser']

    def get_isRead(self, obj):
        user = self.context.get('request').user
        rec = NotificationRecipient.objects.filter(notification=obj, user=user).only('is_read').first()
        return bool(rec and rec.is_read)

    def get_readAt(self, obj):
        user = self.context.get('request').user
        rec = NotificationRecipient.objects.filter(notification=obj, user=user).only('read_at').first()
        return rec.read_at if rec else None

    def get_fromUser(self, obj):
        if not obj.from_user:
            return None
        return {'id': obj.from_user_id, 'username': obj.from_user.username}


class AdminSendSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=120, required=False, default='Bildirishnoma')
    message = serializers.CharField()

