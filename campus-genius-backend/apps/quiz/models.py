from django.db import models
from django.contrib.auth import get_user_model
from apps.faculty.models import Course

User = get_user_model()

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quiz_app_quizzes')
    description = models.TextField()
    time_limit = models.IntegerField(help_text="Time limit in minutes")
    total_marks = models.IntegerField()
    is_published = models.BooleanField(default=False)
    allow_retake = models.BooleanField(default=False)
    max_attempts = models.IntegerField(default=1)
    show_correct_answers = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('text', 'Text Answer'),
        ('code', 'Code Submission'),
        ('file', 'File Upload'),
    )
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    marks = models.IntegerField()
    order = models.IntegerField()
    code_language = models.CharField(max_length=20, null=True, blank=True)
    code_template = models.TextField(null=True, blank=True)
    test_cases = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.choice_text} ({'Correct' if self.is_correct else 'Incorrect'})"

class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    is_passed = models.BooleanField(default=False)
    attempt_number = models.IntegerField(default=1)

    class Meta:
        unique_together = ('quiz', 'student', 'attempt_number')

    def __str__(self):
        return f"{self.student.username}'s attempt {self.attempt_number} on {self.quiz.title}"

class StudentAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, null=True, blank=True)
    text_answer = models.TextField(null=True, blank=True)
    code_answer = models.TextField(null=True, blank=True)
    file_answer = models.FileField(upload_to='quiz_submissions/', null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.FloatField(default=0)
    feedback = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Answer for {self.question.question_text}"
