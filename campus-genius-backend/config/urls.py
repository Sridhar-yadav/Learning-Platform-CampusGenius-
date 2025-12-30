"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "status": "ok", 
        "message": "Campus Genius Backend is running",
        "version": "1.0.0"
    })

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Django Rest Framework
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    # Django AllAuth
    path('accounts/', include('allauth.urls')),
    
    # Your apps
    path('auth/', include('apps.custom_auth.urls')),
    path('api/faculty/', include('apps.faculty.urls')),
    path('api/student/', include('apps.student.urls')),
    path('api/chat/', include('apps.chat_service.urls')),
    path('api/', include('apps.quiz.urls')), # Mount request at root for api/quizzes
    # path('api/core/', include('apps.core.urls')),
    # path('api/common/', include('apps.common.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
