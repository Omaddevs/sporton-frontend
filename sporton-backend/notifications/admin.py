from django.contrib import admin

from .models import Notification, NotificationRecipient


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'from_user', 'created_at')
    search_fields = ('title', 'message')


@admin.register(NotificationRecipient)
class NotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ('id', 'notification', 'user', 'is_read', 'read_at')
    list_filter = ('is_read',)

