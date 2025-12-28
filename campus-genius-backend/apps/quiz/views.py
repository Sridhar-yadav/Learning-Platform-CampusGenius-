from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Avg, Q
from .models import Quiz, Question, Choice, QuizAttempt, StudentAnswer
from .serializers import (
    QuizSerializer, QuestionSerializer, ChoiceSerializer,
    QuizAttemptSerializer, StudentAnswerSerializer
)

class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'faculty'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'faculty':
            return Quiz.objects.filter(created_by=self.request.user)
        return Quiz.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        if quiz.created_by != request.user:
            return Response({"error": "You don't have permission to publish this quiz"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        quiz.is_published = True
        quiz.save()
        return Response({"status": "Quiz published successfully"})

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        quiz = self.get_object()
        if quiz.created_by != request.user:
            return Response({"error": "You don't have permission to view results"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        attempts = QuizAttempt.objects.filter(quiz=quiz)
        total_attempts = attempts.count()
        avg_score = attempts.aggregate(avg_score=Avg('score'))['avg_score']
        pass_rate = attempts.filter(is_passed=True).count() / total_attempts if total_attempts > 0 else 0
        
        return Response({
            "total_attempts": total_attempts,
            "average_score": avg_score,
            "pass_rate": pass_rate,
            "attempts": QuizAttemptSerializer(attempts, many=True).data
        })

    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        quiz = self.get_object()
        if not quiz.is_published:
            return Response({"error": "This quiz is not published yet"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has exceeded max attempts
        current_attempts = QuizAttempt.objects.filter(
            quiz=quiz, 
            student=request.user
        ).count()
        
        if current_attempts >= quiz.max_attempts and not quiz.allow_retake:
            return Response({"error": "Maximum attempts reached"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has an active attempt
        active_attempt = QuizAttempt.objects.filter(
            quiz=quiz, 
            student=request.user,
            completed_at__isnull=True
        ).first()
        
        if active_attempt:
            return Response({"error": "You already have an active attempt"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=request.user,
            attempt_number=current_attempts + 1
        )
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        quiz = self.get_object()
        attempt = QuizAttempt.objects.filter(
            quiz=quiz, 
            student=request.user, 
            completed_at__isnull=True
        ).first()
        
        if not attempt:
            return Response({"error": "No active attempt found"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        answers_data = request.data.get('answers', [])
        total_marks = 0
        earned_marks = 0

        for answer_data in answers_data:
            question = Question.objects.get(id=answer_data['question_id'])
            answer = StudentAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=answer_data.get('selected_option'),
                text_answer=answer_data.get('text_answer'),
                code_answer=answer_data.get('code_answer')
            )
            
            # For MCQ questions, check if the answer is correct
            if question.question_type == 'mcq':
                correct_choice = question.choices.filter(is_correct=True).first()
                if correct_choice and answer.selected_option == correct_choice.choice_text:
                    answer.is_correct = True
                    answer.marks_obtained = question.marks
                    earned_marks += question.marks
            
            # For other question types, marks will be assigned by faculty later
            answer.save()
            total_marks += question.marks

        score = (earned_marks / total_marks) * 100 if total_marks > 0 else 0
        attempt.score = score
        attempt.is_passed = score >= 60  # Assuming 60% is passing score
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response({
            "score": score,
            "is_passed": attempt.is_passed,
            "total_marks": total_marks,
            "earned_marks": earned_marks
        })

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'faculty':
            return QuizAttempt.objects.filter(quiz__created_by=self.request.user)
        return QuizAttempt.objects.filter(student=self.request.user)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        attempt = self.get_object()
        if attempt.quiz.created_by != request.user:
            return Response({"error": "You don't have permission to grade this attempt"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        answers_data = request.data.get('answers', [])
        total_marks = 0
        earned_marks = 0

        for answer_data in answers_data:
            answer = StudentAnswer.objects.get(
                id=answer_data['answer_id'],
                attempt=attempt
            )
            marks = answer_data.get('marks_obtained', 0)
            feedback = answer_data.get('feedback', '')
            
            answer.marks_obtained = marks
            answer.feedback = feedback
            answer.save()
            
            earned_marks += marks
            total_marks += answer.question.marks

        score = (earned_marks / total_marks) * 100 if total_marks > 0 else 0
        attempt.score = score
        attempt.is_passed = score >= 60  # Assuming 60% is passing score
        attempt.save()

        return Response({
            "score": score,
            "is_passed": attempt.is_passed,
            "total_marks": total_marks,
            "earned_marks": earned_marks
        })
