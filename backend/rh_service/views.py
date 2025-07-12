from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from demande_service.models import Demande as DemandeModel
from shared.models import Stage, User, Testimonial, Evaluation, Notification
from auth_service.serializers import UserSerializer

class RHStagiairesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all stagiaires (users with stagiaire role)
            stagiaires = User.objects.filter(role='stagiaire').order_by('-date_joined')
            
            stagiaires_data = []
            for stagiaire in stagiaires:
                # Get their active stage
                active_stage = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
                
                stagiaire_data = {
                    "id": stagiaire.id,
                    "first_name": stagiaire.prenom,
                    "last_name": stagiaire.nom,
                    "email": stagiaire.email,
                    "telephone": stagiaire.telephone,
                    "institut": stagiaire.institut,
                    "specialite": stagiaire.specialite,
                    "avatar": stagiaire.avatar.url if stagiaire.avatar else None,
                    "date_joined": stagiaire.date_joined.isoformat(),
                    "active_stage": {
                        "id": active_stage.id,
                        "title": active_stage.title,
                        "company": active_stage.company,
                        "progress": active_stage.progress,
                        "start_date": active_stage.start_date.isoformat(),
                        "end_date": active_stage.end_date.isoformat(),
                        "tuteur": {
                            "id": active_stage.tuteur.id,
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

    def get(self, request, stagiaire_id):
        try:
            # Get the stagiaire
            stagiaire = get_object_or_404(User, id=stagiaire_id, role='stagiaire')
            
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
                    "company": stage.company,
                    "status": stage.status,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "progress": progress,
                    "location": stage.location,
                    "description": stage.description,
                    "tuteur": {
                        "id": stage.tuteur.id,
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
            # Get all testimonials
            testimonials = Testimonial.objects.all().order_by('-created_at')
            
            testimonials_data = []
            for testimonial in testimonials:
                testimonial_data = {
                    "id": testimonial.id,
                    "title": testimonial.title,
                    "content": testimonial.content,
                    "testimonial_type": testimonial.testimonial_type,
                    "status": testimonial.status,
                    "video_url": testimonial.video_url,
                    "created_at": testimonial.created_at.isoformat(),
                    "moderated_at": testimonial.moderated_at.isoformat() if testimonial.moderated_at else None,
                    "moderation_comment": testimonial.moderation_comment,
                    "author": {
                        "id": testimonial.author.id,
                        "first_name": testimonial.author.prenom,
                        "last_name": testimonial.author.nom,
                        "email": testimonial.author.email
                    },
                    "stage": {
                        "id": testimonial.stage.id,
                        "title": testimonial.stage.title,
                        "company": testimonial.stage.company
                    },
                    "moderated_by": {
                        "id": testimonial.moderated_by.id,
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

    def post(self, request, testimonial_id):
        try:
            testimonial = get_object_or_404(Testimonial, id=testimonial_id)
            
            action = request.data.get('action')
            comment = request.data.get('comment', '')
            
            if action == 'approve':
                testimonial.status = 'approved'
                testimonial.moderated_by = request.user
                testimonial.moderated_at = timezone.now()
                testimonial.moderation_comment = comment
                testimonial.save()
                
                return Response({
                    'message': 'Testimonial approved successfully',
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
                
                return Response({
                    'message': 'Testimonial rejected',
                    'testimonial': {
                        'id': testimonial.id,
                        'status': testimonial.status,
                        'moderated_at': testimonial.moderated_at.isoformat(),
                        'moderation_comment': testimonial.moderation_comment
                    }
                })
                
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Testimonial.DoesNotExist:
            return Response(
                {'error': 'Testimonial not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error moderating testimonial: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHKPIGlobauxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Calculate KPI data
            total_stages = Stage.objects.count()
            completed_stages = Stage.objects.filter(status='completed').count()
            active_stages = Stage.objects.filter(status='active').count()
            
            # Calculate success rate
            taux_reussite = round((completed_stages / total_stages * 100), 1) if total_stages > 0 else 0
            
            # Calculate average satisfaction from evaluations
            avg_satisfaction = Evaluation.objects.aggregate(avg=Avg('overall_score'))['avg'] or 4.5
            satisfaction_moyenne = round(avg_satisfaction, 1)
            
            # Calculate average stage duration (in months)
            stages_with_dates = Stage.objects.filter(start_date__isnull=False, end_date__isnull=False)
            if stages_with_dates.exists():
                total_duration = sum([
                    (stage.end_date - stage.start_date).days / 30 
                    for stage in stages_with_dates
                ])
                temps_moyen_stage = round(total_duration / stages_with_dates.count(), 1)
            else:
                temps_moyen_stage = 3.2
            
            # Calculate abandonment rate
            abandoned_stages = Stage.objects.filter(status='abandoned').count()
            taux_abandon = round((abandoned_stages / total_stages * 100), 1) if total_stages > 0 else 0
            
            # Get total stagiaires
            nombre_stagiaires = User.objects.filter(role='stagiaire').count()
            
            # Calculate objectives and evolution (mock data for now)
            objectifs = {
                "taux_reussite": 90,
                "satisfaction": 4.5,
                "nombre_stagiaires": 200
            }
            
            evolution = {
                "taux_reussite": taux_reussite - objectifs["taux_reussite"],
                "satisfaction": satisfaction_moyenne - objectifs["satisfaction"],
                "nombre_stagiaires": 17  # Mock growth percentage
            }
            
            # Performance by institute (mock data)
            performance_par_institut = [
                {
                    "institut": "ISET Sousse",
                    "stagiaires": 89,
                    "reussite": 96,
                    "satisfaction": 4.8,
                    "abandon": 4
                },
                {
                    "institut": "ISET Nabeul",
                    "stagiaires": 67,
                    "reussite": 94,
                    "satisfaction": 4.6,
                    "abandon": 6
                },
                {
                    "institut": "ISET Sfax",
                    "stagiaires": 78,
                    "reussite": 92,
                    "satisfaction": 4.7,
                    "abandon": 8
                }
            ]
            
            # Alerts and positive points
            alertes = [
                {
                    "type": "warning",
                    "titre": "Délais de validation",
                    "description": "Temps moyen de validation en hausse (+15%)",
                    "niveau": "warning",
                    "icon": "AlertTriangle"
                },
                {
                    "type": "info",
                    "titre": "Progression lente",
                    "description": "12 stagiaires avec progression < 30%",
                    "niveau": "info",
                    "icon": "TrendingUp"
                },
                {
                    "type": "error",
                    "titre": "Risque d'abandon",
                    "description": "5 stagiaires identifiés à risque",
                    "niveau": "error",
                    "icon": "Users"
                }
            ]
            
            points_positifs = [
                {
                    "titre": "Objectifs dépassés",
                    "description": "Taux de réussite supérieur aux attentes",
                    "icon": "Award"
                },
                {
                    "titre": "Satisfaction élevée",
                    "description": "Note moyenne en amélioration continue",
                    "icon": "Star"
                },
                {
                    "titre": "Croissance soutenue",
                    "description": "+17% de stagiaires par rapport à l'objectif",
                    "icon": "TrendingUp"
                }
            ]
            
            return Response({
                "taux_reussite": taux_reussite,
                "satisfaction_moyenne": satisfaction_moyenne,
                "temps_moyen_stage": temps_moyen_stage,
                "taux_abandon": taux_abandon,
                "nombre_stagiaires": nombre_stagiaires,
                "objectifs": objectifs,
                "evolution": evolution,
                "performance_par_institut": performance_par_institut,
                "alertes": alertes,
                "points_positifs": points_positifs
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching KPI data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RHStagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all stages
            stages = Stage.objects.all().order_by('-created_at')
            
            stages_data = []
            for stage in stages:
                # Calculate progress
                total_steps = stage.steps.count()
                completed_steps = stage.steps.filter(status__in=['completed', 'validated']).count()
                progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                
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
                    "stagiaire": {
                        "id": stage.stagiaire.id,
                        "first_name": stage.stagiaire.prenom,
                        "last_name": stage.stagiaire.nom,
                        "email": stage.stagiaire.email,
                        "institut": stage.stagiaire.institut,
                        "specialite": stage.stagiaire.specialite
                    },
                    "tuteur": {
                        "id": stage.tuteur.id,
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

    def get(self, request, stage_id):
        try:
            stage = get_object_or_404(Stage, id=stage_id)
            
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
                    "company": stage.company,
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
            # Get all evaluations
            evaluations = Evaluation.objects.all().order_by('-created_at')
            
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
                        "company": eval.stage.company
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
            # Get all notifications (RH can see all)
            notifications = Notification.objects.all().order_by('-created_at')
            
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

class RHReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Generate various reports
            report_type = request.query_params.get('type', 'overview')
            
            if report_type == 'overview':
                # Overview report
                total_stagiaires = User.objects.filter(role='stagiaire').count()
                total_stages = Stage.objects.count()
                active_stages = Stage.objects.filter(status='active').count()
                completed_stages = Stage.objects.filter(status='completed').count()
                avg_progress = Stage.objects.aggregate(avg=Avg('progress'))['avg'] or 0
                
                report_data = {
                    "report_type": "overview",
                    "generated_at": timezone.now().isoformat(),
                    "summary": {
                        "total_stagiaires": total_stagiaires,
                        "total_stages": total_stages,
                        "active_stages": active_stages,
                        "completed_stages": completed_stages,
                        "avg_progress": round(avg_progress, 1)
                    }
                }
                
            elif report_type == 'progress':
                # Progress report
                stages = Stage.objects.all()
                progress_data = []
                
                for stage in stages:
                    progress_data.append({
                        "stage_id": stage.id,
                        "title": stage.title,
                        "company": stage.company,
                        "stagiaire": stage.stagiaire.get_full_name(),
                        "progress": stage.progress,
                        "status": stage.status,
                        "start_date": stage.start_date.isoformat(),
                        "end_date": stage.end_date.isoformat()
                    })
                
                report_data = {
                    "report_type": "progress",
                    "generated_at": timezone.now().isoformat(),
                    "stages": progress_data
                }
                
            elif report_type == 'evaluations':
                # Evaluations report
                evaluations = Evaluation.objects.all()
                eval_data = []
                
                for eval in evaluations:
                    eval_data.append({
                        "evaluation_id": eval.id,
                        "evaluation_type": eval.evaluation_type,
                        "overall_score": eval.overall_score,
                        "is_completed": eval.is_completed,
                        "evaluator": eval.evaluator.get_full_name(),
                        "evaluated": eval.evaluated.get_full_name(),
                        "stage": eval.stage.title,
                        "created_at": eval.created_at.isoformat()
                    })
                
                report_data = {
                    "report_type": "evaluations",
                    "generated_at": timezone.now().isoformat(),
                    "evaluations": eval_data
                }
                
            else:
                return Response(
                    {'error': 'Invalid report type'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(report_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error generating report: {str(e)}'}, 
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

class RHStatistiquesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'detail': 'RHStatistiquesView not implemented'}, status=501)

class RHStatistiquesExportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'detail': 'RHStatistiquesExportView not implemented'}, status=501)

class RHReportGenerationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'detail': 'RHReportGenerationView not implemented'}, status=501)

class RHReportDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, report_type):
        return Response({'detail': 'RHReportDownloadView not implemented'}, status=501)

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

class RHCreerStagiaireView(APIView):
    """
    Vue pour créer directement un stagiaire depuis l'interface RH
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Vérifier que l'utilisateur est RH ou admin
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer les données du formulaire
            data = request.data
            
            # Validation des champs obligatoires
            required_fields = ['prenom', 'nom', 'email', 'institut', 'specialite', 'niveau', 'type_stage', 'date_debut', 'date_fin']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'error': f'Le champ {field} est obligatoire'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Vérifier si l'email existe déjà
            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'error': 'Un utilisateur avec cet email existe déjà'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Générer un mot de passe aléatoire
            import secrets
            import string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            # Créer l'utilisateur stagiaire
            stagiaire = User.objects.create_user(
                email=data['email'],
                password=password,
                prenom=data['prenom'],
                nom=data['nom'],
                telephone=data.get('telephone', ''),
                institut=data['institut'],
                specialite=data['specialite'],
                role='stagiaire'
            )
            
            # Créer une demande de stage approuvée
            demande = DemandeModel.objects.create(
                nom=data['nom'],
                prenom=data['prenom'],
                email=data['email'],
                telephone=data.get('telephone', ''),
                cin=f"CIN{stagiaire.id:06d}",
                institut=data['institut'],
                specialite=data['specialite'],
                niveau=data['niveau'],
                type_stage=data['type_stage'],
                date_debut=data['date_debut'],
                date_fin=data['date_fin'],
                stage_binome=False,
                status='approved',
                user_created=stagiaire
            )
            
            # Créer un stage pour ce stagiaire
            stage = Stage.objects.create(
                demande=demande,
                stagiaire=stagiaire,
                title=f"Stage {data['type_stage']} - {data['prenom']} {data['nom']}",
                description=data.get('description', ''),
                company="Entreprise à définir",
                location="Localisation à définir",
                start_date=data['date_debut'],
                end_date=data['date_fin'],
                status='active',
                progress=0
            )
            
            # Envoyer un email de bienvenue avec les identifiants
            try:
                from shared.utils import MailService
                MailService.send_acceptance_email(demande, password)
            except Exception as e:
                print(f"Erreur lors de l'envoi de l'email: {e}")
            
            return Response({
                'message': 'Stagiaire créé avec succès',
                'stagiaire': {
                    'id': stagiaire.id,
                    'email': stagiaire.email,
                    'password': password,
                    'nom': stagiaire.nom,
                    'prenom': stagiaire.prenom
                },
                'stage': {
                    'id': stage.id,
                    'title': stage.title
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la création du stagiaire: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            
            # Récupérer tous les tuteurs
            tuteurs = User.objects.filter(role='tuteur').order_by('prenom', 'nom')
            
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
                    "disponible": stagiaires_assignes < 5  # Limite de 5 stagiaires par tuteur
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

    def post(self, request, stagiaire_id):
        try:
            # Vérifier que l'utilisateur est RH ou admin
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer le stagiaire
            stagiaire = get_object_or_404(User, id=stagiaire_id, role='stagiaire')
            
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
                    'company': stage_actif.company
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
# --- END MISSING VIEWS STUBS ---
