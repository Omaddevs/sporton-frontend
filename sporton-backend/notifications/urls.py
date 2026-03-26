from django.urls import path

from .views import (
    AdminSendNotificationView,
    NotificationsListView,
    NotificationsMarkReadView,
)

urlpatterns = [
    path('', NotificationsListView.as_view(), name='notifications_list'),
    path('mark-read/', NotificationsMarkReadView.as_view(), name='notifications_mark_read'),
    path('admin/send/', AdminSendNotificationView.as_view(), name='admin_send_notifications'),
]

