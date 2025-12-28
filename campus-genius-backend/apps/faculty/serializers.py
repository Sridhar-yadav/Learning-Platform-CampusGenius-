from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Meeting, Note,
    VideoLecture, Assignment, Resource, Lecture,
    AITool, AIToolUsage, FacultyProfile
)
from apps.quiz.models import Quiz, Question, Choice

User = get_user_model()

class FacultyDashboardSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    active_assignments = serializers.IntegerField()
    upcoming_meetings = serializers.ListField()
    recent_submissions = serializers.ListField()
    course_analytics = serializers.ListField()
    assignment_analytics = serializers.ListField()
    quiz_analytics = serializers.ListField()

class CourseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['faculty', 'created_at', 'updated_at']

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class AIToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITool
        fields = '__all__'

class AIToolUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIToolUsage
        fields = '__all__'

class FacultyProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'department', 'designation', 'specialization',
            'bio', 'profile_picture', 'office_location',
            'office_hours', 'contact_number', 'website',
            'social_links', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class FacultySettingsSerializer(serializers.ModelSerializer):
    profile = FacultyProfileSerializer(source='faculty_profile', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'profile', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined']

class FacultyProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = [
            'department', 'designation', 'specialization',
            'bio', 'profile_picture', 'office_location',
            'office_hours', 'contact_number', 'website',
            'social_links'
        ]

class FacultyUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']


# Serializers moved to apps.student.serializers to avoid circular imports:
# MeetingSerializer, NoteSerializer, VideoLectureSerializer
 