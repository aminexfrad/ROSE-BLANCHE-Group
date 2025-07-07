from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'nom', 'prenom', 'role', 'telephone',
            'departement', 'institut', 'specialite', 'bio', 'avatar',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            if not user:
                raise serializers.ValidationError(
                    'Email ou mot de passe incorrect.'
                )
            if not user.is_active:
                raise serializers.ValidationError(
                    'Ce compte a été désactivé.'
                )
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Email et mot de passe sont requis.'
            )


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'nom', 'prenom', 'telephone', 'departement',
            'institut', 'specialite', 'bio', 'avatar'
        ]
    
    def validate_telephone(self, value):
        """Validate phone number format"""
        if value and len(value) < 8:
            raise serializers.ValidationError(
                'Le numéro de téléphone doit contenir au moins 8 chiffres.'
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                'L\'ancien mot de passe est incorrect.'
            )
        return value
    
    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user 