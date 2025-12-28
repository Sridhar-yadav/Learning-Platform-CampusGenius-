from django.db import models
from django.contrib.auth import get_user_model
# from apps.core.models import Course
from django.conf import settings
from django.utils import timezone

User = get_user_model()

class FacultyProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    department = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='faculty_profiles', null=True, blank=True)
    office_location = models.CharField(max_length=100, blank=True)
    office_hours = models.JSONField(default=dict)  # Store office hours as JSON
    contact_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    social_links = models.JSONField(default=dict)  # Store social media links as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.designation}"

class Course(models.Model):
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    faculty = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    is_published = models.BooleanField(default=False)
    enrollment_key = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

    def __str__(self):
        return f"{self.code} - {self.title}"

class Meeting(models.Model):

    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='meetings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    meeting_link = models.URLField()
    is_recorded = models.BooleanField(default=False)
    recording_url = models.URLField(null=True, blank=True)
    meeting_type = models.CharField(max_length=20, choices=[
        ('lecture', 'Lecture'),
        ('discussion', 'Discussion'),
        ('workshop', 'Workshop'),
        ('office_hours', 'Office Hours')
    ])
    agenda = models.TextField(null=True, blank=True)
    materials = models.ManyToManyField('Resource', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.course.code}"

class Note(models.Model):
    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    file = models.FileField(upload_to='notes/')
    description = models.TextField()
    is_public = models.BooleanField(default=False)
    version = models.IntegerField(default=1)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.course.code}"

class VideoLecture(models.Model):
    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    video_file = models.FileField(upload_to='videos/')
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='video_thumbnails/', null=True, blank=True)
    duration = models.IntegerField(help_text="Duration in seconds")
    is_preview = models.BooleanField(default=False)
    transcript = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.course.code}"

class Lecture(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_url = models.URLField(blank=True, null=True)
    slides_url = models.URLField(blank=True, null=True)
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(help_text="Duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    total_marks = models.IntegerField()
    submission_type = models.CharField(max_length=20, choices=[
        ('text', 'Text Submission'),
        ('file', 'File Upload'),
        ('code', 'Code Submission')
    ])
    allow_late_submission = models.BooleanField(default=False)
    late_submission_penalty = models.IntegerField(default=0)
    rubric = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('document', 'Document'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('code', 'Code'),
        ('other', 'Other'),
    )
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    tags = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"

class AITool(models.Model):
    TOOL_TYPES = (
        ('code_review', 'Code Review'),
        ('plagiarism', 'Plagiarism Check'),
        ('grading', 'Auto Grading'),
        ('feedback', 'Feedback Generation'),
        ('analytics', 'Learning Analytics'),
    )
    
    name = models.CharField(max_length=100)
    tool_type = models.CharField(max_length=20, choices=TOOL_TYPES)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_tool_type_display()}"

class AIToolUsage(models.Model):
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    input_data = models.JSONField()
    output_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tool.name} - {self.user.email}" 