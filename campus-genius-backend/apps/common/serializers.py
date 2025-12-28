from rest_framework import serializers
from .models import Notification, Announcement, Feedback, SystemLog

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('created_at',)

class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = '__all__'
        read_only_fields = ('created_at',)

class NotificationCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    by_type = serializers.DictField(child=serializers.IntegerField()) 