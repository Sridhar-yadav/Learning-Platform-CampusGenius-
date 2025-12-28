from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkAsReadView,
    NotificationCountView,
    AnnouncementListView,
    FeedbackCreateView,
    SystemLogListView
)

urlpatterns = [
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/mark-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-read'),
    path('notifications/count/', NotificationCountView.as_view(), name='notification-count'),
    
    # Announcements
    path('announcements/', AnnouncementListView.as_view(), name='announcement-list'),
    
    # Feedback
    path('feedback/', FeedbackCreateView.as_view(), name='feedback-create'),
    
    # System Logs
    path('system-logs/', SystemLogListView.as_view(), name='system-log-list'),
] 