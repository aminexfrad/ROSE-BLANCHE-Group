"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import serializers
from .models import Stage, Step, Document, Evaluation, KPIQuestion, Testimonial, Notification, PFEDocument, OffreStage

from auth_service.models import User
from auth_service.serializers import UserSerializer

class StageSerializer(serializers.ModelSerializer):
    stagiaire = UserSerializer(read_only=True)
    tuteur = UserSerializer(read_only=True)
    duration_days = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    steps_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()
    evaluations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Stage
        fields = '__all__'
    
    def get_steps_count(self, obj):
        return obj.steps.count()
    
    def get_documents_count(self, obj):
        return obj.documents.count()
    
    def get_evaluations_count(self, obj):
        return obj.evaluations.count()

class StageListSerializer(serializers.ModelSerializer):
    stagiaire = UserSerializer(read_only=True)
    tuteur = UserSerializer(read_only=True)
    duration_days = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Stage
        fields = ['id', 'title', 'company', 'location', 'status', 'progress', 
                 'start_date', 'end_date', 'duration_days', 'days_remaining',
                 'stagiaire', 'tuteur', 'created_at']

class StepSerializer(serializers.ModelSerializer):
    stage = StageSerializer(read_only=True)
    documents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Step
        fields = '__all__'
    
    def get_documents_count(self, obj):
        return obj.documents.count()

class StepListSerializer(serializers.ModelSerializer):
    stage = StageListSerializer(read_only=True)
    documents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Step
        fields = ['id', 'title', 'description', 'order', 'status', 'due_date',
                 'completed_date', 'validated_date', 'tuteur_feedback', 
                 'stagiaire_comment', 'stage', 'documents_count', 'created_at']
    
    def get_documents_count(self, obj):
        return obj.documents.count()

class DocumentSerializer(serializers.ModelSerializer):
    stage = StageSerializer(read_only=True)
    step = StepSerializer(read_only=True)
    uploaded_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'

class DocumentListSerializer(serializers.ModelSerializer):
    stage = StageListSerializer(read_only=True)
    step = StepListSerializer(read_only=True)
    uploaded_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'document_type', 'file', 
                 'file_size', 'is_approved', 'feedback', 'stage', 'step',
                 'uploaded_by', 'approved_by', 'approved_at', 'created_at']

class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'description', 'document_type', 'file', 'stage', 'step']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

class EvaluationSerializer(serializers.ModelSerializer):
    stage = StageSerializer(read_only=True)
    evaluator = UserSerializer(read_only=True)
    evaluated = UserSerializer(read_only=True)
    
    class Meta:
        model = Evaluation
        fields = '__all__'

class EvaluationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['stage', 'evaluated', 'evaluation_type', 'scores', 'comments']
    
    def create(self, validated_data):
        validated_data['evaluator'] = self.context['request'].user
        return super().create(validated_data)

class KPIQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPIQuestion
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    stage = StageSerializer(read_only=True)
    author = UserSerializer(read_only=True)
    moderated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Testimonial
        fields = '__all__'

class TestimonialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['stage', 'title', 'content', 'testimonial_type', 'video_url', 'video_file']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class TestimonialModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['status', 'moderation_comment']
    
    def update(self, instance, validated_data):
        validated_data['moderated_by'] = self.context['request'].user
        from django.utils import timezone
        validated_data['moderated_at'] = timezone.now()
        return super().update(instance, validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    related_stage = StageSerializer(read_only=True)
    related_step = StepSerializer(read_only=True)
    related_document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'

class NotificationListSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read',
                 'read_at', 'related_stage', 'related_step', 'related_document',
                 'recipient', 'created_at']

class PFEDocumentSerializer(serializers.ModelSerializer):
    published_by = UserSerializer(read_only=True)
    
    class Meta:
        model = PFEDocument
        fields = '__all__'

class PFEDocumentListSerializer(serializers.ModelSerializer):
    published_by = UserSerializer(read_only=True)
    
    class Meta:
        model = PFEDocument
        fields = ['id', 'title', 'description', 'authors', 'year', 'speciality',
                 'supervisor', 'pdf_file', 'presentation_file', 'keywords',
                 'abstract', 'status', 'published_at', 'published_by',
                 'download_count', 'view_count', 'created_at']

class PFEDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PFEDocument
        fields = ['title', 'description', 'authors', 'year', 'speciality',
                 'supervisor', 'pdf_file', 'presentation_file', 'keywords', 'abstract']
    
    def create(self, validated_data):
        validated_data['published_by'] = self.context['request'].user
        return super().create(validated_data) 

class OffreStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffreStage
        fields = ['id', 'reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville', 'status', 'type', 'validated']

class OffreStageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffreStage
        fields = ['id', 'reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville', 'status', 'type', 'validated']

class OffreStageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffreStage
        fields = [
            'reference', 'title', 'description', 'objectifs', 'keywords', 'diplome',
            'specialite', 'nombre_postes', 'ville', 'status', 'type', 'validated'
        ]
    
    def create(self, validated_data):
        validated_data.setdefault('status', 'draft')
        validated_data.setdefault('type', 'Classique')
        validated_data.setdefault('validated', False)
        return super().create(validated_data)

 