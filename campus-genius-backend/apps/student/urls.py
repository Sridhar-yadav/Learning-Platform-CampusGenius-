from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register(r'quiz-submissions', views.QuizSubmissionViewSet, basename='quiz-submission')
router.register(r'meeting-attendance', views.MeetingAttendanceViewSet, basename='meeting-attendance')
router.register(r'note-views', views.NoteViewViewSet, basename='note-view')
router.register(r'video-progress', views.VideoProgressViewSet, basename='video-progress')
router.register(r'assignment-submissions', views.AssignmentSubmissionViewSet, basename='assignment-submission')
router.register(r'study-groups', views.StudyGroupViewSet, basename='study-group')
router.register(r'study-group-messages', views.StudyGroupMessageViewSet, basename='study-group-message')
router.register(r'learning-paths', views.LearningPathViewSet, basename='learning-path')
router.register(r'doubts', views.DoubtViewSet, basename='doubt')
router.register(r'notes', views.StudentNoteViewSet, basename='student-note')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),
] 