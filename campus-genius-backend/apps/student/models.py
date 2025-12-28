from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from apps.faculty.models import (
    Course, Meeting, Note,
    VideoLecture, Assignment, Resource
)
from apps.quiz.models import Quiz, Question

User = get_user_model()

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    last_accessed = models.DateTimeField(auto_now=True)
    progress = models.FloatField(default=0.0)
    grade = models.CharField(max_length=2, null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'course')
    
    def __str__(self):
        return f"{self.student.email} - {self.course.code}"

class AssignmentSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignment_submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    submission_text = models.TextField(null=True, blank=True)
    code_submission = models.TextField(null=True, blank=True)
    file_submission = models.FileField(upload_to='assignment_submissions/', null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    is_late = models.BooleanField(default=False)
    late_penalty = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=[
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('resubmitted', 'Resubmitted')
    ], default='submitted')
    
    def __str__(self):
        return f"{self.student.email} - {self.assignment.title}"

class QuizSubmission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_submissions')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    time_taken = models.IntegerField(null=True, blank=True)  # in seconds
    attempt_number = models.IntegerField(default=1)
    is_completed = models.BooleanField(default=False)
    feedback = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'quiz', 'attempt_number')
    
    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} - Attempt {self.attempt_number}"

class Answer(models.Model):
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(null=True, blank=True)
    code_submission = models.TextField(null=True, blank=True)
    file_submission = models.FileField(upload_to='quiz_submissions/', null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Answer for {self.question.question_text}"

class MeetingAttendance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meeting_attendance')
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='attendance')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_present = models.BooleanField(default=True)
    duration = models.IntegerField(null=True, blank=True)  # in seconds
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'meeting')
    
    def __str__(self):
        return f"{self.student.email} - {self.meeting.title}"

class NoteView(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='note_views')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    is_bookmarked = models.BooleanField(default=False)
    personal_notes = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)  # 1-5 stars
    
    class Meta:
        unique_together = ('student', 'note')
    
    def __str__(self):
        return f"{self.student.email} - {self.note.title}"

class VideoProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(VideoLecture, on_delete=models.CASCADE, related_name='progress')
    started_at = models.DateTimeField(auto_now_add=True)
    last_position = models.IntegerField(default=0)  # in seconds
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    watch_time = models.IntegerField(default=0)  # in seconds
    notes = models.TextField(null=True, blank=True)
    speed = models.FloatField(default=1.0)  # playback speed
    
    class Meta:
        unique_together = ('student', 'video')
    
    def __str__(self):
        return f"{self.student.email} - {self.video.title}"

class StudyGroup(models.Model):
    name = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_groups')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='study_groups')
    description = models.TextField()
    is_private = models.BooleanField(default=False)
    max_members = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.course.code}"

class StudyGroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_messages')
    message = models.TextField()
    file = models.FileField(upload_to='group_messages/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.sender.email} - {self.group.name}"

class LearningPath(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_paths')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='learning_paths')
    current_topic = models.CharField(max_length=200)
    progress = models.JSONField(default=dict)
    recommended_resources = models.ManyToManyField(Resource)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.email} - {self.course.code}"

class Doubt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doubts')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='doubts')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved')
    ], default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.email} - {self.title}" 