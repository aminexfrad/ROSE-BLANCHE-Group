"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from shared.models import Stage, User, Testimonial, Evaluation, Notification
from auth_service.serializers import UserSerializer

class TuteurStagiairesView(APIView):
    """
    Vue pour récupérer les stagiaires assignés à un tuteur
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Vérifier que l'utilisateur est tuteur
            if request.user.role != 'tuteur':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer tous les stages où ce tuteur est assigné
            stages = Stage.objects.filter(
                tuteur=request.user,
                status__in=['active', 'completed']
            ).order_by('-created_at')
            
            stages_data = []
            for stage in stages:
                # Calculer la progression
                total_steps = stage.steps.count()
                completed_steps = stage.steps.filter(status__in=['completed', 'validated']).count()
                progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                
                # Compter les documents en attente (mock pour l'instant)
                documents_en_attente = stage.documents.filter(is_approved=False).count()
                
                # Calculer la note moyenne des évaluations
                evaluations = Evaluation.objects.filter(stage=stage)
                note_moyenne = evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 4.5
                
                # Dernier contact (mock pour l'instant)
                dernier_contact = "Il y a 2 jours"
                
                stage_data = {
                    "id": stage.id,
                    "title": stage.title,
                    "company": stage.company,
                    "status": stage.status,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "progress": progress,
                    "location": stage.location,
                    "description": stage.description,
                    "documentsEnAttente": documents_en_attente,
                    "dernierContact": dernier_contact,
                    "note": round(note_moyenne, 1),
                    "stagiaire": {
                        "id": stage.stagiaire.id,
                        "first_name": stage.stagiaire.prenom,
                        "last_name": stage.stagiaire.nom,
                        "email": stage.stagiaire.email,
                        "telephone": stage.stagiaire.telephone,
                        "institut": stage.stagiaire.institut,
                        "specialite": stage.stagiaire.specialite,
                        "avatar": stage.stagiaire.avatar.url if stage.stagiaire.avatar else None
                    },
                    "steps_count": total_steps,
                    "completed_steps_count": completed_steps,
                    "documents_count": stage.documents.count(),
                    "evaluations_count": evaluations.count()
                }
                stages_data.append(stage_data)
            
            return Response({
                "results": stages_data,
                "count": len(stages_data)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des stagiaires: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurStagiaireDetailView(APIView):
    """
    Vue pour récupérer les détails d'un stagiaire spécifique
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, stagiaire_id):
        try:
            # Vérifier que l'utilisateur est tuteur
            if request.user.role != 'tuteur':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer le stage du stagiaire assigné à ce tuteur
            stage = get_object_or_404(
                Stage, 
                stagiaire_id=stagiaire_id, 
                tuteur=request.user
            )
            
            # Récupérer les étapes du stage
            steps = stage.steps.all().order_by('order')
            
            # Récupérer les évaluations
            evaluations = Evaluation.objects.filter(stage=stage).order_by('-created_at')
            
            # Récupérer les documents
            documents = stage.documents.all().order_by('-created_at')
            
            stage_data = {
                "id": stage.id,
                "title": stage.title,
                "company": stage.company,
                "status": stage.status,
                "start_date": stage.start_date.isoformat(),
                "end_date": stage.end_date.isoformat(),
                "progress": stage.progress,
                "location": stage.location,
                "description": stage.description,
                "stagiaire": {
                    "id": stage.stagiaire.id,
                    "first_name": stage.stagiaire.prenom,
                    "last_name": stage.stagiaire.nom,
                    "email": stage.stagiaire.email,
                    "telephone": stage.stagiaire.telephone,
                    "institut": stage.stagiaire.institut,
                    "specialite": stage.stagiaire.specialite,
                    "avatar": stage.stagiaire.avatar.url if stage.stagiaire.avatar else None
                },
                "steps": [
                    {
                        "id": step.id,
                        "title": step.title,
                        "description": step.description,
                        "status": step.status,
                        "order": step.order,
                        "due_date": step.due_date.isoformat() if step.due_date else None
                    } for step in steps
                ],
                "evaluations": [
                    {
                        "id": eval.id,
                        "evaluation_type": eval.evaluation_type,
                        "overall_score": eval.overall_score,
                        "comments": eval.comments,
                        "created_at": eval.created_at.isoformat()
                    } for eval in evaluations
                ],
                "documents": [
                    {
                        "id": doc.id,
                        "title": doc.title,
                        "file_url": doc.file.url if doc.file else None,
                        "status": doc.status,
                        "created_at": doc.created_at.isoformat()
                    } for doc in documents
                ]
            }
            
            return Response(stage_data)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des détails: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 

# --- MISSING VIEWS STUBS ---
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class TuteurStageStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'detail': 'TuteurStageStudentsView not implemented'}, status=501)

class StepValidationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'StepValidationView not implemented'}, status=501)

class StepRejectionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'StepRejectionView not implemented'}, status=501)

class DocumentApprovalView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'DocumentApprovalView not implemented'}, status=501)

class DocumentRejectionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'DocumentRejectionView not implemented'}, status=501)

class TuteurEvaluationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'detail': 'TuteurEvaluationDetailView not implemented'}, status=501)

class TuteurNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'TuteurNotificationReadView not implemented'}, status=501)



class TuteurStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'detail': 'TuteurStatisticsView not implemented'}, status=501)
# --- END MISSING VIEWS STUBS --- 