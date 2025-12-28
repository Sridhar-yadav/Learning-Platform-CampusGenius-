from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomRegisterView,
    CustomLoginView,
    UserProfileView,
    ChangePasswordView,
    UserListView,
    RoleBasedUserListView,
    CheckUserRoleView
)

urlpatterns = [
    path('register/', CustomRegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:role>/', RoleBasedUserListView.as_view(), name='role-based-user-list'),
    path('check-user/', CheckUserRoleView.as_view(), name='check-user'),
]