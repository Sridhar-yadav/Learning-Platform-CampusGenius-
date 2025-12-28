from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer as DJRegisterSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class LocalRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'role', 'username']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'profile_picture', 'bio', 'department', 'enrollment_number', 'faculty_id')
        read_only_fields = ('id', 'username', 'email', 'role')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra fields to the response body
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'profile_picture', 
                 'bio', 'department', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

from rest_framework.validators import UniqueValidator

class CustomRegisterSerializer(DJRegisterSerializer):
    email = serializers.EmailField(
        required=True, 
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that email already exists.")]
    )
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    department = serializers.CharField(max_length=100, required=False)

    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except serializers.ValidationError as e:
            print(f"DEBUG: Registration Validation Error: {e.detail}")
            raise e
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['role'] = self.validated_data.get('role', '')
        data['department'] = self.validated_data.get('department', '')
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get('role')
        user.department = self.cleaned_data.get('department')
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                return data
            raise serializers.ValidationError('Invalid email or password')
        raise serializers.ValidationError('Email and password are required') 