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

            requests_qs = InterviewRequest.objects.filter(tuteur=request.user)
            results = []
            for req in requests_qs.select_related('demande', 'rh', 'filiale'):
                demande = req.demande
                results.append({
                    'id': req.id,
                    'demande': {
                        'id': demande.id,
                        'candidat': {
                            'id': demande.id,  # no separate candidat model, reuse demande id
                            'prenom': demande.prenom,
                            'nom': demande.nom,
                            'email': demande.email,
                            'telephone': demande.telephone,
                            'institut': demande.institut,
                            'specialite': demande.specialite,
                        }
                    },
                    'tuteur': {
                        'id': request.user.id,
                        'name': request.user.get_full_name(),
                        'email': request.user.email,
                    },
                    'filiale': {
                        'id': req.filiale.id if req.filiale else None,
                        'name': req.filiale.nom if req.filiale else None,
                    },
                    'proposed_date': req.proposed_date.strftime('%Y-%m-%d'),
                    'proposed_time': req.proposed_time.strftime('%H:%M'),
                    'location': req.location,
                    'mode': getattr(req, 'mode', 'in_person'),
                    'meeting_link': getattr(req, 'meeting_link', ''),
                    'status': req.status,
                    'suggested_date': req.suggested_date.strftime('%Y-%m-%d') if req.suggested_date else None,
                    'suggested_time': req.suggested_time.strftime('%H:%M') if req.suggested_time else None,
                    'created_at': req.created_at.isoformat(),
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
    """Tuteur responds to an interview request: accept or propose new date/time"""
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            if request.user.role != 'tuteur':
                return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

            interview_request = get_object_or_404(InterviewRequest, id=request_id, tuteur=request.user)
            action = request.data.get('action')
            comment = request.data.get('comment', '')

            if action == 'accept':
                interview_request.status = InterviewRequest.Status.VALIDATED
                interview_request.tuteur_comment = comment
                interview_request.save(update_fields=['status', 'tuteur_comment', 'updated_at'])

                # Notify RH
                if interview_request.rh:
                    Notification.objects.create(
                        recipient=interview_request.rh,
                        title="Entretien validé par le Tuteur",
                        message=f"Le tuteur a validé l'entretien avec {interview_request.demande.nom_complet}.",
                        notification_type='success'
                    )

                # Email RH
                from shared.utils import MailService
                if interview_request.rh and interview_request.rh.email:
                    try:
                        MailService.send_email(
                            subject="Entretien validé par le Tuteur",
                            recipient_list=[interview_request.rh.email],
                            template_name='emails/interview_tuteur_validated.txt',
                            context={
                                'candidate_name': interview_request.demande.nom_complet,
                                'tuteur_name': request.user.get_full_name(),
                                'proposed_date': interview_request.proposed_date.strftime('%d/%m/%Y'),
                                'proposed_time': interview_request.proposed_time.strftime('%H:%M'),
                                'location': interview_request.location,
                                'filiale_name': interview_request.filiale.nom,
                            },
                            html_template_name='emails/interview_tuteur_validated.html'
                        )
                    except Exception as e:
                        print(f"Error sending email to RH: {e}")

                # Notify Candidate (only when validated)
                try:
                    MailService.send_email(
                        subject="Entretien confirmé",
                        recipient_list=[interview_request.demande.email],
                        template_name='emails/interview_confirmed_candidate.txt',
                        context={
                            'candidate_name': interview_request.demande.nom_complet,
                            'interview_date': interview_request.proposed_date.strftime('%d/%m/%Y'),
                            'interview_time': interview_request.proposed_time.strftime('%H:%M'),
                            'interview_location': interview_request.location,
                            'filiale_name': interview_request.filiale.nom,
                            'tuteur_name': request.user.get_full_name(),
                        },
                        html_template_name='emails/interview_confirmed_candidate.html'
                    )
                except Exception as e:
                    print(f"Error sending email to candidate: {e}")

                return Response({'message': 'Entretien validé. Le candidat a été notifié.'})

            elif action == 'propose_new_time':
                suggested_date = request.data.get('suggested_date')
                suggested_time = request.data.get('suggested_time')
                
                if not suggested_date or not suggested_time:
                    return Response({'error': 'Date et heure suggérées requises'}, status=status.HTTP_400_BAD_REQUEST)

                from datetime import datetime
                from django.utils import timezone
                
                try:
                    suggested_date_obj = datetime.strptime(suggested_date, '%Y-%m-%d').date()
                    suggested_time_obj = datetime.strptime(suggested_time, '%H:%M').time()
                    
                    # Ensure future datetime
                    dt_naive = datetime.combine(suggested_date_obj, suggested_time_obj)
                    dt = timezone.make_aware(dt_naive, timezone.get_current_timezone()) if timezone.is_naive(dt_naive) else dt_naive
                    if dt <= timezone.now():
                        return Response({'error': "La date/heure suggérée doit être dans le futur"}, status=status.HTTP_400_BAD_REQUEST)
                        
                except ValueError:
                    return Response({'error': 'Format de date/heure invalide'}, status=status.HTTP_400_BAD_REQUEST)

                interview_request.status = InterviewRequest.Status.REVISION_REQUESTED
                interview_request.suggested_date = suggested_date_obj
                interview_request.suggested_time = suggested_time_obj
                interview_request.tuteur_comment = comment
                interview_request.save(update_fields=['status', 'suggested_date', 'suggested_time', 'tuteur_comment', 'updated_at'])

                # Notify RH
                if interview_request.rh:
                    Notification.objects.create(
                        recipient=interview_request.rh,
                        title="Nouvelle proposition d'entretien",
                        message=f"Le tuteur propose un nouveau créneau pour l'entretien avec {interview_request.demande.nom_complet}.",
                        notification_type='info'
                    )

                # Email RH
                from shared.utils import MailService
                if interview_request.rh and interview_request.rh.email:
                    try:
                        MailService.send_email(
                            subject="Nouvelle proposition d'entretien",
                            recipient_list=[interview_request.rh.email],
                            template_name='emails/interview_tuteur_proposal.txt',
                            context={
                                'candidate_name': interview_request.demande.nom_complet,
                                'tuteur_name': request.user.get_full_name(),
                                'original_date': interview_request.proposed_date.strftime('%d/%m/%Y'),
                                'original_time': interview_request.proposed_time.strftime('%H:%M'),
                                'suggested_date': suggested_date_obj.strftime('%d/%m/%Y'),
                                'suggested_time': suggested_time_obj.strftime('%H:%M'),
                                'location': interview_request.location,
                                'comment': comment,
                                'filiale_name': interview_request.filiale.nom,
                            },
                            html_template_name='emails/interview_tuteur_proposal.html'
                        )
                    except Exception as e:
                        print(f"Error sending email to RH: {e}")

                return Response({'message': 'Nouvelle proposition envoyée au RH.'})

            else:
                return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'Erreur: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)