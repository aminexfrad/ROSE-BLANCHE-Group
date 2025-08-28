"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from django.db.models import Q

from shared.models import Stage, Step, Document, Evaluation, Testimonial, Notification
from shared.serializers import (
    StageSerializer, StepSerializer, DocumentSerializer, 
    DocumentUploadSerializer, EvaluationSerializer, EvaluationCreateSerializer,
    TestimonialSerializer, TestimonialCreateSerializer
)

class InternshipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the user's active internship
            internship = Stage.objects.filter(
                stagiaire=request.user,
                status='active'
            ).first()
            
            if not internship:
                return Response(
                    {'error': 'No active internship found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calculate additional data
            from django.utils import timezone
            today = timezone.now().date()
            
            # Calculate progress based on completed steps
            total_steps = internship.steps.count()
            completed_steps = internship.steps.filter(status__in=['completed', 'validated']).count()
            progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
            
            # Count documents
            documents_count = internship.documents.count()
            
            # Count evaluations
            evaluations_count = internship.evaluations.count()
            
            response_data = {
                "id": internship.id,
                "title": internship.title,
                "company": internship.company_entreprise.nom if internship.company_entreprise else internship.company_name or 'Aucune entreprise',
                "status": internship.status,
                "start_date": internship.start_date.isoformat(),
                "end_date": internship.end_date.isoformat(),
                "progress": progress,
                "documents_count": documents_count,
                "evaluations_count": evaluations_count,
                "mentor": internship.tuteur.get_full_name() if internship.tuteur else "Non assigné",
                "location": internship.location,
                "description": internship.description,
                "duration_days": internship.duration_days,
                "days_remaining": internship.days_remaining
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching internship data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InternshipStepsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the user's active internship
            internship = Stage.objects.filter(
                stagiaire=request.user,
                status='active'
            ).first()
            
            if not internship:
                return Response(
                    {'error': 'No active internship found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all steps for this internship
            steps = internship.steps.all().order_by('order')
            
            steps_data = []
            for step in steps:
                step_data = {
                    "id": step.id,
                    "title": step.title,
                    "description": step.description,
                    "order": step.order,
                    "status": step.status,
                    "due_date": step.due_date.isoformat() if step.due_date else None,
                    "completed_date": step.completed_date.isoformat() if step.completed_date else None,
                    "validated_date": step.validated_date.isoformat() if step.validated_date else None,
                    "tuteur_feedback": step.tuteur_feedback,
                    "stagiaire_comment": step.stagiaire_comment,
                    "documents_count": step.documents.count()
                }
                steps_data.append(step_data)
            
            return Response({
                "internship": {
                    "id": internship.id,
                    "title": internship.title,
                    "progress": internship.progress
                },
                "steps": steps_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching steps data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InternshipDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the user's active internship
            internship = Stage.objects.filter(
                stagiaire=request.user,
                status='active'
            ).first()
            
            if not internship:
                return Response(
                    {'error': 'No active internship found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all documents for this internship
            documents = internship.documents.all().order_by('-created_at')
            
            documents_data = []
            for doc in documents:
                doc_data = {
                    "id": doc.id,
                    "title": doc.title,
                    "description": doc.description,
                    "document_type": doc.document_type,
                    "file_url": doc.file.url if doc.file else None,
                    "file_size": doc.file_size,
                    "is_approved": doc.is_approved,
                    "feedback": doc.feedback,
                    "uploaded_at": doc.created_at.isoformat(),
                    "approved_at": doc.approved_at.isoformat() if doc.approved_at else None,
                    "step": {
                        "id": doc.step.id,
                        "title": doc.step.title
                    } if doc.step else None
                }
                documents_data.append(doc_data)
            
            return Response({
                "internship": {
                    "id": internship.id,
                    "title": internship.title
                },
                "documents": documents_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching documents data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InternshipEvaluationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the user's active internship
            internship = Stage.objects.filter(
                stagiaire=request.user,
                status='active'
            ).first()
            
            if not internship:
                return Response(
                    {'error': 'No active internship found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all evaluations for this internship
            evaluations = internship.evaluations.all().order_by('-created_at')
            
            evaluations_data = []
            for eval in evaluations:
                eval_data = {
                    "id": eval.id,
                    "evaluation_type": eval.evaluation_type,
                    "scores": eval.scores,
                    "comments": eval.comments,
                    "overall_score": eval.overall_score,
                    "is_completed": eval.is_completed,
                    "completed_at": eval.completed_at.isoformat() if eval.completed_at else None,
                    "evaluator": {
                        "id": eval.evaluator.id,
                        "nom": eval.evaluator.nom,
                        "prenom": eval.evaluator.prenom,
                        "email": eval.evaluator.email
                    },
                    "evaluated": {
                        "id": eval.evaluated.id,
                        "nom": eval.evaluated.nom,
                        "prenom": eval.evaluated.prenom,
                        "email": eval.evaluated.email
                    },
                    "created_at": eval.created_at.isoformat()
                }
                evaluations_data.append(eval_data)
            
            return Response({
                "internship": {
                    "id": internship.id,
                    "title": internship.title
                },
                "evaluations": evaluations_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching evaluations data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InternshipTestimonialsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the user's active internship
            internship = Stage.objects.filter(
                stagiaire=request.user,
                status='active'
            ).first()
            
            if not internship:
                return Response(
                    {'error': 'No active internship found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all testimonials for this internship
            testimonials = internship.testimonials.all().order_by('-created_at')
            
            testimonials_data = []
            for testimonial in testimonials:
                testimonial_data = {
                    "id": testimonial.id,
                    "title": testimonial.title,
                    "content": testimonial.content,
                    "testimonial_type": testimonial.testimonial_type,
                    "video_url": testimonial.video_url,
                    "video_file": request.build_absolute_uri(testimonial.video_file.url) if testimonial.video_file else None,
                    "status": testimonial.status,
                    "moderated_by": {
                        "id": testimonial.moderated_by.id,
                        "nom": testimonial.moderated_by.nom,
                        "prenom": testimonial.moderated_by.prenom
                    } if testimonial.moderated_by else None,
                    "moderated_at": testimonial.moderated_at.isoformat() if testimonial.moderated_at else None,
                    "moderation_comment": testimonial.moderation_comment,
                    "created_at": testimonial.created_at.isoformat()
                }
                testimonials_data.append(testimonial_data)
            
            return Response({
                "internship": {
                    "id": internship.id,
                    "title": internship.title
                },
                "testimonials": testimonials_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching testimonials data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InternshipNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all notifications for the user
            notifications = Notification.objects.filter(
                recipient=request.user
            ).order_by('-created_at')
            
            notifications_data = []
            for notification in notifications:
                notification_data = {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": notification.notification_type,
                    "is_read": notification.is_read,
                    "read_at": notification.read_at.isoformat() if notification.read_at else None,
                    "created_at": notification.created_at.isoformat()
                }
                notifications_data.append(notification_data)
            
            return Response({
                "notifications": notifications_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching notifications data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Step management views
class StepDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StepSerializer
    queryset = Step.objects.all()

    def get_queryset(self):
        return Step.objects.filter(stage__stagiaire=self.request.user)

class StepUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StepSerializer
    queryset = Step.objects.all()

    def get_queryset(self):
        return Step.objects.filter(stage__stagiaire=self.request.user)

# Document management views
class DocumentUploadView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentUploadSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class DocumentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    queryset = Document.objects.all()

    def get_queryset(self):
        return Document.objects.filter(stage__stagiaire=self.request.user)

# Evaluation management views
class EvaluationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluationCreateSerializer

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

class EvaluationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluationSerializer
    queryset = Evaluation.objects.all()

    def get_queryset(self):
        return Evaluation.objects.filter(
            Q(evaluator=self.request.user) | Q(evaluated=self.request.user)
        )

# Testimonial management views
class TestimonialCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialCreateSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class TestimonialDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialSerializer
    queryset = Testimonial.objects.all()

    def get_queryset(self):
        return Testimonial.objects.filter(author=self.request.user)











 