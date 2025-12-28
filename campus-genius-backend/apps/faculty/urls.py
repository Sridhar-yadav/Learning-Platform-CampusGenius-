from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    CourseViewSet, QuizViewSet, QuestionViewSet, MeetingViewSet,
    NoteViewSet, VideoLectureViewSet, AssignmentViewSet, ResourceViewSet,
    AIToolViewSet, AIToolUsageViewSet, FacultyProfileViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'videos', VideoLectureViewSet, basename='video-lecture')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'ai-tools', AIToolViewSet, basename='ai-tool')
router.register(r'ai-usage', AIToolUsageViewSet, basename='ai-usage')
router.register(r'profile', FacultyProfileViewSet, basename='faculty-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.FacultyDashboardView.as_view(), name='faculty-dashboard'),
    path('settings/', views.FacultySettingsView.as_view(), name='faculty-settings'),
    path('logout/', views.FacultyLogoutView.as_view(), name='faculty-logout'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/lectures/', views.LectureListView.as_view(), name='lecture-list'),
    path('courses/<int:course_id>/assignments/', views.AssignmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='assignment-list'),
    path('courses/<int:course_id>/resources/', views.ResourceViewSet.as_view({'get': 'list', 'post': 'create'}), name='resource-list'),
    path('courses/<int:course_id>/quizzes/', views.QuizListView.as_view(), name='quiz-list'),
    path('ai/process/', views.AIProcessingView.as_view(), name='ai-process'),
] 