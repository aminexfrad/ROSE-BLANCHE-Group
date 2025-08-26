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

from demande_service.models import Demande as DemandeModel
from shared.models import Stage, Testimonial, Evaluation, Notification, Survey, SurveyQuestion, SurveyResponse, KPIDashboard, Entreprise
from auth_service.models import User
from auth_service.serializers import UserSerializer


def get_company_filtered_queryset(request, base_queryset, company_field='company_entreprise'):
    """
    Utility function to filter queryset based on RH user's company access.
    RH users can only see data from their assigned company.
    Admin users can see all data.
    """
    if request.user.role == 'rh':
        if not request.user.entreprise:
            # RH users without company assignment see no data
            return base_queryset.none()
        
        # Filter by company
        if company_field == 'company_entreprise':
            return base_queryset.filter(company_entreprise=request.user.entreprise)
        elif company_field == 'entreprise':
            return base_queryset.filter(entreprise=request.user.entreprise)
        elif company_field == 'stagiaire__entreprise':
            return base_queryset.filter(stagiaire__entreprise=request.user.entreprise)
        elif company_field == 'evaluated__entreprise':
            return base_queryset.filter(evaluated__entreprise=request.user.entreprise)
        elif company_field == 'author__entreprise':
            return base_queryset.filter(author__entreprise=request.user.entreprise)
        else:
            # Default company filtering
            return base_queryset.filter(**{company_field: request.user.entreprise})
    
    elif request.user.role == 'admin':
        # Admin can see all data
        return base_queryset
    
    else:
        # Other roles see no data
        return base_queryset.none()


def validate_rh_company_access(request, target_entreprise):
    """
    Validate that RH user has access to the target company.
    Returns (has_access, error_message)
    """
    if request.user.role == 'admin':
        return True, None
    
    if request.user.role != 'rh':
        return False, "Permission refusée - rôle non autorisé"
    
    if not request.user.entreprise:
        return False, "Permission refusée - utilisateur RH non associé à une entreprise"
    
    if request.user.entreprise != target_entreprise:
        return False, "Permission refusée - accès à cette entreprise non autorisé"
    
    return True, None


class RHStagiairesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use company-based filtering
            stagiaires = get_company_filtered_queryset(
                request, 
                User.objects.filter(role='stagiaire'),
                'entreprise'
            ).order_by('-date_joined')
            
            stagiaires_data = []
            for stagiaire in stagiaires:
                # Get their active stage
                active_stage = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
                
                stagiaire_data = {
                    "id": stagiaire.id,
                    "prenom": stagiaire.prenom,
                    "nom": stagiaire.nom,
                    "first_name": stagiaire.prenom,
                    "last_name": stagiaire.nom,
                    "email": stagiaire.email,
                    "telephone": stagiaire.telephone,
                    "institut": stagiaire.institut,
                    "specialite": stagiaire.specialite,
                    "avatar": stagiaire.avatar.url if stagiaire.avatar else None,
                    "date_joined": stagiaire.date_joined.isoformat(),
                    "entreprise": stagiaire.entreprise.nom if stagiaire.entreprise else None,
                    "active_stage": {
                        "id": active_stage.id,
                        "title": active_stage.title,
                        "company": active_stage.company_entreprise.nom if active_stage.company_entreprise else active_stage.company_name,
                        "progress": active_stage.progress,
                        "start_date": active_stage.start_date.isoformat(),
                        "end_date": active_stage.end_date.isoformat(),
                        "tuteur": {
                            "id": active_stage.tuteur.id,
                            "prenom": active_stage.tuteur.prenom,
                            "nom": active_stage.tuteur.nom,
                            "first_name": active_stage.tuteur.prenom,
                            "last_name": active_stage.tuteur.nom,
                            "email": active_stage.tuteur.email
                        } if active_stage.tuteur else None
                    } if active_stage else None
                }
                stagiaires_data.append(stagiaire_data)
            
            return Response({
                "results": stagiaires_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching stagiaires data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHStagiaireDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Get the stagiaire
            stagiaire = get_object_or_404(User, id=pk, role='stagiaire')
            
            # Validate company access for RH users
            if request.user.role == 'rh':
                has_access, error_msg = validate_rh_company_access(
                    request, 
                    stagiaire.entreprise
                )
                if not has_access:
                    return Response(
                        {'error': error_msg}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Get their stages
            stages = Stage.objects.filter(stagiaire=stagiaire).order_by('-created_at')
            
            stages_data = []
            for stage in stages:
                # Get steps for this stage
                steps = stage.steps.all().order_by('order')
                total_steps = steps.count()
                completed_steps = steps.filter(status__in=['completed', 'validated']).count()
                progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                
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
                    "tuteur": {
                        "id": stage.tuteur.id,
                        "prenom": stage.tuteur.prenom,
                        "nom": stage.tuteur.nom,
                        "first_name": stage.tuteur.prenom,
                        "last_name": stage.tuteur.nom,
                        "email": stage.tuteur.email
                    } if stage.tuteur else None,
                    "steps_count": total_steps,
                    "completed_steps_count": completed_steps,
                    "documents_count": stage.documents.count(),
                    "evaluations_count": stage.evaluations.count()
                }
                stages_data.append(stage_data)
            
            response_data = {
                "stagiaire": {
                    "id": stagiaire.id,
                    "prenom": stagiaire.prenom,
                    "nom": stagiaire.nom,
                    "first_name": stagiaire.prenom,
                    "last_name": stagiaire.nom,
                    "email": stagiaire.email,
                    "telephone": stagiaire.telephone,
                    "institut": stagiaire.institut,
                    "specialite": stagiaire.specialite,
                    "departement": stagiaire.departement,
                    "avatar": stagiaire.avatar.url if stagiaire.avatar else None,
                    "date_joined": stagiaire.date_joined.isoformat(),
                    "last_login": stagiaire.last_login.isoformat() if stagiaire.last_login else None
                },
                "stages": stages_data
            }
            
            return Response(response_data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Stagiaire not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching stagiaire data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHTestimonialsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use company-based filtering for testimonials
            testimonials = get_company_filtered_queryset(
                request, 
                Testimonial.objects.all(),
                'stage__company_entreprise'
            ).order_by('-created_at')
            
            testimonials_data = []
            for testimonial in testimonials:
                testimonial_data = {
                    "id": testimonial.id,
                    "title": testimonial.title,
                    "content": testimonial.content,
                    "testimonial_type": testimonial.testimonial_type,
                    "status": testimonial.status,
                    "video_url": testimonial.video_url,
                    "video_file": request.build_absolute_uri(testimonial.video_file.url) if testimonial.video_file and testimonial.video_file.name else None,
                    "created_at": testimonial.created_at.isoformat(),
                    "moderated_at": testimonial.moderated_at.isoformat() if testimonial.moderated_at else None,
                    "moderation_comment": testimonial.moderation_comment,
                    "author": {
                        "id": testimonial.author.id,
                        "prenom": testimonial.author.prenom,
                        "nom": testimonial.author.nom,
                        "first_name": testimonial.author.prenom,
                        "last_name": testimonial.author.nom,
                        "email": testimonial.author.email
                    },
                    "stage": {
                        "id": testimonial.stage.id,
                        "title": testimonial.stage.title,
                        "company": testimonial.stage.company_entreprise.nom if testimonial.stage.company_entreprise else testimonial.stage.company_name
                    },
                    "moderated_by": {
                        "id": testimonial.moderated_by.id,
                        "prenom": testimonial.moderated_by.prenom,
                        "nom": testimonial.moderated_by.nom,
                        "first_name": testimonial.moderated_by.prenom,
                        "last_name": testimonial.moderated_by.nom
                    } if testimonial.moderated_by else None
                }
                testimonials_data.append(testimonial_data)
            
            return Response({
                "results": testimonials_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching testimonials data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHTestimonialModerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        return self.moderate_testimonial(request, pk)

    def put(self, request, pk):
        return self.moderate_testimonial(request, pk)

    def moderate_testimonial(self, request, pk):
        try:
            testimonial = get_object_or_404(Testimonial, id=pk)
            
            # Validate company access for RH users
            if request.user.role == 'rh':
                has_access, error_msg = validate_rh_company_access(
                    request, 
                    testimonial.stage.company_entreprise
                )
                if not has_access:
                    return Response(
                        {'error': error_msg}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            action = request.data.get('action')
            comment = request.data.get('comment', '')
            
            if action == 'approve':
                testimonial.status = 'approved'
                testimonial.moderated_by = request.user
                testimonial.moderated_at = timezone.now()
                testimonial.moderation_comment = comment
                testimonial.save()
                
                # Create notification for the author
                from shared.models import Notification
                Notification.objects.create(
                    recipient=testimonial.author,
                    title='Témoignage approuvé',
                    message=f'Votre témoignage "{testimonial.title}" a été approuvé et publié sur la plateforme.',
                    notification_type='success'
                )
                
                return Response({
                    'message': 'Témoignage approuvé avec succès',
                    'testimonial': {
                        'id': testimonial.id,
                        'status': testimonial.status,
                        'moderated_at': testimonial.moderated_at.isoformat(),
                        'moderation_comment': testimonial.moderation_comment
                    }
                })
                
            elif action == 'reject':
                testimonial.status = 'rejected'
                testimonial.moderated_by = request.user
                testimonial.moderated_at = timezone.now()
                testimonial.moderation_comment = comment
                testimonial.save()
                
                # Create notification for the author
                from shared.models import Notification
                rejection_message = f'Votre témoignage "{testimonial.title}" nécessite des modifications.'
                if comment:
                    rejection_message += f' Commentaire: {comment}'
                
                Notification.objects.create(
                    recipient=testimonial.author,
                    title='Témoignage nécessite des modifications',
                    message=rejection_message,
                    notification_type='warning'
                )
                
                return Response({
                    'message': 'Témoignage rejeté',
                    'testimonial': {
                        'id': testimonial.id,
                        'status': testimonial.status,
                        'moderated_at': testimonial.moderated_at.isoformat(),
                        'moderation_comment': testimonial.moderation_comment
                    }
                })
                
            else:
                return Response(
                    {'error': 'Action invalide. Utilisez "approve" ou "reject"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Testimonial.DoesNotExist:
            return Response(
                {'error': 'Témoignage non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la modération du témoignage: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class RHStagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use company-based filtering
            stages = get_company_filtered_queryset(
                request, 
                Stage.objects.all(),
                'company_entreprise'
            ).order_by('-created_at')
            
            stages_data = []
            for stage in stages:
                # Calculate progress
                total_steps = stage.steps.count()
                completed_steps = stage.steps.filter(status__in=['completed', 'validated']).count()
                progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                
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
                    "stagiaire": {
                        "id": stage.stagiaire.id,
                        "prenom": stage.stagiaire.prenom,
                        "nom": stage.stagiaire.nom,
                        "first_name": stage.stagiaire.prenom,
                        "last_name": stage.stagiaire.nom,
                        "email": stage.stagiaire.email,
                        "institut": stage.stagiaire.institut,
                        "specialite": stage.stagiaire.specialite
                    },
                    "tuteur": {
                        "id": stage.tuteur.id,
                        "prenom": stage.tuteur.prenom,
                        "nom": stage.tuteur.nom,
                        "first_name": stage.tuteur.prenom,
                        "last_name": stage.tuteur.nom,
                        "email": stage.tuteur.email
                    } if stage.tuteur else None,
                    "steps_count": total_steps,
                    "completed_steps_count": completed_steps,
                    "documents_count": stage.documents.count(),
                    "evaluations_count": stage.evaluations.count(),
                    "created_at": stage.created_at.isoformat()
                }
                stages_data.append(stage_data)
            
            return Response({
                "results": stages_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching stages data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHStageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            stage = get_object_or_404(Stage, id=pk)
            
            # Validate company access for RH users
            if request.user.role == 'rh':
                has_access, error_msg = validate_rh_company_access(
                    request, 
                    stage.company_entreprise
                )
                if not has_access:
                    return Response(
                        {'error': error_msg}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Get steps
            steps = stage.steps.all().order_by('order')
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
            
            # Get documents
            documents = stage.documents.all().order_by('-created_at')
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
                    "uploaded_by": {
                        "id": doc.uploaded_by.id,
                        "name": doc.uploaded_by.get_full_name(),
                        "role": doc.uploaded_by.role
                    }
                }
                documents_data.append(doc_data)
            
            # Get evaluations
            evaluations = stage.evaluations.all().order_by('-created_at')
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
                        "name": eval.evaluator.get_full_name(),
                        "role": eval.evaluator.role
                    },
                    "evaluated": {
                        "id": eval.evaluated.id,
                        "name": eval.evaluated.get_full_name(),
                        "role": eval.evaluated.role
                    },
                    "created_at": eval.created_at.isoformat()
                }
                evaluations_data.append(eval_data)
            
            # Calculate overall progress
            total_steps = len(steps)
            completed_steps = len([s for s in steps if s.status in ['completed', 'validated']])
            progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
            
            response_data = {
                "stage": {
                    "id": stage.id,
                    "title": stage.title,
                    "company": stage.company_entreprise.nom if stage.company_entreprise else stage.company_name,
                    "status": stage.status,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "progress": progress,
                    "location": stage.location,
                    "description": stage.description,
                    "created_at": stage.created_at.isoformat()
                },
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
                "tuteur": {
                    "id": stage.tuteur.id,
                    "first_name": stage.tuteur.prenom,
                    "last_name": stage.tuteur.nom,
                    "email": stage.tuteur.email,
                    "telephone": stage.tuteur.telephone
                } if stage.tuteur else None,
                "steps": steps_data,
                "documents": documents_data,
                "evaluations": evaluations_data
            }
            
            return Response(response_data)
            
        except Stage.DoesNotExist:
            return Response(
                {'error': 'Stage not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching stage data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHEvaluationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use company-based filtering for evaluations
            evaluations = get_company_filtered_queryset(
                request, 
                Evaluation.objects.all(),
                'stage__company_entreprise'
            ).order_by('-created_at')
            
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
                        "name": eval.evaluator.get_full_name(),
                        "role": eval.evaluator.role
                    },
                    "evaluated": {
                        "id": eval.evaluated.id,
                        "name": eval.evaluated.get_full_name(),
                        "role": eval.evaluated.role
                    },
                    "stage": {
                        "id": eval.stage.id,
                        "title": eval.stage.title,
                        "company": eval.stage.company_entreprise.nom if eval.stage.company_entreprise else eval.stage.company_name
                    },
                    "created_at": eval.created_at.isoformat()
                }
                evaluations_data.append(eval_data)
            
            return Response({
                "results": evaluations_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching evaluations data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use company-based filtering for notifications
            notifications = get_company_filtered_queryset(
                request, 
                Notification.objects.all(),
                'recipient__entreprise'
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
                    "recipient": {
                        "id": notification.recipient.id,
                        "name": notification.recipient.get_full_name(),
                        "role": notification.recipient.role
                    },
                    "created_at": notification.created_at.isoformat()
                }
                notifications_data.append(notification_data)
            
            return Response({
                "results": notifications_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching notifications data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



# --- MISSING VIEWS STUBS ---
class RHStagiaireStagesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'detail': 'RHStagiaireStagesView not implemented'}, status=501)

class RHStageEvaluationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'detail': 'RHStageEvaluationsView not implemented'}, status=501)



class RHEvaluationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'detail': 'RHEvaluationDetailView not implemented'}, status=501)

class RHTestimonialApprovalView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'RHTestimonialApprovalView not implemented'}, status=501)

class RHTestimonialRejectionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'RHTestimonialRejectionView not implemented'}, status=501)

class RHNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'detail': 'RHNotificationReadView not implemented'}, status=501)



class RHTuteursDisponiblesView(APIView):
    """
    Vue pour récupérer la liste des tuteurs disponibles
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Vérifier que l'utilisateur est RH ou admin
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Use company-based filtering
            tuteurs = get_company_filtered_queryset(
                request, 
                User.objects.filter(role='tuteur'),
                'entreprise'
            ).order_by('prenom', 'nom')
            
            tuteurs_data = []
            for tuteur in tuteurs:
                # Compter le nombre de stagiaires actuellement assignés
                stagiaires_assignes = Stage.objects.filter(
                    tuteur=tuteur, 
                    status='active'
                ).count()
                
                tuteur_data = {
                    "id": tuteur.id,
                    "first_name": tuteur.prenom,
                    "last_name": tuteur.nom,
                    "email": tuteur.email,
                    "telephone": tuteur.telephone,
                    "departement": tuteur.departement,
                    "stagiaires_assignes": stagiaires_assignes,
                    "disponible": stagiaires_assignes < 5,  # Limite de 5 stagiaires par tuteur
                    "entreprise": tuteur.entreprise.nom if tuteur.entreprise else None
                }
                tuteurs_data.append(tuteur_data)
            
            return Response({
                "results": tuteurs_data,
                "count": len(tuteurs_data)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des tuteurs: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHAssignerTuteurView(APIView):
    """
    Vue pour assigner un tuteur à un stagiaire
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            # Vérifier que l'utilisateur est RH ou admin
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer le stagiaire
            stagiaire = get_object_or_404(User, id=pk, role='stagiaire')
            
            # Validate company access for RH users
            if request.user.role == 'rh':
                has_access, error_msg = validate_rh_company_access(
                    request, 
                    stagiaire.entreprise
                )
                if not has_access:
                    return Response(
                        {'error': error_msg}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Récupérer l'ID du tuteur depuis la requête
            tuteur_id = request.data.get('tuteur_id')
            if not tuteur_id:
                return Response(
                    {'error': 'ID du tuteur requis'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Récupérer le tuteur
            tuteur = get_object_or_404(User, id=tuteur_id, role='tuteur')
            
            # Vérifier que le tuteur n'a pas trop de stagiaires assignés
            stagiaires_assignes = Stage.objects.filter(
                tuteur=tuteur, 
                status='active'
            ).count()
            
            if stagiaires_assignes >= 5:
                return Response(
                    {'error': 'Ce tuteur a déjà le maximum de stagiaires assignés (5)'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier que le tuteur appartient à la même entreprise que le stagiaire
            if stagiaire.entreprise != tuteur.entreprise:
                return Response(
                    {'error': 'Le tuteur sélectionné n\'appartient pas à la même entreprise que le stagiaire.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Récupérer le stage actif du stagiaire
            stage_actif = Stage.objects.filter(
                stagiaire=stagiaire, 
                status='active'
            ).first()
            
            if not stage_actif:
                return Response(
                    {'error': 'Aucun stage actif trouvé pour ce stagiaire'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Assigner le tuteur au stage
            stage_actif.tuteur = tuteur
            stage_actif.save()
            
            # Créer une notification pour le tuteur
            Notification.objects.create(
                recipient=tuteur,
                title="Nouveau stagiaire assigné",
                message=f"Vous avez été assigné comme tuteur pour {stagiaire.prenom} {stagiaire.nom}",
                notification_type="info",
                related_stage=stage_actif
            )
            
            # Créer une notification pour le stagiaire
            Notification.objects.create(
                recipient=stagiaire,
                title="Tuteur assigné",
                message=f"Un tuteur a été assigné à votre stage : {tuteur.prenom} {tuteur.nom}",
                notification_type="success",
                related_stage=stage_actif
            )
            
            return Response({
                'message': 'Tuteur assigné avec succès',
                'stagiaire': {
                    'id': stagiaire.id,
                    'first_name': stagiaire.prenom,
                    'last_name': stagiaire.nom,
                    'email': stagiaire.email
                },
                'tuteur': {
                    'id': tuteur.id,
                    'first_name': tuteur.prenom,
                    'last_name': tuteur.nom,
                    'email': tuteur.email
                },
                'stage': {
                    'id': stage_actif.id,
                    'title': stage_actif.title,
                    'company': (stage_actif.company_entreprise.nom if stage_actif.company_entreprise else stage_actif.company_name)
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'assignation: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHCreateStageForStagiaireView(APIView):
    """
    Vue pour créer un stage pour un stagiaire existant
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            # Vérifier que l'utilisateur est RH ou admin
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer le stagiaire
            stagiaire = get_object_or_404(User, id=pk, role='stagiaire')
            
            # Validate company access for RH users
            if request.user.role == 'rh':
                has_access, error_msg = validate_rh_company_access(
                    request, 
                    stagiaire.entreprise
                )
                if not has_access:
                    return Response(
                        {'error': error_msg}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Vérifier s'il a déjà un stage actif
            existing_stage = Stage.objects.filter(
                stagiaire=stagiaire, 
                status='active'
            ).first()
            
            if existing_stage:
                return Response({
                    'message': 'Ce stagiaire a déjà un stage actif',
                    'stage': {
                        'id': existing_stage.id,
                        'title': existing_stage.title,
                        'status': existing_stage.status
                    }
                }, status=status.HTTP_200_OK)
            
            # Récupérer les données du stage
            data = request.data
            required_fields = ['title', 'company', 'location', 'start_date', 'end_date']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'error': f'Le champ {field} est obligatoire'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Déterminer l'entreprise pour le stage
            # Si l'utilisateur RH a une entreprise, l'utiliser
            # Sinon, essayer de trouver l'entreprise par le nom
            entreprise = None
            if request.user.role == 'rh' and request.user.entreprise:
                entreprise = request.user.entreprise
            else:
                # Essayer de trouver l'entreprise par le nom
                try:
                    entreprise = Entreprise.objects.get(nom=data['company'])
                except Entreprise.DoesNotExist:
                    # Créer une entreprise temporaire si elle n'existe pas
                    entreprise = Entreprise.objects.create(
                        nom=data['company'],
                        description=f"Entreprise créée automatiquement pour {stagiaire.prenom} {stagiaire.nom}",
                        secteur_activite="Non spécifié"
                    )
            
            # Créer une demande de stage approuvée
            from demande_service.models import Demande as DemandeModel
            demande = DemandeModel.objects.create(
                nom=stagiaire.nom,
                prenom=stagiaire.prenom,
                email=stagiaire.email,
                telephone=stagiaire.telephone or '',
                cin=f"CIN{stagiaire.id:06d}",
                institut=stagiaire.institut or '',
                specialite=stagiaire.specialite or '',
                niveau=data.get('niveau', 'Bac+3'),
                type_stage=data.get('type_stage', 'Stage PFE'),
                date_debut=data['start_date'],
                date_fin=data['end_date'],
                stage_binome=False,
                status='approved',
                user_created=stagiaire,
                entreprise=entreprise
            )
            
            # Créer le stage
            stage = Stage.objects.create(
                demande=demande,
                stagiaire=stagiaire,
                title=data['title'],
                description=data.get('description', ''),
                company_entreprise=entreprise,
                company_name=data['company'],  # Garder pour la compatibilité
                location=data['location'],
                start_date=data['start_date'],
                end_date=data['end_date'],
                status='active',
                progress=0
            )
            
            return Response({
                'message': 'Stage créé avec succès',
                'stage': {
                    'id': stage.id,
                    'title': stage.title,
                    'company': stage.company_entreprise.nom if stage.company_entreprise else stage.company_name,
                    'location': stage.location,
                    'start_date': stage.start_date,
                    'end_date': stage.end_date,
                    'status': stage.status
                }
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Stagiaire non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la création du stage: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RHSurveyManagementView(APIView):
    """
    Vue pour la gestion des sondages KPI par RH
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Récupérer tous les sondages créés par RH"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # For RH users, only show surveys for their company
            if request.user.role == 'rh':
                surveys = Survey.objects.filter(
                    created_by=request.user,
                    target_stagiaires__entreprise=request.user.entreprise
                ).distinct().order_by('-created_at')
            else:
                # Admin can see all surveys
                surveys = Survey.objects.filter(created_by=request.user).order_by('-created_at')
            
            surveys_data = []
            for survey in surveys:
                # Get response statistics
                total_targets = survey.get_target_stagiaires().count()
                completed_responses = survey.responses.filter(is_completed=True).count()
                response_rate = round((completed_responses / total_targets * 100), 1) if total_targets > 0 else 0
                
                survey_data = {
                    "id": survey.id,
                    "title": survey.title,
                    "description": survey.description,
                    "status": survey.status,
                    "target_type": survey.target_type,
                    "total_targets": total_targets,
                    "completed_responses": completed_responses,
                    "response_rate": response_rate,
                    "average_score": survey.average_score,
                    "scheduled_start": survey.scheduled_start.isoformat() if survey.scheduled_start else None,
                    "scheduled_end": survey.scheduled_end.isoformat() if survey.scheduled_end else None,
                    "actual_start": survey.actual_start.isoformat() if survey.actual_start else None,
                    "actual_end": survey.actual_end.isoformat() if survey.actual_end else None,
                    "created_at": survey.created_at.isoformat(),
                    "questions_count": survey.questions.count()
                }
                surveys_data.append(survey_data)
            
            return Response({
                "results": surveys_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching surveys: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Créer un nouveau sondage"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data
            
            # Create survey
            survey = Survey.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                created_by=request.user,
                target_type=data.get('target_type', Survey.TargetType.ALL_STAGIAIRES),
                target_institutes=data.get('target_institutes', []),
                target_specialities=data.get('target_specialities', []),
                scheduled_start=data.get('scheduled_start'),
                scheduled_end=data.get('scheduled_end'),
                kpi_threshold_warning=data.get('kpi_threshold_warning', 3.0),
                kpi_threshold_critical=data.get('kpi_threshold_critical', 2.0)
            )
            
            # For RH users, automatically target stagiaires from their company
            if request.user.role == 'rh' and request.user.entreprise:
                company_stagiaires = User.objects.filter(
                    role='stagiaire',
                    entreprise=request.user.entreprise
                )
                survey.target_stagiaires.set(company_stagiaires)
            
            # Add specific stagiaires if target type is specific
            if data.get('target_type') == Survey.TargetType.SPECIFIC_STAGIAIRES:
                stagiaire_ids = data.get('target_stagiaire_ids', [])
                stagiaires = User.objects.filter(id__in=stagiaire_ids, role='stagiaire')
                survey.target_stagiaires.set(stagiaires)
            
            # Create questions
            questions_data = data.get('questions', [])
            for i, question_data in enumerate(questions_data):
                SurveyQuestion.objects.create(
                    survey=survey,
                    question_text=question_data.get('question_text'),
                    question_type=question_data.get('question_type', SurveyQuestion.QuestionType.RATING),
                    category=question_data.get('category', SurveyQuestion.Category.OTHER),
                    order=i,
                    is_required=question_data.get('is_required', True),
                    choices=question_data.get('choices', []),
                    kpi_weight=question_data.get('kpi_weight', 1.00)
                )
            
            # Create KPI dashboard
            KPIDashboard.objects.create(survey=survey)
            
            return Response({
                'message': 'Sondage créé avec succès',
                'survey_id': survey.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Error creating survey: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RHSurveyDetailView(APIView):
    """
    Vue pour les détails d'un sondage spécifique
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Récupérer les détails d'un sondage"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            survey = get_object_or_404(Survey, id=pk, created_by=request.user)
            
            # Get questions
            questions = survey.questions.all().order_by('order')
            questions_data = []
            for question in questions:
                question_data = {
                    "id": question.id,
                    "question_text": question.question_text,
                    "question_type": question.question_type,
                    "category": question.category,
                    "order": question.order,
                    "is_required": question.is_required,
                    "choices": question.choices,
                    "kpi_weight": question.kpi_weight
                }
                questions_data.append(question_data)
            
            # Get responses summary
            responses = survey.responses.all()
            responses_data = []
            for response in responses:
                response_data = {
                    "id": response.id,
                    "stagiaire": {
                        "id": response.stagiaire.id,
                        "prenom": response.stagiaire.prenom,
                        "nom": response.stagiaire.nom,
                        "first_name": response.stagiaire.prenom,
                        "last_name": response.stagiaire.nom,
                        "email": response.stagiaire.email,
                        "institut": response.stagiaire.institut,
                        "specialite": response.stagiaire.specialite
                    },
                    "is_completed": response.is_completed,
                    "completed_at": response.completed_at.isoformat() if response.completed_at else None,
                    "overall_score": response.overall_score,
                    "category_scores": response.category_scores
                }
                responses_data.append(response_data)
            
            survey_data = {
                "id": survey.id,
                "title": survey.title,
                "description": survey.description,
                "status": survey.status,
                "target_type": survey.target_type,
                "target_institutes": survey.target_institutes,
                "target_specialities": survey.target_specialities,
                "scheduled_start": survey.scheduled_start.isoformat() if survey.scheduled_start else None,
                "scheduled_end": survey.scheduled_end.isoformat() if survey.scheduled_end else None,
                "actual_start": survey.actual_start.isoformat() if survey.actual_start else None,
                "actual_end": survey.actual_end.isoformat() if survey.actual_end else None,
                "kpi_threshold_warning": survey.kpi_threshold_warning,
                "kpi_threshold_critical": survey.kpi_threshold_critical,
                "created_at": survey.created_at.isoformat(),
                "questions": questions_data,
                "responses": responses_data,
                "response_rate": survey.response_rate,
                "average_score": survey.average_score
            }
            
            return Response(survey_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching survey details: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, pk):
        """Modifier un sondage"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            survey = get_object_or_404(Survey, id=pk, created_by=request.user)
            data = request.data
            
            # Update survey fields
            survey.title = data.get('title', survey.title)
            survey.description = data.get('description', survey.description)
            survey.target_type = data.get('target_type', survey.target_type)
            survey.target_institutes = data.get('target_institutes', survey.target_institutes)
            survey.target_specialities = data.get('target_specialities', survey.target_specialities)
            survey.scheduled_start = data.get('scheduled_start', survey.scheduled_start)
            survey.scheduled_end = data.get('scheduled_end', survey.scheduled_end)
            survey.kpi_threshold_warning = data.get('kpi_threshold_warning', survey.kpi_threshold_warning)
            survey.kpi_threshold_critical = data.get('kpi_threshold_critical', survey.kpi_threshold_critical)
            survey.save()
            
            # Update specific stagiaires if target type is specific
            if data.get('target_type') == Survey.TargetType.SPECIFIC_STAGIAIRES:
                stagiaire_ids = data.get('target_stagiaire_ids', [])
                stagiaires = User.objects.filter(id__in=stagiaire_ids, role='stagiaire')
                survey.target_stagiaires.set(stagiaires)
            
            # Update questions if provided
            if 'questions' in data:
                # Delete existing questions
                survey.questions.all().delete()
                
                # Create new questions
                questions_data = data.get('questions', [])
                for i, question_data in enumerate(questions_data):
                    SurveyQuestion.objects.create(
                        survey=survey,
                        question_text=question_data.get('question_text'),
                        question_type=question_data.get('question_type', SurveyQuestion.QuestionType.RATING),
                        category=question_data.get('category', SurveyQuestion.Category.OTHER),
                        order=i,
                        is_required=question_data.get('is_required', True),
                        choices=question_data.get('choices', []),
                        kpi_weight=question_data.get('kpi_weight', 1.00)
                    )
            
            return Response({
                'message': 'Sondage modifié avec succès'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error updating survey: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        """Supprimer un sondage"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            survey = get_object_or_404(Survey, id=pk, created_by=request.user)
            survey.delete()
            
            return Response({
                'message': 'Sondage supprimé avec succès'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error deleting survey: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RHSurveyActionView(APIView):
    """
    Vue pour les actions sur les sondages (envoyer, fermer, calculer KPI)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Effectuer une action sur un sondage"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            survey = get_object_or_404(Survey, id=pk, created_by=request.user)
            action = request.data.get('action')
            
            if action == 'send':
                if survey.send_survey():
                    return Response({
                        'message': 'Sondage envoyé avec succès'
                    })
                else:
                    return Response(
                        {'error': 'Impossible d\'envoyer le sondage'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            elif action == 'close':
                if survey.close_survey():
                    return Response({
                        'message': 'Sondage fermé avec succès'
                    })
                else:
                    return Response(
                        {'error': 'Impossible de fermer le sondage'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            elif action == 'calculate_kpi':
                # Check KPI thresholds and generate alerts
                survey.check_kpi_thresholds()
                
                # Update KPI dashboard
                if hasattr(survey, 'kpi_dashboard'):
                    survey.kpi_dashboard.calculate_kpi_data()
                
                return Response({
                    'message': 'KPI calculés avec succès'
                })
            
            else:
                return Response(
                    {'error': 'Action non reconnue'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            return Response(
                {'error': f'Error performing action: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RHSurveyAnalysisView(APIView):
    """
    Vue pour l'analyse des sondages KPI
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Récupérer l'analyse des sondages"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get company-filtered surveys
            if request.user.role == 'rh':
                surveys = Survey.objects.filter(
                    created_by=request.user,
                    target_stagiaires__entreprise=request.user.entreprise
                ).distinct().order_by('-created_at')
            else:
                surveys = Survey.objects.filter(created_by=request.user).order_by('-created_at')
            
            # Overall statistics
            total_surveys = surveys.count()
            active_surveys = surveys.filter(status=Survey.Status.ACTIVE).count()
            completed_surveys = surveys.filter(status=Survey.Status.CLOSED).count()
            
            # Response statistics
            total_responses = 0
            total_targets = 0
            overall_average_score = 0
            total_scores = 0
            total_completed_responses = 0
            
            # Critical alerts
            critical_alerts = 0
            warning_alerts = 0
            
            for survey in surveys:
                survey_targets = survey.get_target_stagiaires().count()
                survey_responses = survey.responses.filter(is_completed=True).count()
                
                total_targets += survey_targets
                total_responses += survey_responses
                
                # Calculate scores
                for response in survey.responses.filter(is_completed=True):
                    if response.overall_score:
                        total_scores += response.overall_score
                        total_completed_responses += 1
                
                # Count alerts
                critical_alerts += survey.responses.filter(
                    is_completed=True,
                    overall_score__lte=survey.kpi_threshold_critical
                ).count()
                
                warning_alerts += survey.responses.filter(
                    is_completed=True,
                    overall_score__lte=survey.kpi_threshold_warning,
                    overall_score__gt=survey.kpi_threshold_critical
                ).count()
            
            overall_response_rate = round((total_responses / total_targets * 100), 1) if total_targets > 0 else 0
            overall_average_score = round(total_scores / total_completed_responses, 2) if total_completed_responses > 0 else 0
            
            # Survey KPI data
            surveys_kpi_data = []
            for survey in surveys[:10]:  # Limit to 10 most recent
                if hasattr(survey, 'kpi_dashboard'):
                    surveys_kpi_data.append(survey.kpi_dashboard.generate_report_data())
            
            analysis_data = {
                "overall_statistics": {
                    "total_surveys": total_surveys,
                    "active_surveys": active_surveys,
                    "completed_surveys": completed_surveys,
                    "total_responses": total_responses,
                    "total_targets": total_targets,
                    "overall_response_rate": overall_response_rate,
                    "overall_average_score": overall_average_score
                },
                "alerts": {
                    "critical_alerts": critical_alerts,
                    "warning_alerts": warning_alerts
                },
                "surveys_kpi_data": surveys_kpi_data
            }
            
            return Response(analysis_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching survey analysis: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
