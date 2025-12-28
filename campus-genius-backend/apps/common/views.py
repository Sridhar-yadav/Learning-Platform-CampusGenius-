from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from .models import Notification, Announcement, Feedback, SystemLog
from .serializers import (
    NotificationSerializer, AnnouncementSerializer,
    FeedbackSerializer, SystemLogSerializer,
    NotificationCountSerializer
)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

class NotificationMarkAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        notification = Notification.objects.filter(
            id=notification_id,
            recipient=request.user
        ).first()
        
        if notification:
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'})
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )

class NotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user)
        total = notifications.count()
        unread = notifications.filter(is_read=False).count()
        by_type = notifications.values('notification_type').annotate(count=Count('id'))
        
        data = {
            'total': total,
            'unread': unread,
            'by_type': {item['notification_type']: item['count'] for item in by_type}
        }
        
        serializer = NotificationCountSerializer(data)
        return Response(serializer.data)

class AnnouncementListView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Announcement.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SystemLogListView(generics.ListAPIView):
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = SystemLog.objects.all().order_by('-created_at') 