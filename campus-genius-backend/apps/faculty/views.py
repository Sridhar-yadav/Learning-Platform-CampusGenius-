from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, logout
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, Q
from .models import (
    Course, Meeting,
    Note, VideoLecture, Assignment, Resource,
    AITool, AIToolUsage, FacultyProfile, Lecture
)
from apps.quiz.models import Quiz, Question, Choice
from .serializers import (
    CourseSerializer, AssignmentSerializer,
    ResourceSerializer, AIToolSerializer, AIToolUsageSerializer,
    FacultyDashboardSerializer, FacultyProfileSerializer,
    FacultySettingsSerializer, FacultyProfileUpdateSerializer,
    FacultyUserUpdateSerializer, CourseDetailSerializer,
    LectureSerializer
)
from apps.student.serializers import (
    NoteSerializer, MeetingSerializer, VideoLectureSerializer
)
from apps.quiz.serializers import (
    QuizSerializer, QuestionSerializer, ChoiceSerializer
)
from apps.student.models import (
    QuizSubmission, AssignmentSubmission,
    Enrollment, VideoProgress
)

User = get_user_model()

class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'faculty'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class FacultyDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get(self, request):
        try:
            courses = Course.objects.filter(faculty=request.user)
            enrollments = Enrollment.objects.filter(course__in=courses)
            
            # Course analytics
            course_analytics = courses.annotate(
                total_students=Count('enrollments'),
                avg_attendance=Avg('meetings__attendance__is_present'),
                completion_rate=Avg('videos__progress__is_completed')
            )
            
            # Assignment analytics
            assignment_analytics = Assignment.objects.filter(
                course__in=courses
            ).annotate(
                submissions_count=Count('submissions'),
                avg_score=Avg('submissions__score')
            )
            
            # Quiz analytics
            quiz_analytics = Quiz.objects.filter(
                course__in=courses
            ).annotate(
                submissions_count=Count('submissions'),
                avg_score=Avg('submissions__score')
            )
            
            data = {
                'total_courses': courses.count(),
                'total_students': enrollments.count(),
                'active_assignments': Assignment.objects.filter(
                    course__in=courses,
                    due_date__gt=timezone.now()
                ).count(),
                'upcoming_meetings': Meeting.objects.filter(
                    course__in=courses,
                    start_time__gt=timezone.now()
                ).order_by('start_time')[:5],
                'recent_submissions': AssignmentSubmission.objects.filter(
                    assignment__course__in=courses
                ).order_by('-submitted_at')[:5],
                'course_analytics': course_analytics,
                'assignment_analytics': assignment_analytics,
                'quiz_analytics': quiz_analytics
            }
            
            serializer = FacultyDashboardSerializer(data)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Course.objects.filter(faculty=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(faculty=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.is_published = True
        course.save()
        return Response({'status': 'course published'})
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        course = self.get_object()
        data = {
            'total_students': course.enrollments.count(),
            'completion_rate': course.videos.aggregate(
                avg=Avg('progress__is_completed')
            )['avg'],
            'assignment_stats': course.assignments.annotate(
                submissions_count=Count('submissions'),
                avg_score=Avg('submissions__score')
            ),
            'quiz_stats': course.quiz_app_quizzes.annotate(
                submissions_count=Count('submissions'),
                avg_score=Avg('submissions__score')
            )
        }
        return Response(data)

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Quiz.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        quiz.is_published = True
        quiz.save()
        return Response({'status': 'quiz published'})
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        quiz = self.get_object()
        submissions = QuizSubmission.objects.filter(quiz=quiz)
        data = {
            'total_submissions': submissions.count(),
            'avg_score': submissions.aggregate(avg=Avg('score'))['avg'],
            'question_analysis': quiz.questions.annotate(
                correct_count=Count('answers', filter=Q(answers__is_correct=True)),
                total_attempts=Count('answers')
            )
        }
        return Response(data)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Question.objects.filter(quiz__created_by=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure the quiz belongs to the user
        quiz = serializer.validated_data.get('quiz')
        if quiz and quiz.created_by != self.request.user:
            raise permissions.PermissionDenied("You cannot add questions to this quiz.")
        serializer.save()

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = Meeting.objects.filter(created_by=self.request.user)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def record(self, request, pk=None):
        meeting = self.get_object()
        meeting.is_recorded = True
        meeting.recording_url = request.data.get('recording_url')
        meeting.save()
        return Response({'status': 'recording saved'})

class AIToolViewSet(viewsets.ModelViewSet):
    serializer_class = AIToolSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return AITool.objects.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        tool = self.get_object()
        input_data = request.data.get('input_data', {})
        
        # Process based on tool type
        if tool.tool_type == 'code_review':
            output_data = self._process_code_review(input_data)
        elif tool.tool_type == 'plagiarism':
            output_data = self._process_plagiarism_check(input_data)
        elif tool.tool_type == 'grading':
            output_data = self._process_auto_grading(input_data)
        elif tool.tool_type == 'feedback':
            output_data = self._process_feedback_generation(input_data)
        else:
            output_data = self._process_analytics(input_data)
        
        # Save usage
        AIToolUsage.objects.create(
            tool=tool,
            user=request.user,
            course_id=request.data.get('course_id'),
            input_data=input_data,
            output_data=output_data
        )
        
        return Response(output_data)

class AIToolUsageViewSet(viewsets.ModelViewSet):
    serializer_class = AIToolUsageSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return AIToolUsage.objects.filter(user=self.request.user)
    
    def _process_code_review(self, input_data):
        # Implement code review logic
        return {
            'score': 85,
            'feedback': 'Good code structure but needs better error handling',
            'suggestions': ['Add input validation', 'Improve error messages']
        }
    
    def _process_plagiarism_check(self, input_data):
        # Implement plagiarism check logic
        return {
            'similarity_score': 15,
            'matches': [],
            'report': 'No significant plagiarism detected'
        }
    
    def _process_auto_grading(self, input_data):
        # Implement auto grading logic
        return {
            'score': 90,
            'feedback': 'Well done!',
            'breakdown': {
                'correctness': 40,
                'efficiency': 30,
                'style': 20
            }
        }
    
    def _process_feedback_generation(self, input_data):
        # Implement feedback generation logic
        return {
            'feedback': 'Excellent work! Your solution demonstrates a good understanding of the concepts.',
            'suggestions': ['Consider adding more comments', 'Try to optimize the algorithm further']
        }
    
    def _process_analytics(self, input_data):
        # Implement analytics logic
        return {
            'performance_metrics': {
                'avg_score': 85,
                'completion_rate': 90,
                'engagement_score': 75
            },
            'recommendations': [
                'Consider adding more practice exercises',
                'Schedule a review session for topic X'
            ]
        }

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Note.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class VideoLectureViewSet(viewsets.ModelViewSet):
    serializer_class = VideoLectureSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return VideoLecture.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class CourseListView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Course.objects.filter(faculty=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(faculty=self.request.user)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return Course.objects.filter(faculty=self.request.user)
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class LectureListView(generics.ListCreateAPIView):
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Lecture.objects.filter(course__faculty=self.request.user, course_id=course_id)
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs.get('course_id'), faculty=self.request.user)
        serializer.save(course=course)
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        # Allow filtering by course_id via query params if needed, or return all for user
        course_id = self.request.query_params.get('course_id')
        queryset = Assignment.objects.filter(course__faculty=self.request.user)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def perform_create(self, serializer):
        # Course logic might need adjustment if course is passed in body
        serializer.save() # Validation should handle course ownership
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = Resource.objects.filter(course__faculty=self.request.user)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class QuizListView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Quiz.objects.filter(course__faculty=self.request.user, course_id=course_id)
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs.get('course_id'), faculty=self.request.user)
        serializer.save(course=course)
    
    def handle_exception(self, exc):
        return Response(
            {'error': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class FacultyProfileViewSet(viewsets.ModelViewSet):
    serializer_class = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        return FacultyProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        profile, created = FacultyProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = FacultyProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FacultySettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]
    
    def get(self, request):
        serializer = FacultySettingsSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        user_serializer = FacultyUserUpdateSerializer(request.user, data=request.data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
            
            profile_data = request.data.get('profile', {})
            profile = request.user.faculty_profile
            profile_serializer = FacultyProfileUpdateSerializer(profile, data=profile_data, partial=True)
            
            if profile_serializer.is_valid():
                profile_serializer.save()
                return Response({
                    'user': user_serializer.data,
                    'profile': profile_serializer.data
                })
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FacultyLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request):
        logout(request)
        return Response({'status': 'successfully logged out'})

import google.generativeai as genai
import json
import os
from django.conf import settings

class AIProcessingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request):
        try:
            action = request.data.get('action')
            file = request.FILES.get('file')
            course_id = request.data.get('course_id')

            if not file or not action:
                return Response({'error': 'File and action are required'}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Save file as Resource (MySQL)
            # Find or create a default course if course_id is missing (optional logic)
            # For now, we require course_id or just fail if not present, but let's be flexible
            course = None
            if course_id:
                course = get_object_or_404(Course, id=course_id, faculty=request.user)

            # If no course, we can't save a Resource efficiently linked to functionality. 
            # But the requirement might be "upload for this session". 
            # Let's assume for now we save it if we have a course, otherwise just process it.
            
            resource = None
            if course:
                resource = Resource.objects.create(
                    course=course,
                    title=f"AI Upload - {file.name}",
                    description=f"Uploaded for {action}",
                    resource_type='document',
                    file=file,
                    is_public=False
                )
            
            # 2. Process with Gemini
            api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY'))
            if not api_key:
                return Response({'error': 'AI configuration missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create a temporary file to handle the upload for Gemini
            import tempfile
            suffix = os.path.splitext(file.name)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                for chunk in file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            try:
                # Upload to Gemini
                uploaded_file = genai.upload_file(tmp_path, mime_type=file.content_type)
                
                # Wait for file to be active (usually instant for small files, but good practice)
                # Note: For very large files, might need polling. 1.5 Flash is fast.

                if action == 'summarize':
                    prompt = "Summarize the following content in a clear, concise manner."
                    response = model.generate_content([prompt, uploaded_file])
                    
                    return Response({
                        'type': 'summary',
                        'content': response.text,
                        'file_url': resource.file.url if resource else None
                    })

                elif action == 'generate-quiz':
                    prompt = (
                        "Generate 5 multiple choice questions based on the uploaded file. "
                        "Return ONLY a valid JSON array with this structure: "
                        '[{ "question_text": "...", "question_type": "mcq", "marks": 1, "choices": [{ "choice_text": "...", "is_correct": true/false }] }]. '
                    )
                    response = model.generate_content([prompt, uploaded_file])
                    
                    # Clean markdown code blocks if Gemini wraps JSON in ```json ... ```
                    text = response.text.replace('```json', '').replace('```', '').strip()
                    questions_data = json.loads(text)

                    # Create Quiz in MySQL
                    if not course:
                        # Allow returning questions without saving if no course
                        return Response({
                            'type': 'quiz',
                            'content': text, # Return generic content for frontend to parse or show
                            'questions': questions_data,
                            'message': 'Quiz generated (preview only - select a course to save)' 
                        })

                    quiz = Quiz.objects.create(
                        title=f"AI Generated Quiz - {file.name}",
                        description="Automatically generated from uploaded content",
                        course=course,
                        time_limit=30,
                        total_marks=sum(q.get('marks', 1) for q in questions_data),
                        created_by=request.user,
                        is_published=False,
                        shuffle_questions=True
                    )

                    for i, q_data in enumerate(questions_data):
                        question = Question.objects.create(
                            quiz=quiz,
                            question_text=q_data['question_text'],
                            question_type='mcq',
                            marks=q_data.get('marks', 1),
                            order=i + 1
                        )
                        for c_data in q_data.get('choices', []):
                            Choice.objects.create(
                                question=question,
                                choice_text=c_data['choice_text'],
                                is_correct=c_data['is_correct']
                            )

                    return Response({
                        'type': 'quiz',
                        'quiz_id': quiz.id,
                        'title': quiz.title,
                        'content': response.text,
                        'message': 'Quiz generated successfully'
                    })

                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

            finally:
                # Cleanup temporary file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 