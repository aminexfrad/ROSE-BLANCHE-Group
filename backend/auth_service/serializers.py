"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from shared.security import SecurityValidator
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
    
    def validate_email(self, value):
        """Validate and sanitize email address"""
        try:
            return SecurityValidator.validate_email(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_nom(self, value):
        """Validate and sanitize nom field"""
        try:
            return SecurityValidator.validate_name(value, "nom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_prenom(self, value):
        """Validate and sanitize prenom field"""
        try:
            return SecurityValidator.validate_name(value, "prénom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_telephone(self, value):
        """Validate and sanitize telephone field"""
        try:
            return SecurityValidator.validate_phone(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_bio(self, value):
        """Validate and sanitize bio field"""
        try:
            return SecurityValidator.validate_text(value, max_length=500, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        """Validate and sanitize email address"""
        try:
            return SecurityValidator.validate_email(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Additional security check for password
            if len(password) < 8:
                raise serializers.ValidationError(
                    'Le mot de passe doit contenir au moins 8 caractères.'
                )
            
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
    
    def validate_nom(self, value):
        """Validate and sanitize nom field"""
        try:
            return SecurityValidator.validate_name(value, "nom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_prenom(self, value):
        """Validate and sanitize prenom field"""
        try:
            return SecurityValidator.validate_name(value, "prénom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_telephone(self, value):
        """Validate and sanitize telephone field"""
        try:
            return SecurityValidator.validate_phone(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_bio(self, value):
        """Validate and sanitize bio field"""
        try:
            return SecurityValidator.validate_text(value, max_length=500, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_avatar(self, value):
        """Validate avatar file upload"""
        if value:
            from shared.utils import FileUploadValidator
            allowed_types = ['image/jpeg', 'image/png', 'image/gif']
            max_size = 5 * 1024 * 1024  # 5MB
            
            try:
                FileUploadValidator.validate_file(value, allowed_types, max_size)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                'L\'ancien mot de passe est incorrect.'
            )
        return value
    
    def validate_new_password(self, value):
        # Security validation for new password
        if len(value) < 8:
            raise serializers.ValidationError(
                'Le nouveau mot de passe doit contenir au moins 8 caractères.'
            )
        
        # Check for common patterns that might indicate weak passwords
        if value.lower() in ['password', '123456', 'admin', 'user']:
            raise serializers.ValidationError(
                'Le mot de passe est trop simple. Veuillez choisir un mot de passe plus sécurisé.'
            )
        
        validate_password(value, self.context['request'].user)
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'nom', 'prenom', 'password', 'confirm_password',
            'telephone', 'departement', 'institut', 'specialite', 'role'
        ]
    
    def validate_email(self, value):
        """Validate and sanitize email address"""
        try:
            return SecurityValidator.validate_email(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_nom(self, value):
        """Validate and sanitize nom field"""
        try:
            return SecurityValidator.validate_name(value, "nom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_prenom(self, value):
        """Validate and sanitize prenom field"""
        try:
            return SecurityValidator.validate_name(value, "prénom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_telephone(self, value):
        """Validate and sanitize telephone field"""
        try:
            return SecurityValidator.validate_phone(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate(self, attrs):
        """Validate password confirmation"""
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError(
                'Les mots de passe ne correspondent pas.'
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with encrypted password"""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user 