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
from datetime import timedelta, datetime

from shared.models import Stage, Testimonial, Evaluation, Notification
from auth_service.models import User
from auth_service.serializers import UserSerializer
from demande_service.models import InterviewRequest

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
                    "company": stage.company_entreprise.nom if stage.company_entreprise else stage.company_name,
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
                        "prenom": stage.stagiaire.prenom,
                        "nom": stage.stagiaire.nom,
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
                "company": stage.company_entreprise.nom if stage.company_entreprise else stage.company_name,
                "status": stage.status,
                "start_date": stage.start_date.isoformat(),
                "end_date": stage.end_date.isoformat(),
                "progress": stage.progress,
                "location": stage.location,
                "description": stage.description,
                "stagiaire": {
                    "id": stage.stagiaire.id,
                    "prenom": stage.stagiaire.prenom,
                    "nom": stage.stagiaire.nom,
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




# --- END MISSING VIEWS STUBS ---

class TuteurEvaluationsView(APIView):
    """
    Vue pour récupérer les évaluations à effectuer par un tuteur
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
            
            # Récupérer les stages où ce tuteur est assigné
            stages = Stage.objects.filter(tuteur=request.user)
            
            # Récupérer les évaluations liées à ces stages
            evaluations = Evaluation.objects.filter(
                stage__in=stages,
                evaluator=request.user
            ).order_by('-created_at')
            
            evaluations_data = []
            for evaluation in evaluations:
                evaluation_data = {
                    "id": evaluation.id,
                    "evaluation_type": evaluation.evaluation_type,
                    "overall_score": float(evaluation.overall_score) if evaluation.overall_score else None,
                    "comments": evaluation.comments,
                    "is_completed": evaluation.is_completed,
                    "completed_at": evaluation.completed_at.isoformat() if evaluation.completed_at else None,
                    "scores": evaluation.scores,
                    "evaluated": {
                        "id": evaluation.evaluated.id,
                        "prenom": evaluation.evaluated.prenom,
                        "nom": evaluation.evaluated.nom,
                        "first_name": evaluation.evaluated.prenom,
                        "last_name": evaluation.evaluated.nom,
                        "email": evaluation.evaluated.email,
                        "avatar": evaluation.evaluated.avatar.url if evaluation.evaluated.avatar else None
                    },
                    "stage": {
                        "id": evaluation.stage.id,
                        "title": evaluation.stage.title,
                        "company": evaluation.stage.company_entreprise.nom if evaluation.stage.company_entreprise else evaluation.stage.company_name
                    },
                    "created_at": evaluation.created_at.isoformat(),
                    "updated_at": evaluation.updated_at.isoformat()
                }
                evaluations_data.append(evaluation_data)
            
            return Response({
                "results": evaluations_data,
                "count": len(evaluations_data)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des évaluations: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurStatisticsView(APIView):
    """
    Vue pour récupérer les statistiques d'un tuteur
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
            
            # Récupérer les stages où ce tuteur est assigné
            stages = Stage.objects.filter(tuteur=request.user)
            
            # Calculer les statistiques
            total_stages = stages.count()
            active_stages = stages.filter(status='active').count()
            completed_stages = stages.filter(status='completed').count()
            
            # Calculer la progression moyenne
            total_progress = sum(stage.progress for stage in stages)
            avg_progress = round(total_progress / total_stages, 1) if total_stages > 0 else 0
            
            # Compter les évaluations en attente
            pending_evaluations = Evaluation.objects.filter(
                stage__in=stages,
                evaluator=request.user,
                is_completed=False
            ).count()
            
            # Calculer la note moyenne des évaluations
            completed_evaluations = Evaluation.objects.filter(
                stage__in=stages,
                evaluator=request.user,
                is_completed=True
            )
            avg_score = completed_evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 0
            
            stats_data = {
                "total_stages": total_stages,
                "active_stages": active_stages,
                "completed_stages": completed_stages,
                "avg_progress": avg_progress,
                "pending_evaluations": pending_evaluations,
                "avg_score": round(float(avg_score), 1),
                "success_rate": round((completed_stages / total_stages * 100), 1) if total_stages > 0 else 0
            }
            
            return Response(stats_data)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des statistiques: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TuteurInterviewRequestsView(APIView):
    """List pending interview requests for the logged-in tuteur"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if request.user.role != 'tuteur':
                return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

            requests_qs = InterviewRequest.objects.filter(tuteur=request.user, status=InterviewRequest.Status.PENDING_TUTEUR)
            results = []
            for req in requests_qs.select_related('demande', 'rh'):
                results.append({
                    'id': req.id,
                    'candidate_name': req.demande.nom_complet,
                    'proposed_date': req.proposed_date.strftime('%Y-%m-%d'),
                    'proposed_time': req.proposed_time.strftime('%H:%M'),
                    'location': req.location,
                    'status': req.status,
                    'rh': {
                        'id': req.rh.id if req.rh else None,
                        'name': req.rh.get_full_name() if req.rh else None,
                        'email': req.rh.email if req.rh else None,
                    }
                })

            return Response({'results': results, 'count': len(results)})
        except Exception as e:
            return Response({'error': f'Erreur: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TuteurInterviewRespondView(APIView):
    """Tuteur responds to an interview request: accept/reject/reschedule"""
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            if request.user.role != 'tuteur':
                return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

            interview_request = get_object_or_404(InterviewRequest, id=request_id, tuteur=request.user)

            action = request.data.get('action')  # 'accept' | 'reject' | 'reschedule'
            comment = request.data.get('comment', '')
            alt_date = request.data.get('alternative_date')
            alt_time = request.data.get('alternative_time')

            from shared.models import Notification

            if action == 'accept':
                interview_request.status = InterviewRequest.Status.ACCEPTED
                interview_request.tuteur_comment = comment
                interview_request.save(update_fields=['status', 'tuteur_comment', 'updated_at'])

                # Notify RH
                if interview_request.rh:
                    Notification.objects.create(
                        recipient=interview_request.rh,
                        title="Disponibilité confirmée",
                        message=f"Le tuteur a confirmé sa disponibilité pour l'entretien avec {interview_request.demande.nom_complet}.",
                        notification_type='success'
                    )
                # Email RH
                from shared.utils import MailService
                if interview_request.rh and interview_request.rh.email:
                    try:
                        MailService.send_email(
                            subject="Confirmation du tuteur pour l'entretien",
                            recipient_list=[interview_request.rh.email],
                            template_name='emails/interview_tuteur_confirmed.txt',
                            context={
                                'candidate_name': interview_request.demande.nom_complet,
                                'tuteur_name': request.user.get_full_name(),
                                'proposed_date': interview_request.proposed_date.strftime('%d/%m/%Y'),
                                'proposed_time': interview_request.proposed_time.strftime('%H:%M'),
                                'location': interview_request.location,
                            },
                            html_template_name='emails/interview_tuteur_confirmed.html'
                        )
                    except Exception:
                        pass

                return Response({'message': 'Disponibilité confirmée. Le RH peut maintenant valider l\'entretien.'})

            elif action == 'reject' or action == 'reschedule':
                if action == 'reject':
                    interview_request.status = InterviewRequest.Status.REJECTED
                else:
                    interview_request.status = InterviewRequest.Status.RESCHEDULE_REQUESTED
                    # Validate alt slots
                    if not alt_date or not alt_time:
                        return Response({'error': 'Veuillez proposer une autre date et heure.'}, status=status.HTTP_400_BAD_REQUEST)
                    try:
                        interview_request.alternative_date = datetime.strptime(alt_date, '%Y-%m-%d').date()
                        interview_request.alternative_time = datetime.strptime(alt_time, '%H:%M').time()
                    except Exception:
                        return Response({'error': 'Format de date/heure invalide. Utilisez YYYY-MM-DD et HH:MM.'}, status=status.HTTP_400_BAD_REQUEST)
                interview_request.tuteur_comment = comment
                interview_request.save(update_fields=['status', 'tuteur_comment', 'alternative_date', 'alternative_time', 'updated_at'])

                # Notify RH
                if interview_request.rh:
                    Notification.objects.create(
                        recipient=interview_request.rh,
                        title='Indisponibilité du tuteur',
                        message=(
                            f"Le tuteur a refusé ou proposé un autre créneau pour l'entretien avec {interview_request.demande.nom_complet}. "
                            f"Commentaire: {comment}"
                        ),
                        notification_type='warning'
                    )
                # Email RH
                from shared.utils import MailService
                if interview_request.rh and interview_request.rh.email:
                    try:
                        MailService.send_email(
                            subject='Réponse du tuteur à la demande d\'entretien',
                            recipient_list=[interview_request.rh.email],
                            template_name='emails/interview_tuteur_refused.txt',
                            context={
                                'candidate_name': interview_request.demande.nom_complet,
                                'tuteur_name': request.user.get_full_name(),
                                'comment': comment,
                                'alternative_date': alt_date,
                                'alternative_time': alt_time,
                            },
                            html_template_name='emails/interview_tuteur_refused.html'
                        )
                    except Exception:
                        pass

                return Response({'message': 'Réponse envoyée au RH.'})

            else:
                return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'Erreur: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)