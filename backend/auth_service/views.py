"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .serializers import (
    UserSerializer, LoginSerializer, UserUpdateSerializer,
    ChangePasswordSerializer
)
from .models import User


class LoginView(TokenObtainPairView):
    """Custom login view that returns user profile with tokens"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.save()
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout view that blacklists the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        logout(request)
        return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Erreur lors de la déconnexion'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Mot de passe modifié avec succès'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated and return profile"""
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data
    })
