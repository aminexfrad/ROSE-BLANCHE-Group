"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import serializers
from shared.models import Candidat, OffreStage
from shared.serializers import OffreStageSerializer
from auth_service.models import User
from shared.security import SecurityValidator
from django.core.exceptions import ValidationError


class CandidatSerializer(serializers.ModelSerializer):
    """Serializer for Candidat model"""
    user = serializers.SerializerMethodField()
    demandes_restantes = serializers.ReadOnlyField()
    peut_soumettre = serializers.ReadOnlyField()
    
    class Meta:
        model = Candidat
        fields = [
            'id', 'user', 'nombre_demandes_soumises', 'nombre_demandes_max',
            'demandes_restantes', 'peut_soumettre', 'institut', 'specialite',
            'niveau', 'bio', 'linkedin_url', 'portfolio_url', 'is_active',
            'date_derniere_demande', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'nombre_demandes_soumises', 'demandes_restantes',
            'peut_soumettre', 'date_derniere_demande', 'created_at', 'updated_at'
        ]
    
    def get_user(self, obj):
        """Get user information"""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'nom': obj.user.nom,
            'prenom': obj.user.prenom,
            'telephone': obj.user.telephone,
            'date_joined': obj.user.date_joined,
            'last_login': obj.user.last_login
        }
    
    def validate_institut(self, value):
        """Validate institut field"""
        try:
            return SecurityValidator.validate_text(value, max_length=200, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_specialite(self, value):
        """Validate specialite field"""
        try:
            return SecurityValidator.validate_text(value, max_length=200, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_bio(self, value):
        """Validate bio field"""
        try:
            return SecurityValidator.validate_text(value, max_length=1000, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))


class CandidatCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Candidat with User"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100)
    telephone = serializers.CharField(max_length=20, required=True, allow_blank=False)
    
    class Meta:
        model = Candidat
        fields = [
            'email', 'password', 'nom', 'prenom', 'telephone',
            'institut', 'specialite', 'niveau', 'bio', 'linkedin_url', 'portfolio_url'
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
        if not value:
            raise serializers.ValidationError('Le numéro de téléphone est requis.')
        try:
            return SecurityValidator.validate_phone(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def create(self, validated_data):
        """Create User and Candidat"""
        # Extract user data
        user_data = {
            'email': validated_data['email'],
            'password': validated_data['password'],
            'nom': validated_data['nom'],
            'prenom': validated_data['prenom'],
            'telephone': validated_data['telephone'],
            'role': 'candidat'
        }
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create candidat profile
        candidat_data = {k: v for k, v in validated_data.items() 
                         if k not in ['email', 'password', 'nom', 'prenom', 'telephone']}
        candidat = Candidat.objects.create(user=user, **candidat_data)
        
        return candidat


class CandidatDashboardSerializer(serializers.ModelSerializer):
    """Serializer for candidat dashboard data"""
    demandes = serializers.SerializerMethodField()
    statistiques = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidat
        fields = ['demandes', 'statistiques']
    
    def get_demandes(self, obj):
        """Get all demandes for the candidate"""
        from shared.models import Demande
        return Demande.objects.filter(email=obj.user.email).values(
            'id', 'nom', 'prenom', 'email', 'type_stage', 'niveau', 'institut', 
            'specialite', 'status', 'created_at', 'updated_at'
        )
    
    def get_statistiques(self, obj):
        """Get candidate statistics based on candidat model data"""
        from shared.models import Demande
        demandes = Demande.objects.filter(email=obj.user.email)
        
        return {
            'total_demandes': obj.nombre_demandes_soumises,  # Use candidat's actual count
            'demandes_en_attente': demandes.filter(status='pending').count(),
            'demandes_acceptees': demandes.filter(status='approved').count(),
            'demandes_rejetees': demandes.filter(status='rejected').count(),
            'demandes_restantes': obj.demandes_restantes,  # Use candidat's calculated property
            'peut_soumettre': obj.peut_soumettre  # Use candidat's calculated property
        }
