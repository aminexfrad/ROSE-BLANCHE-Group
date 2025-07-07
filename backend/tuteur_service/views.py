from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from shared.models import Stage, Step, Document, Evaluation, Notification
from auth_service.models import User

class TuteurStagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all stages assigned to this tuteur
            stages = Stage.objects.filter(tuteur=request.user).order_by('-created_at')
            
            stages_data = []
            for stage in stages:
                # Calculate progress based on completed steps
                total_steps = stage.steps.count()
                completed_steps = stage.steps.filter(status__in=['completed', 'validated']).count()
                progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                
                # Count documents and evaluations
                documents_count = stage.documents.count()
                evaluations_count = stage.evaluations.count()
                
                stage_data = {
                    "id": stage.id,
                    "student": {
                        "id": stage.stagiaire.id,
                        "first_name": stage.stagiaire.prenom,
                        "last_name": stage.stagiaire.nom,
                        "email": stage.stagiaire.email,
                        "avatar": stage.stagiaire.avatar.url if stage.stagiaire.avatar else None
                    },
                    "title": stage.title,
                    "company": stage.company,
                    "status": stage.status,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "progress": progress,
                    "documents_count": documents_count,
                    "evaluations_count": evaluations_count,
                    "location": stage.location,
                    "description": stage.description
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

class TuteurStageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, stage_id):
        try:
            # Get the specific stage assigned to this tuteur
            stage = get_object_or_404(Stage, id=stage_id, tuteur=request.user)
            
            # Get all steps for this stage
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
                    "description": stage.description
                },
                "student": {
                    "id": stage.stagiaire.id,
                    "first_name": stage.stagiaire.prenom,
                    "last_name": stage.stagiaire.nom,
                    "email": stage.stagiaire.email,
                    "telephone": stage.stagiaire.telephone,
                    "avatar": stage.stagiaire.avatar.url if stage.stagiaire.avatar else None
                },
                "steps": steps_data
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

class TuteurStepValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, step_id):
        try:
            # Get the step and verify it belongs to a stage assigned to this tuteur
            step = get_object_or_404(Step, id=step_id, stage__tuteur=request.user)
            
            action = request.data.get('action')
            feedback = request.data.get('feedback', '')
            
            if action == 'validate':
                step.status = 'validated'
                step.validated_date = timezone.now().date()
                step.tuteur_feedback = feedback
                step.save()
                
                # Update stage progress
                stage = step.stage
                total_steps = stage.steps.count()
                completed_steps = stage.steps.filter(status__in=['completed', 'validated']).count()
                stage.progress = int((completed_steps / total_steps * 100) if total_steps > 0 else 0)
                stage.save()
                
                return Response({
                    'message': 'Step validated successfully',
                    'step': {
                        'id': step.id,
                        'status': step.status,
                        'validated_date': step.validated_date.isoformat(),
                        'tuteur_feedback': step.tuteur_feedback
                    }
                })
                
            elif action == 'reject':
                step.status = 'rejected'
                step.tuteur_feedback = feedback
                step.save()
                
                return Response({
                    'message': 'Step rejected',
                    'step': {
                        'id': step.id,
                        'status': step.status,
                        'tuteur_feedback': step.tuteur_feedback
                    }
                })
                
            else:
                return Response(
                    {'error': 'Invalid action. Use "validate" or "reject"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Step.DoesNotExist:
            return Response(
                {'error': 'Step not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error updating step: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurEvaluationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all evaluations for stages assigned to this tuteur
            evaluations = Evaluation.objects.filter(
                stage__tuteur=request.user
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

class TuteurEvaluationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            stage_id = request.data.get('stage_id')
            evaluated_id = request.data.get('evaluated_id')
            evaluation_type = request.data.get('evaluation_type')
            scores = request.data.get('scores', {})
            comments = request.data.get('comments', '')
            
            # Verify the stage is assigned to this tuteur
            stage = get_object_or_404(Stage, id=stage_id, tuteur=request.user)
            evaluated = get_object_or_404(User, id=evaluated_id)
            
            # Create evaluation
            evaluation = Evaluation.objects.create(
                stage=stage,
                evaluator=request.user,
                evaluated=evaluated,
                evaluation_type=evaluation_type,
                scores=scores,
                comments=comments,
                is_completed=True,
                completed_at=timezone.now()
            )
            
            # Calculate overall score
            if scores:
                total_score = sum(scores.values())
                avg_score = total_score / len(scores)
                evaluation.overall_score = round(avg_score, 2)
                evaluation.save()
            
            return Response({
                'message': 'Evaluation created successfully',
                'evaluation': {
                    'id': evaluation.id,
                    'evaluation_type': evaluation.evaluation_type,
                    'overall_score': evaluation.overall_score,
                    'is_completed': evaluation.is_completed
                }
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error creating evaluation: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all documents for stages assigned to this tuteur
            documents = Document.objects.filter(
                stage__tuteur=request.user
            ).order_by('-created_at')
            
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
                    },
                    "stage": {
                        "id": doc.stage.id,
                        "title": doc.stage.title,
                        "company": doc.stage.company
                    }
                }
                documents_data.append(doc_data)
            
            return Response({
                "results": documents_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching documents data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurDocumentApprovalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, doc_id):
        try:
            # Get the document and verify it belongs to a stage assigned to this tuteur
            document = get_object_or_404(Document, id=doc_id, stage__tuteur=request.user)
            
            action = request.data.get('action')
            feedback = request.data.get('feedback', '')
            
            if action == 'approve':
                document.is_approved = True
                document.approved_by = request.user
                document.approved_at = timezone.now()
                document.feedback = feedback
                document.save()
                
                return Response({
                    'message': 'Document approved successfully',
                    'document': {
                        'id': document.id,
                        'is_approved': document.is_approved,
                        'approved_at': document.approved_at.isoformat(),
                        'feedback': document.feedback
                    }
                })
                
            elif action == 'reject':
                document.is_approved = False
                document.feedback = feedback
                document.save()
                
                return Response({
                    'message': 'Document rejected',
                    'document': {
                        'id': document.id,
                        'is_approved': document.is_approved,
                        'feedback': document.feedback
                    }
                })
                
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error updating document: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TuteurNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the tuteur's notifications
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
                "results": notifications_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching notifications data: {str(e)}'}, 
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

class TuteurPlanningView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'detail': 'TuteurPlanningView not implemented'}, status=501)

class TuteurStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'detail': 'TuteurStatisticsView not implemented'}, status=501)
# --- END MISSING VIEWS STUBS --- 