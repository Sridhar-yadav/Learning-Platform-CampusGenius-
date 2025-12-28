from rest_framework import serializers
from .models import (
    Enrollment, AssignmentSubmission,
    QuizSubmission, StudyGroup,
    StudyGroupMessage, Answer, MeetingAttendance, NoteView, VideoProgress, Doubt,
    LearningPath
)
from apps.faculty.serializers import (
    CourseSerializer, AssignmentSerializer
)
from apps.quiz.serializers import QuizSerializer
from apps.faculty.models import Note, Meeting, VideoLecture

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},
            'course': {'read_only': True, 'required': False}
        }

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class VideoLectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLecture
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('enrolled_at',)

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer(read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = ('submitted_at',)

class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    
    class Meta:
        model = QuizSubmission
        fields = '__all__'
        read_only_fields = ('submitted_at',)

class StudyGroupSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyGroup
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members.count()

class StudyGroupMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    
    class Meta:
        model = StudyGroupMessage
        fields = '__all__'
        read_only_fields = ('created_at',)

class StudentDashboardSerializer(serializers.Serializer):
    enrolled_courses = serializers.IntegerField()
    active_assignments = serializers.IntegerField()
    completed_quizzes = serializers.IntegerField()
    study_groups = serializers.IntegerField()
    recent_courses = CourseSerializer(many=True)
    upcoming_assignments = AssignmentSerializer(many=True)
    recent_quizzes = QuizSerializer(many=True)

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'submission', 'question', 'selected_choice', 
                 'text_answer', 'is_correct', 'marks_obtained']

class MeetingAttendanceSerializer(serializers.ModelSerializer):
    meeting = MeetingSerializer(read_only=True)
    
    class Meta:
        model = MeetingAttendance
        fields = ['id', 'meeting', 'student', 'joined_at', 'left_at', 'duration']
        read_only_fields = ['student', 'joined_at', 'left_at', 'duration']

class NoteViewSerializer(serializers.ModelSerializer):
    note = NoteSerializer(read_only=True)
    
    class Meta:
        model = NoteView
        fields = ['id', 'note', 'student', 'viewed_at']
        read_only_fields = ['student', 'viewed_at']

class VideoProgressSerializer(serializers.ModelSerializer):
    video = VideoLectureSerializer(read_only=True)
    
    class Meta:
        model = VideoProgress
        fields = ['id', 'video', 'student', 'current_time', 
                 'is_completed', 'last_watched']
        read_only_fields = ['student', 'last_watched']

class DoubtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doubt
        fields = ['id', 'student', 'course', 'title', 'description', 
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['student', 'created_at', 'updated_at']

class LearningPathSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'student', 'course', 'current_topic', 'progress', 
                 'recommended_resources', 'last_updated']
        read_only_fields = ['student', 'last_updated'] 