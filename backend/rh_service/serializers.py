"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import serializers
from .models import InternKpiEvaluation
from auth_service.serializers import UserSerializer
from shared.serializers import StageSerializer

class InternKpiEvaluationSerializer(serializers.ModelSerializer):
    """Serializer pour les évaluations KPI des stagiaires"""
    
    # Informations du stagiaire
    intern_name = serializers.CharField(source='intern.get_full_name', read_only=True)
    intern_email = serializers.EmailField(source='intern.email', read_only=True)
    
    # Informations de l'évaluateur
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    
    # Informations du stage
    stage_title = serializers.CharField(source='stage.title', read_only=True)
    
    # Détails des scores avec poids
    score_details = serializers.SerializerMethodField()
    weights_summary = serializers.SerializerMethodField()
    
    # Catégorie de potentiel
    interpretation_display = serializers.CharField(source='get_interpretation_display', read_only=True)
    
    class Meta:
        model = InternKpiEvaluation
        fields = [
            'id', 'intern', 'intern_name', 'intern_email',
            'evaluator', 'evaluator_name', 'stage', 'stage_title',
            'evaluation_date', 'delivery_satisfaction_rate', 'deadline_respect_rate',
            'learning_capacity', 'initiative_taking', 'professional_behavior',
            'adaptability', 'total_score', 'interpretation', 'interpretation_display',
            'comments', 'created_at', 'updated_at', 'score_details', 'weights_summary'
        ]
        read_only_fields = ['id', 'total_score', 'interpretation', 'created_at', 'updated_at']
    
    def get_score_details(self, obj):
        """Retourner les détails des scores avec poids"""
        return obj.get_score_details
    
    def get_weights_summary(self, obj):
        """Retourner le résumé des poids"""
        return obj.get_weights_summary
    
    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que l'évaluateur est bien un RH
        if data.get('evaluator') and data['evaluator'].role != 'rh':
            raise serializers.ValidationError("L'évaluateur doit être un responsable RH")
        
        # Vérifier que le stagiaire est bien un stagiaire
        if data.get('intern') and data['intern'].role != 'stagiaire':
            raise serializers.ValidationError("L'intern doit être un stagiaire")
        
        # Vérifier que les notes sont entre 0 et 5
        kpi_fields = [
            'delivery_satisfaction_rate', 'deadline_respect_rate', 'learning_capacity',
            'initiative_taking', 'professional_behavior', 'adaptability'
        ]
        
        for field in kpi_fields:
            if field in data and (data[field] < 0 or data[field] > 5):
                raise serializers.ValidationError(f"La note pour {field} doit être entre 0 et 5")
        
        return data

class InternKpiEvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'évaluations KPI"""
    intern_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = InternKpiEvaluation
        fields = [
            'intern_id', 'stage', 'evaluation_date', 'delivery_satisfaction_rate',
            'deadline_respect_rate', 'learning_capacity', 'initiative_taking',
            'professional_behavior', 'adaptability', 'comments'
        ]
    
    def validate_intern_id(self, value):
        """Valider que l'intern_id correspond à un stagiaire valide"""
        from auth_service.models import User
        try:
            intern = User.objects.get(id=value, role='stagiaire')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Stagiaire non trouvé")
    
    def create(self, validated_data):
        """Créer l'évaluation avec l'évaluateur automatiquement"""
        from auth_service.models import User
        
        # Récupérer l'intern à partir de l'intern_id
        intern_id = validated_data.pop('intern_id')
        intern = User.objects.get(id=intern_id, role='stagiaire')
        
        # Vérifier si une évaluation existe déjà pour ce stagiaire
        existing_evaluation = InternKpiEvaluation.get_existing_evaluation(intern)
        if existing_evaluation:
            raise serializers.ValidationError(
                f"Une évaluation KPI existe déjà pour le stagiaire {intern.get_full_name()}. "
                "Vous pouvez modifier l'évaluation existante au lieu d'en créer une nouvelle."
            )
        
        # L'évaluateur est automatiquement l'utilisateur connecté
        validated_data['evaluator'] = self.context['request'].user
        validated_data['intern'] = intern
        
        return super().create(validated_data)

class InternKpiEvaluationUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour d'évaluations KPI"""
    
    class Meta:
        model = InternKpiEvaluation
        fields = [
            'evaluation_date', 'delivery_satisfaction_rate', 'deadline_respect_rate',
            'learning_capacity', 'initiative_taking', 'professional_behavior',
            'adaptability', 'comments'
        ]

class InternKpiEvaluationListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des évaluations KPI"""
    
    intern_name = serializers.CharField(source='intern.get_full_name', read_only=True)
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    stage_title = serializers.CharField(source='stage.title', read_only=True)
    interpretation_display = serializers.CharField(source='get_interpretation_display', read_only=True)
    
    class Meta:
        model = InternKpiEvaluation
        fields = [
            'id', 'intern_name', 'evaluator_name', 'stage_title',
            'evaluation_date', 'total_score', 'interpretation_display', 'created_at'
        ]

class InternKpiEvaluationDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une évaluation KPI"""
    
    intern = UserSerializer(read_only=True)
    evaluator = UserSerializer(read_only=True)
    stage = StageSerializer(read_only=True)
    score_details = serializers.SerializerMethodField()
    weights_summary = serializers.SerializerMethodField()
    interpretation_display = serializers.CharField(source='get_interpretation_display', read_only=True)
    
    class Meta:
        model = InternKpiEvaluation
        fields = '__all__'
    
    def get_score_details(self, obj):
        return obj.get_score_details
    
    def get_weights_summary(self, obj):
        return obj.get_weights_summary
