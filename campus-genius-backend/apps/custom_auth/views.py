from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from dj_rest_auth.registration.views import RegisterView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    UserSerializer,
    CustomRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)

User = get_user_model()

class CustomRegisterView(RegisterView):
    # This view from dj-rest-auth handles registration.
    # We override it to use our serializer.
    serializer_class = CustomRegisterSerializer

class CustomLoginView(TokenObtainPairView):
    # Use SimpleJWT's view but with our serializer that includes role in response
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()

class RoleBasedUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        role = self.kwargs.get('role')
        if self.request.user.role == 'admin':
            return User.objects.filter(role=role)
        return User.objects.none()

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )

class CheckUserRoleView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            return Response({
                'exists': True,
                'role': user.role
            })
        except User.DoesNotExist:
            return Response({
                'exists': False
            })