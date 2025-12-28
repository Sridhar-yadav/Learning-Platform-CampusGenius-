from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, Q, F, Sum
from .models import (
    Enrollment, QuizSubmission, Answer, MeetingAttendance,
    NoteView, VideoProgress, AssignmentSubmission,
    StudyGroup, StudyGroupMessage, LearningPath, Doubt
)
from apps.faculty.models import (
    Course, Meeting, Note,
    VideoLecture, Assignment, Resource
)
from apps.quiz.models import Quiz, Question, QuizAttempt
from .serializers import (
    EnrollmentSerializer, QuizSubmissionSerializer,
    AnswerSerializer, MeetingAttendanceSerializer,
    NoteViewSerializer, VideoProgressSerializer,
    AssignmentSubmissionSerializer, StudyGroupSerializer,
    StudyGroupMessageSerializer, LearningPathSerializer,
    DoubtSerializer, StudentDashboardSerializer
)

User = get_user_model()

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        try:
            enrollments = Enrollment.objects.filter(student=request.user, is_active=True)
            courses = Course.objects.filter(enrollments__in=enrollments)
            
            # Course analytics
            course_analytics = courses.annotate(
                progress=Avg('enrollments__progress', filter=Q(enrollments__student=request.user)),
                grade=Avg('enrollments__grade', filter=Q(enrollments__student=request.user))
            )
            
            # Assignment analytics
            assignment_analytics = Assignment.objects.filter(
                course__in=courses
            ).annotate(
                submission_status=Count('submissions', filter=Q(submissions__student=request.user)),
                score=Avg('submissions__score', filter=Q(submissions__student=request.user))
            )
            
            # Quiz analytics
            quiz_analytics = Quiz.objects.filter(
                course__in=courses
            ).annotate(
                submission_status=Count('quizattempt', filter=Q(quizattempt__student=request.user)),
                score=Avg('quizattempt__score', filter=Q(quizattempt__student=request.user))
            )

            # Completed quizzes logic
            completed_quizzes_count = QuizAttempt.objects.filter(
                student=request.user,
                completed_at__isnull=False
            ).count()
            
            # Video progress
            video_progress = VideoProgress.objects.filter(
                student=request.user,
                video__course__in=courses
            ).aggregate(
                total_watch_time=Sum('watch_time'),
                completed_videos=Count('id', filter=Q(is_completed=True))
            )
            
            data = {
                'enrolled_courses': courses.count(),
                'active_assignments': Assignment.objects.filter(
                    course__in=courses,
                    due_date__gt=timezone.now()
                ).count(),
                'completed_quizzes': completed_quizzes_count,
                'study_groups': StudyGroup.objects.filter(members=request.user).count(),
                'upcoming_meetings': Meeting.objects.filter(
                    course__in=courses,
                    start_time__gt=timezone.now()
                ).order_by('start_time')[:5],
                'recent_submissions': AssignmentSubmission.objects.filter(
                    student=request.user
                ).order_by('-submitted_at')[:5],
                'course_analytics': course_analytics,
                'assignment_analytics': assignment_analytics,
                'quiz_analytics': quiz_analytics,
                'video_progress': video_progress,
                'learning_paths': LearningPath.objects.filter(
                    student=request.user,
                    course__in=courses
                ),
                'recent_doubts': Doubt.objects.filter(
                    student=request.user,
                    course__in=courses
                ).order_by('-created_at')[:5],
                 # Adding required fields for serializer usually expected but missing in previous code
                 'recent_courses': courses[:5],
                 'upcoming_assignments': Assignment.objects.filter(course__in=courses, due_date__gt=timezone.now())[:5],
                 'recent_quizzes': Quiz.objects.filter(course__in=courses)[:5]
            }
            
            serializer = StudentDashboardSerializer(data)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = request.data.get('progress')
        if progress is not None:
            enrollment.progress = progress
            enrollment.save()
            return Response({'status': 'progress updated'})
        return Response(
            {'error': 'progress is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

class QuizSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return QuizSubmission.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        submission = self.get_object()
        question_id = request.data.get('question_id')
        answer_data = request.data.get('answer')
        
        if not question_id or not answer_data:
            return Response(
                {'error': 'question_id and answer are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question = get_object_or_404(Question, id=question_id)
        answer = Answer.objects.create(
            submission=submission,
            question=question,
            **answer_data
        )
        
        return Response(AnswerSerializer(answer).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        submission = self.get_object()
        if submission.is_completed:
            return Response(
                {'error': 'quiz already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.is_completed = True
        submission.submitted_at = timezone.now()
        submission.time_taken = (timezone.now() - submission.started_at).seconds
        
        # Calculate score
        total_questions = submission.quiz.questions.count()
        correct_answers = submission.answers.filter(is_correct=True).count()
        submission.score = (correct_answers / total_questions) * 100
        
        submission.save()
        return Response({'status': 'quiz completed', 'score': submission.score})

class MeetingAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return MeetingAttendance.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        attendance = self.get_object()
        if attendance.left_at:
            return Response(
                {'error': 'already left the meeting'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.left_at = timezone.now()
        attendance.duration = (attendance.left_at - attendance.joined_at).seconds
        attendance.save()
        
        return Response({'status': 'left meeting', 'duration': attendance.duration})

class NoteViewViewSet(viewsets.ModelViewSet):
    serializer_class = NoteViewSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return NoteView.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        note_view = self.get_object()
        note_view.is_bookmarked = not note_view.is_bookmarked
        note_view.save()
        return Response({'status': 'bookmark toggled', 'is_bookmarked': note_view.is_bookmarked})
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        note_view = self.get_object()
        rating = request.data.get('rating')
        if rating is not None and 1 <= rating <= 5:
            note_view.rating = rating
            note_view.save()
            return Response({'status': 'rating updated'})
        return Response(
            {'error': 'rating must be between 1 and 5'},
            status=status.HTTP_400_BAD_REQUEST
        )

class VideoProgressViewSet(viewsets.ModelViewSet):
    serializer_class = VideoProgressSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return VideoProgress.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_position(self, request, pk=None):
        progress = self.get_object()
        position = request.data.get('position')
        if position is not None:
            progress.last_position = position
            progress.watch_time += 1  # Assuming 1 second increment
            progress.save()
            return Response({'status': 'position updated'})
        return Response(
            {'error': 'position is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        progress = self.get_object()
        if progress.is_completed:
            return Response(
                {'error': 'video already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        progress.is_completed = True
        progress.completed_at = timezone.now()
        progress.save()
        
        # Update course progress
        enrollment = Enrollment.objects.get(
            student=self.request.user,
            course=progress.video.course
        )
        total_videos = VideoLecture.objects.filter(course=progress.video.course).count()
        completed_videos = VideoProgress.objects.filter(
            student=self.request.user,
            video__course=progress.video.course,
            is_completed=True
        ).count()
        enrollment.progress = (completed_videos / total_videos) * 100
        enrollment.save()
        
        return Response({'status': 'video completed'})

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return AssignmentSubmission.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)
        
        # Check if submission is late
        if submission.submitted_at > submission.assignment.due_date:
            submission.is_late = True
            submission.late_penalty = submission.assignment.late_submission_penalty
            submission.save()
    
    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        submission = self.get_object()
        if submission.status != 'graded':
            return Response(
                {'error': 'can only resubmit graded assignments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.submission_text = request.data.get('submission_text')
        submission.code_submission = request.data.get('code_submission')
        submission.file_submission = request.data.get('file_submission')
        submission.status = 'resubmitted'
        submission.save()
        
        return Response({'status': 'assignment resubmitted'})

class StudyGroupViewSet(viewsets.ModelViewSet):
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return StudyGroup.objects.filter(
            Q(members=self.request.user) | Q(created_by=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        if group.members.count() >= group.max_members:
            return Response(
                {'error': 'group is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group.members.add(self.request.user)
        return Response({'status': 'joined group'})
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        group = self.get_object()
        if group.created_by == self.request.user:
            return Response(
                {'error': 'creator cannot leave the group'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group.members.remove(self.request.user)
        return Response({'status': 'left group'})

class StudyGroupMessageViewSet(viewsets.ModelViewSet):
    serializer_class = StudyGroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return StudyGroupMessage.objects.filter(
            group__members=self.request.user
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class LearningPathViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return LearningPath.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        learning_path = self.get_object()
        topic = request.data.get('topic')
        progress = request.data.get('progress')
        
        if topic and progress is not None:
            learning_path.current_topic = topic
            learning_path.progress = progress
            learning_path.save()
            return Response({'status': 'progress updated'})
        return Response(
            {'error': 'topic and progress are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

class DoubtViewSet(viewsets.ModelViewSet):
    serializer_class = DoubtSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return Doubt.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        doubt = self.get_object()
        if doubt.status == 'resolved':
            return Response(
                {'error': 'doubt already resolved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        doubt.status = 'resolved'
        doubt.resolved_at = timezone.now()
        doubt.save()
        
        return Response({'status': 'doubt resolved'})

from .serializers import NoteSerializer
from apps.custom_auth.serializers import UserProfileSerializer
from apps.faculty.models import Note

from rest_framework.parsers import MultiPartParser, FormParser

class StudentNoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        return Note.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 