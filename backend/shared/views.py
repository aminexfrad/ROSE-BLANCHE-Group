"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""


from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404

from .models import Entreprise, Stage, Step, Document, Evaluation, KPIQuestion, Testimonial, Notification, PFEDocument, OffreStage, PFEReport
from .serializers import (
    EntrepriseSerializer, EntrepriseListSerializer,
    StageSerializer, StageListSerializer, StepSerializer, StepListSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentUploadSerializer,
    EvaluationSerializer, EvaluationCreateSerializer, KPIQuestionSerializer,
    TestimonialSerializer, TestimonialCreateSerializer, TestimonialModerationSerializer,
    NotificationSerializer, NotificationListSerializer,
    PFEDocumentSerializer, PFEDocumentListSerializer, PFEDocumentCreateSerializer,
    OffreStageSerializer, OffreStageListSerializer, OffreStageCreateSerializer,
    PFEReportListSerializer, PFEReportSerializer, PFEReportCreateSerializer,
    PFEReportUpdateSerializer, PFEReportValidationSerializer
)
from auth_service.models import User
from auth_service.serializers import UserSerializer

class APIRootView(APIView):
    """
    Root API endpoint providing information about available endpoints
    """
    permission_classes = []  # Public access
    
    def get(self, request):
        return Response({
            "message": "StageBloom API",
            "version": "v1",
            "description": "API pour la gestion des stages et demandes",
            "status": "running",
            "timestamp": timezone.now().isoformat(),
            "endpoints": {
                "auth": "/api/auth/",
                "demandes": "/api/demandes/",
                "stagiaire": "/api/stagiaire/",
                "admin": "/api/admin/",
                "rh": "/api/rh/",
                "tuteur": "/api/tuteur/",
                "public": {
                    "testimonials": "/api/public/testimonials/",
                    "offres-stage": "/api/offres-stage/",
                    "pfe-documents": "/api/pfe-documents/"
                },
                "stats": "/api/stats/",
                "users": "/api/users/",
                "stages": "/api/stages/",
                "steps": "/api/steps/",
                "documents": "/api/documents/",
                "evaluations": "/api/evaluations/",
                "testimonials": "/api/testimonials/",
                "notifications": "/api/notifications/",
                "kpi-questions": "/api/kpi-questions/"
            },
            "documentation": {
                "swagger": "/api/docs/",
                "redoc": "/api/redoc/"
            }
        })

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Base stats
        total_users = User.objects.count()
        total_applications = Stage.objects.count()
        total_stages = Stage.objects.count()
        
        # Recent applications (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_applications = Stage.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Stage stats
        active_stages = Stage.objects.filter(status='active').count()
        completed_stages = Stage.objects.filter(status='completed').count()
        
        # Average progression
        avg_progression = Stage.objects.aggregate(avg=Avg('progress'))['avg'] or 0
        
        # Role-based filtering
        if user.role == 'stagiaire':
            # Stagiaire sees only their own data
            user_stages = Stage.objects.filter(stagiaire=user)
            total_stages = user_stages.count()
            active_stages = user_stages.filter(status='active').count()
            completed_stages = user_stages.filter(status='completed').count()
            avg_progression = user_stages.aggregate(avg=Avg('progress'))['avg'] or 0
            
        elif user.role == 'tuteur':
            # Tuteur sees only their assigned stages
            tuteur_stages = Stage.objects.filter(tuteur=user)
            total_stages = tuteur_stages.count()
            active_stages = tuteur_stages.filter(status='active').count()
            completed_stages = tuteur_stages.filter(status='completed').count()
            avg_progression = tuteur_stages.aggregate(avg=Avg('progress'))['avg'] or 0
            
        elif user.role == 'rh':
            # RH sees all stages
            pass
        elif user.role == 'admin':
            # Admin sees everything
            pass
        
        # Status stats
        status_stats = []
        for status_choice in Stage.Status.choices:
            count = Stage.objects.filter(status=status_choice[0]).count()
            if count > 0:
                status_stats.append({"status": status_choice[0], "count": count})
        
        # Role stats
        role_stats = []
        for role_choice in User.Role.choices:
            count = User.objects.filter(role=role_choice[0]).count()
            if count > 0:
                role_stats.append({"role": role_choice[0], "count": count})
        
        return Response({
            "stats": {
                "total_users": total_users,
                "total_applications": total_applications,
                "total_stages": total_stages,
                "recent_applications": recent_applications,
                "active_stages": active_stages,
                "completed_stages": completed_stages,
                "avg_progression": round(avg_progression, 1),
                "current_progression": round(avg_progression, 1),
                "status_stats": status_stats,
                "role_stats": role_stats
            }
        })

class UsersListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['nom', 'prenom', 'email']
    ordering_fields = ['date_joined', 'last_login']
    ordering = ['-date_joined']

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return User.objects.all()
        elif user.role == 'rh':
            return User.objects.filter(role__in=['stagiaire', 'tuteur'])
        elif user.role == 'tuteur':
            # Tuteurs can see their assigned stagiaires
            return User.objects.filter(
                stages_stagiaire__tuteur=user
            ).distinct()
        else:
            # Stagiaires can only see themselves
            return User.objects.filter(id=user.id)

class StagesListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StageListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company']
    search_fields = ['title', 'company', 'stagiaire__nom', 'stagiaire__prenom']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'progress']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return Stage.objects.all()
        elif user.role == 'rh':
            return Stage.objects.all()
        elif user.role == 'tuteur':
            return Stage.objects.filter(tuteur=user)
        elif user.role == 'stagiaire':
            return Stage.objects.filter(stagiaire=user)
        else:
            return Stage.objects.none()

class StageDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StageSerializer
    queryset = Stage.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return Stage.objects.all()
        elif user.role == 'rh':
            return Stage.objects.all()
        elif user.role == 'tuteur':
            return Stage.objects.filter(tuteur=user)
        elif user.role == 'stagiaire':
            return Stage.objects.filter(stagiaire=user)
        else:
            return Stage.objects.none()

class StepsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StepListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'stage']
    ordering_fields = ['order', 'due_date', 'created_at']
    ordering = ['order']

    def get_queryset(self):
        user = self.request.user
        stage_id = self.request.query_params.get('stage')
        
        queryset = Step.objects.all()
        
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)
        
        # Role-based access control
        if user.role == 'admin':
            return queryset
        elif user.role == 'rh':
            return queryset
        elif user.role == 'tuteur':
            return queryset.filter(stage__tuteur=user)
        elif user.role == 'stagiaire':
            return queryset.filter(stage__stagiaire=user)
        else:
            return Step.objects.none()

class StepDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StepSerializer
    queryset = Step.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return Step.objects.all()
        elif user.role == 'rh':
            return Step.objects.all()
        elif user.role == 'tuteur':
            return Step.objects.filter(stage__tuteur=user)
        elif user.role == 'stagiaire':
            return Step.objects.filter(stage__stagiaire=user)
        else:
            return Step.objects.none()

class DocumentsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'is_approved', 'stage']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'file_size']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        stage_id = self.request.query_params.get('stage')
        
        queryset = Document.objects.all()
        
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)
        
        # Role-based access control
        if user.role == 'admin':
            return queryset
        elif user.role == 'rh':
            return queryset
        elif user.role == 'tuteur':
            return queryset.filter(stage__tuteur=user)
        elif user.role == 'stagiaire':
            return queryset.filter(stage__stagiaire=user)
        else:
            return Document.objects.none()

class DocumentUploadView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentUploadSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    queryset = Document.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return Document.objects.all()
        elif user.role == 'rh':
            return Document.objects.all()
        elif user.role == 'tuteur':
            return Document.objects.filter(stage__tuteur=user)
        elif user.role == 'stagiaire':
            return Document.objects.filter(stage__stagiaire=user)
        else:
            return Document.objects.none()

class EvaluationsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluationSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['evaluation_type', 'is_completed', 'stage']
    ordering_fields = ['created_at', 'completed_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        stage_id = self.request.query_params.get('stage')
        
        queryset = Evaluation.objects.all()
        
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)
        
        # Role-based access control
        if user.role == 'admin':
            return queryset
        elif user.role == 'rh':
            return queryset
        elif user.role == 'tuteur':
            return queryset.filter(Q(evaluator=user) | Q(evaluated=user))
        elif user.role == 'stagiaire':
            return queryset.filter(Q(evaluator=user) | Q(evaluated=user))
        else:
            return Evaluation.objects.none()

class EvaluationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluationCreateSerializer

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

class KPIQuestionsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = KPIQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    ordering_fields = ['category', 'order']
    ordering = ['category', 'order']

    def get_queryset(self):
        return KPIQuestion.objects.filter(is_active=True)

class KPISystemView(APIView):
    """
    Comprehensive KPI system that implements the flowchart functionality:
    1. System triggers survey
    2. Stagiaire receives notification
    3. Stagiaire responds to survey
    4. System collects response
    5. System calculates KPI indicators
    6. Update dashboard
    7. Generate automatic reports
    8. Check KPI critical threshold
    9. Alert RH for action if needed
    10. RH analyzes results
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get KPI data for the current user based on their role"""
        try:
            user = request.user
            
            if user.role == 'rh':
                return self.get_rh_kpi_data()
            elif user.role == 'stagiaire':
                return self.get_stagiaire_kpi_data(user)
            elif user.role == 'tuteur':
                return self.get_tuteur_kpi_data(user)
            else:
                return Response(
                    {'error': 'Role non supporté pour les KPI'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {'error': f'Erreur lors du calcul des KPI: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_rh_kpi_data(self):
        """Get comprehensive KPI data for RH dashboard"""
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
        abandoned_stages = Stage.objects.filter(status='cancelled').count()
        taux_abandon = round((abandoned_stages / total_stages * 100), 1) if total_stages > 0 else 0
        
        # Get total stagiaires
        nombre_stagiaires = User.objects.filter(role='stagiaire').count()
        
        # Calculate objectives and evolution
        objectifs = {
            "taux_reussite": 90,
            "satisfaction": 4.5,
            "nombre_stagiaires": 200
        }
        
        evolution = {
            "taux_reussite": taux_reussite - objectifs["taux_reussite"],
            "satisfaction": satisfaction_moyenne - objectifs["satisfaction"],
            "nombre_stagiaires": 17
        }
        
        # Performance by institute
        performance_par_institut = self.calculate_institute_performance()
        
        # Generate alerts based on KPI thresholds
        alertes = self.generate_kpi_alerts(taux_reussite, satisfaction_moyenne, taux_abandon)
        
        # Generate positive points
        points_positifs = self.generate_positive_points(taux_reussite, satisfaction_moyenne, nombre_stagiaires)
        
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
            "points_positifs": points_positifs,
            "system_status": {
                "surveys_active": True,
                "last_survey_date": "2024-12-15",
                "next_survey_date": "2024-12-22",
                "total_responses": Evaluation.objects.count(),
                "response_rate": 85
            }
        })

    def get_stagiaire_kpi_data(self, user):
        """Get KPI data for a specific stagiaire"""
        try:
            # Get user's active stage
            stage = Stage.objects.filter(stagiaire=user, status='active').first()
            if not stage:
                return Response({
                    'error': 'Aucun stage actif trouvé'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get user's evaluations
            evaluations = Evaluation.objects.filter(evaluated=user)
            
            # Calculate KPI scores
            kpi_scores = self.calculate_stagiaire_kpi_scores(evaluations)
            
            # Get KPI questions
            kpi_questions = KPIQuestion.objects.filter(is_active=True)
            
            # Calculate overall statistics
            total_evaluations = evaluations.count()
            completed_evaluations = evaluations.filter(is_completed=True).count()
            average_score = evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 0
            
            # Generate recommendations
            recommendations = self.generate_stagiaire_recommendations(kpi_scores, stage)
            
            return Response({
                "stage_progress": stage.progress,
                "total_evaluations": total_evaluations,
                "completed_evaluations": completed_evaluations,
                "average_score": round(average_score, 1),
                "kpi_scores": kpi_scores,
                "kpi_questions": KPIQuestionSerializer(kpi_questions, many=True).data,
                "recommendations": recommendations,
                "recent_evaluations": EvaluationSerializer(evaluations.order_by('-created_at')[:5], many=True).data,
                "system_status": {
                    "surveys_pending": total_evaluations - completed_evaluations,
                    "last_evaluation_date": evaluations.order_by('-created_at').first().created_at if evaluations.exists() else None,
                    "next_survey_date": "2024-12-22"
                }
            })
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors du calcul des KPI stagiaire: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_tuteur_kpi_data(self, user):
        """Get KPI data for a tuteur"""
        try:
            # Get stages assigned to this tuteur
            stages = Stage.objects.filter(tuteur=user)
            
            # Calculate tuteur-specific KPIs
            total_stagiaires = stages.count()
            active_stagiaires = stages.filter(status='active').count()
            completed_stagiaires = stages.filter(status='completed').count()
            
            # Calculate average progress
            avg_progress = stages.aggregate(avg=Avg('progress'))['avg'] or 0
            
            # Get evaluations for tuteur's stagiaires
            evaluations = Evaluation.objects.filter(evaluated__in=stages.values_list('stagiaire', flat=True))
            avg_satisfaction = evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 0
            
            return Response({
                "total_stagiaires": total_stagiaires,
                "active_stagiaires": active_stagiaires,
                "completed_stagiaires": completed_stagiaires,
                "average_progress": round(avg_progress, 1),
                "average_satisfaction": round(avg_satisfaction, 1),
                "stages": StageListSerializer(stages, many=True).data,
                "recent_evaluations": EvaluationSerializer(evaluations.order_by('-created_at')[:5], many=True).data
            })
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors du calcul des KPI tuteur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_institute_performance(self):
        """Calculate performance metrics by institute"""
        institutes = User.objects.filter(role='stagiaire').values_list('institut', flat=True).distinct()
        performance_data = []
        
        for institut in institutes:
            if not institut:
                continue
                
            stagiaires = User.objects.filter(role='stagiaire', institut=institut)
            stages = Stage.objects.filter(stagiaire__in=stagiaires)
            
            total_stagiaires = stagiaires.count()
            completed_stages = stages.filter(status='completed').count()
            total_stages = stages.count()
            
            reussite = round((completed_stages / total_stages * 100), 1) if total_stages > 0 else 0
            
            # Calculate average satisfaction
            evaluations = Evaluation.objects.filter(evaluated__in=stagiaires)
            satisfaction = evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 4.5
            
            # Calculate abandonment rate
            abandoned = stages.filter(status='cancelled').count()
            abandon = round((abandoned / total_stages * 100), 1) if total_stages > 0 else 0
            
            performance_data.append({
                "institut": institut,
                "stagiaires": total_stagiaires,
                "reussite": reussite,
                "satisfaction": round(satisfaction, 1),
                "abandon": abandon
            })
        
        return performance_data

    def generate_kpi_alerts(self, taux_reussite, satisfaction_moyenne, taux_abandon):
        """Generate alerts based on KPI thresholds"""
        alertes = []
        
        # Check success rate
        if taux_reussite < 80:
            alertes.append({
                "type": "warning",
                "titre": "Taux de réussite faible",
                "description": f"Le taux de réussite ({taux_reussite}%) est en dessous de l'objectif (80%)",
                "niveau": "warning",
                "icon": "AlertTriangle"
            })
        
        # Check satisfaction
        if satisfaction_moyenne < 4.0:
            alertes.append({
                "type": "error",
                "titre": "Satisfaction en baisse",
                "description": f"La satisfaction moyenne ({satisfaction_moyenne}/5) nécessite une attention",
                "niveau": "error",
                "icon": "Star"
            })
        
        # Check abandonment rate
        if taux_abandon > 15:
            alertes.append({
                "type": "error",
                "titre": "Taux d'abandon élevé",
                "description": f"Le taux d'abandon ({taux_abandon}%) dépasse le seuil acceptable (15%)",
                "niveau": "error",
                "icon": "Users"
            })
        
        # Add general info alerts
        alertes.append({
            "type": "info",
            "titre": "Progression des stagiaires",
            "description": "12 stagiaires avec progression < 30%",
            "niveau": "info",
            "icon": "TrendingUp"
        })
        
        return alertes

    def generate_positive_points(self, taux_reussite, satisfaction_moyenne, nombre_stagiaires):
        """Generate positive points based on good performance"""
        points = []
        
        if taux_reussite >= 90:
            points.append({
                "titre": "Objectifs dépassés",
                "description": "Taux de réussite supérieur aux attentes",
                "icon": "Award"
            })
        
        if satisfaction_moyenne >= 4.5:
            points.append({
                "titre": "Satisfaction élevée",
                "description": "Note moyenne en amélioration continue",
                "icon": "Star"
            })
        
        if nombre_stagiaires >= 200:
            points.append({
                "titre": "Croissance soutenue",
                "description": "+17% de stagiaires par rapport à l'objectif",
                "icon": "TrendingUp"
            })
        
        return points

    def calculate_stagiaire_kpi_scores(self, evaluations):
        """Calculate KPI scores for a stagiaire based on evaluations"""
        scores = {}
        
        for evaluation in evaluations:
            if evaluation.scores:
                for key, score in evaluation.scores.items():
                    if key not in scores:
                        scores[key] = []
                    scores[key].append(score)
        
        # Calculate averages
        average_scores = {}
        for key, score_list in scores.items():
            if score_list:
                average_scores[key] = round(sum(score_list) / len(score_list), 1)
        
        return average_scores

    def generate_stagiaire_recommendations(self, kpi_scores, stage):
        """Generate recommendations for a stagiaire based on their KPI scores"""
        recommendations = {
            "points_forts": [],
            "axes_amelioration": []
        }
        
        for skill, score in kpi_scores.items():
            if score >= 16:
                recommendations["points_forts"].append({
                    "competence": skill,
                    "score": score,
                    "description": f"Excellente performance en {skill}"
                })
            elif score < 14:
                recommendations["axes_amelioration"].append({
                    "competence": skill,
                    "score": score,
                    "description": f"Besoin d'amélioration en {skill}",
                    "suggestion": f"Consultez votre tuteur pour des conseils sur {skill}"
                })
        
        return recommendations

class TestimonialsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'testimonial_type']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        # Role-based access control
        if user.role == 'admin':
            return Testimonial.objects.all()
        elif user.role == 'rh':
            return Testimonial.objects.all()
        elif user.role == 'tuteur':
            return Testimonial.objects.filter(stage__tuteur=user)
        elif user.role == 'stagiaire':
            return Testimonial.objects.filter(author=user)
        else:
            return Testimonial.objects.none()

class TestimonialCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialCreateSerializer

    def create(self, request, *args, **kwargs):
        try:
            print(f"TestimonialCreateView.create called with data: {request.data}")
            print(f"User: {request.user}")
            print(f"User authenticated: {request.user.is_authenticated}")
            
            # Check if user has a stage
            from .models import Stage
            user_stages = Stage.objects.filter(stagiaire=request.user)
            print(f"User stages: {user_stages.count()}")
            
            if not user_stages.exists():
                return Response(
                    {'error': 'Vous devez avoir un stage actif pour soumettre un témoignage'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if stage is provided in request
            stage_id = request.data.get('stage')
            if not stage_id:
                return Response(
                    {'error': 'Le champ stage est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if stage exists and belongs to user
            try:
                stage = Stage.objects.get(id=stage_id, stagiaire=request.user)
            except Stage.DoesNotExist:
                return Response(
                    {'error': 'Stage non trouvé ou ne vous appartient pas'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Handle video file validation
            if request.data.get('testimonial_type') == 'video':
                video_file = request.FILES.get('video_file')
                video_url = request.data.get('video_url')
                
                if not video_file and not video_url:
                    return Response(
                        {'error': 'Pour un témoignage vidéo, vous devez fournir soit un fichier vidéo soit une URL vidéo'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if video_file:
                    # Validate file size (50MB max)
                    if video_file.size > 50 * 1024 * 1024:
                        return Response(
                            {'error': 'Le fichier vidéo est trop volumineux. Taille maximum: 50MB'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validate file type
                    allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm']
                    if video_file.content_type not in allowed_types:
                        return Response(
                            {'error': 'Type de fichier non supporté. Formats acceptés: MP4, AVI, MOV, WMV, FLV, WEBM'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in TestimonialCreateView.create: {e}")
            return Response(
                {'error': f'Erreur lors de la création du témoignage: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        try:
            print(f"TestimonialCreateView.perform_create called")
            testimonial = serializer.save(author=self.request.user)
            print(f"Testimonial created: {testimonial}")
            
            # Create dashboard notifications for RH team
            from shared.models import Notification
            from auth_service.models import User
            
            # Get RH users
            rh_users = User.objects.filter(role='rh', is_active=True)
            
            for rh_user in rh_users:
                Notification.objects.create(
                    recipient=rh_user,
                    title='Nouveau témoignage soumis',
                    message=f'Un nouveau témoignage a été soumis par {testimonial.author.get_full_name()} nécessitant votre validation.',
                    notification_type='info',
                    related_stage=testimonial.stage
                )
                
        except Exception as e:
            print(f"Error in TestimonialCreateView.perform_create: {e}")
            raise

class TestimonialModerationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialModerationSerializer
    queryset = Testimonial.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        # Only RH and admin can moderate
        if user.role in ['rh', 'admin']:
            return Testimonial.objects.all()
        else:
            return Testimonial.objects.none()

    def perform_update(self, serializer):
        serializer.save(moderated_by=self.request.user)

class NotificationsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(
                id=pk, 
                recipient=request.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return Response({'status': 'success'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class NotificationsMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        return Response({'status': 'success'})

class PFEDocumentsListView(generics.ListAPIView):
    permission_classes = []  # Public access
    serializer_class = PFEDocumentListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'year', 'speciality']
    search_fields = ['title', 'authors', 'keywords', 'abstract']
    ordering_fields = ['year', 'created_at', 'download_count', 'view_count']
    ordering = ['-year', '-created_at']

    def get_queryset(self):
        # Only show published documents for public access
        return PFEDocument.objects.filter(status='published')

class PFEDocumentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEDocumentSerializer
    queryset = PFEDocument.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return PFEDocument.objects.all()
        else:
            return PFEDocument.objects.filter(status='published')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PFEDocumentCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEDocumentCreateSerializer

    def perform_create(self, serializer):
        serializer.save(published_by=self.request.user)

class PFEDocumentUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEDocumentSerializer
    queryset = PFEDocument.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return PFEDocument.objects.all()
        else:
            return PFEDocument.objects.none()

class OffreStageListView(APIView):
    """
    List all internship offers with optional filtering on existing fields only
    """
    permission_classes = []  # Public access

    def get(self, request):
        try:
            # Get query parameters for existing fields only
            specialite = request.query_params.get('specialite')
            diplome = request.query_params.get('diplome')
            ville = request.query_params.get('ville')
            keywords = request.query_params.get('keywords')
            title = request.query_params.get('title')
            reference = request.query_params.get('reference')
            description = request.query_params.get('description')
            objectifs = request.query_params.get('objectifs')
            nombre_postes = request.query_params.get('nombre_postes')
            search = request.query_params.get('search')

            # Start with base queryset
            if request.user.is_authenticated and request.user.role == 'rh' and request.user.entreprise:
                # RH users see only offers from their company
                queryset = OffreStage.objects.filter(entreprise=request.user.entreprise)
            else:
                # Public users and admins see all offers
                queryset = OffreStage.objects.all()

            if specialite:
                queryset = queryset.filter(specialite__icontains=specialite)
            if diplome:
                queryset = queryset.filter(diplome__icontains=diplome)
            if ville:
                queryset = queryset.filter(ville__icontains=ville)
            if keywords:
                queryset = queryset.filter(keywords__icontains=keywords)
            if title:
                queryset = queryset.filter(title__icontains=title)
            if reference:
                queryset = queryset.filter(reference__icontains=reference)
            if description:
                queryset = queryset.filter(description__icontains=description)
            if objectifs:
                queryset = queryset.filter(objectifs__icontains=objectifs)
            if nombre_postes:
                queryset = queryset.filter(nombre_postes=nombre_postes)
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(reference__icontains=search) |
                    Q(description__icontains=search) |
                    Q(objectifs__icontains=search) |
                    Q(specialite__icontains=search) |
                    Q(diplome__icontains=search) |
                    Q(ville__icontains=search) |
                    Q(keywords__icontains=search)
                )

            serializer = OffreStageListSerializer(queryset, many=True)
            return Response({
                'results': serializer.data,
                'count': queryset.count()
            })
        except Exception as e:
            return Response(
                {'error': f'Error fetching internship offers: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OffreStageDetailView(APIView):
    """
    Get details of a specific internship offer
    """
    permission_classes = []  # Public access
    
    def get(self, request, offre_id):
        try:
            offre = get_object_or_404(OffreStage, id=offre_id)
            
            # Increment view count
            offre.increment_views()
            
            serializer = OffreStageSerializer(offre)
            return Response(serializer.data)
            
        except OffreStage.DoesNotExist:
            return Response(
                {'error': 'Internship offer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching internship offer: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OffreStageCreateView(APIView):
    """
    Create a new internship offer (admin/RH only)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Check if user has permission (admin or RH)
            if request.user.role not in ['admin', 'rh']:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Prepare data with entreprise for RH users
            data = request.data.copy()
            if request.user.role == 'rh' and request.user.entreprise:
                data['entreprise'] = request.user.entreprise.id
            elif request.user.role == 'rh' and not request.user.entreprise:
                return Response(
                    {'error': 'RH users must be assigned to a company to create offers'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = OffreStageCreateSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                offre = serializer.save()
                return Response(
                    OffreStageSerializer(offre).data, 
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': f'Error creating internship offer: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OffreStageUpdateView(APIView):
    """
    Update an internship offer (admin/RH only)
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request, offre_id):
        try:
            print(f"[DEBUG] Update request for offre_id: {offre_id}")
            # Check if user has permission
            if request.user.role not in ['admin', 'rh']:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            try:
                # Get offre with company-specific access control
                if request.user.role == 'rh' and request.user.entreprise:
                    offre = OffreStage.objects.get(id=offre_id, entreprise=request.user.entreprise)
                else:
                    offre = OffreStage.objects.get(id=offre_id)
                print(f"[DEBUG] OffreStage found: {offre}")
            except OffreStage.DoesNotExist:
                print(f"[DEBUG] OffreStage with id {offre_id} does not exist!")
                return Response({'error': 'OffreStage not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = OffreStageSerializer(offre, data=request.data, partial=True)
            if serializer.is_valid():
                offre = serializer.save()
                return Response(OffreStageSerializer(offre).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': f'Error updating internship offer: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OffreStageDeleteView(APIView):
    """
    Delete an internship offer (admin/RH only)
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, offre_id):
        try:
            # Check if user has permission
            if request.user.role not in ['admin', 'rh']:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get offre with company-specific access control
            if request.user.role == 'rh' and request.user.entreprise:
                offre = get_object_or_404(OffreStage, id=offre_id, entreprise=request.user.entreprise)
            else:
                offre = get_object_or_404(OffreStage, id=offre_id)
            offre.delete()
            return Response({'message': 'Internship offer deleted successfully'})
            
        except Exception as e:
            return Response(
                {'error': f'Error deleting internship offer: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OffreStageApplyView(APIView):
    """
    Apply for an internship offer (increment application count)
    """
    permission_classes = []  # Public access
    
    def post(self, request, offre_id):
        try:
            offre = get_object_or_404(OffreStage, id=offre_id)
            
            # Check if offer is still active
            if not offre.is_active:
                return Response(
                    {'error': 'This internship offer is no longer active'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Increment application count
            offre.increment_applications()
            
            return Response({
                'message': 'Application submitted successfully',
                'contact_email': offre.contact_email,
                'contact_nom': offre.contact_nom,
                'contact_telephone': offre.contact_telephone
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error applying for internship offer: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class PublicTestimonialsView(generics.ListAPIView):
    """
    Vue publique pour récupérer les témoignages approuvés
    """
    permission_classes = []  # Public access
    serializer_class = TestimonialSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['testimonial_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Testimonial.objects.filter(status='approved')

class TestimonialUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TestimonialCreateSerializer
    queryset = Testimonial.objects.all()

    def get_queryset(self):
        return Testimonial.objects.filter(author=self.request.user)

    def update(self, request, *args, **kwargs):
        try:
            # Handle video file validation for updates
            if request.data.get('testimonial_type') == 'video':
                video_file = request.FILES.get('video_file')
                video_url = request.data.get('video_url')
                
                if not video_file and not video_url:
                    return Response(
                        {'error': 'Pour un témoignage vidéo, vous devez fournir soit un fichier vidéo soit une URL vidéo'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if video_file:
                    # Validate file size (50MB max)
                    if video_file.size > 50 * 1024 * 1024:
                        return Response(
                            {'error': 'Le fichier vidéo est trop volumineux. Taille maximum: 50MB'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validate file type
                    allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm']
                    if video_file.content_type not in allowed_types:
                        return Response(
                            {'error': 'Type de fichier non supporté. Formats acceptés: MP4, AVI, MOV, WMV, FLV, WEBM'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in TestimonialUpdateView.update: {e}")
            return Response(
                {'error': f'Erreur lors de la mise à jour du témoignage: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_update(self, serializer):
        # Reset status to pending when updating
        serializer.save(status='pending')

class MyInternshipView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StageSerializer

    def get_object(self):
        user = self.request.user
        if user.role == 'stagiaire':
            return Stage.objects.filter(stagiaire=user, status='active').first()
        else:
            return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {'error': 'Aucun stage actif trouvé pour cet utilisateur'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PFEReportsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEReportListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'year', 'speciality']
    search_fields = ['title', 'abstract', 'keywords']
    ordering_fields = ['created_at', 'submitted_at', 'approved_at', 'year']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return PFEReport.objects.all()
        elif user.role == 'rh':
            return PFEReport.objects.filter(status__in=['approved', 'archived'])
        elif user.role == 'tuteur':
            return PFEReport.objects.filter(tuteur=user)
        elif user.role == 'stagiaire':
            return PFEReport.objects.filter(stagiaire=user)
        else:
            return PFEReport.objects.none()

class PFEReportDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEReportSerializer
    queryset = PFEReport.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return PFEReport.objects.all()
        elif user.role == 'rh':
            return PFEReport.objects.filter(status__in=['approved', 'archived'])
        elif user.role == 'tuteur':
            return PFEReport.objects.filter(tuteur=user)
        elif user.role == 'stagiaire':
            return PFEReport.objects.filter(stagiaire=user)
        else:
            return PFEReport.objects.none()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PFEReportCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEReportCreateSerializer

    def perform_create(self, serializer):
        serializer.save()

class PFEReportUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEReportUpdateSerializer
    queryset = PFEReport.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'stagiaire':
            return PFEReport.objects.filter(stagiaire=user, status__in=['draft', 'rejected'])
        return PFEReport.objects.none()

class PFEReportSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            report = get_object_or_404(PFEReport, id=pk, stagiaire=request.user)
            
            if report.status not in ['draft', 'rejected']:
                return Response(
                    {'error': 'Seuls les rapports en brouillon ou rejetés peuvent être soumis'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            report.submit()
            
            # Create notification for tuteur
            if report.tuteur:
                Notification.objects.create(
                    recipient=report.tuteur,
                    title="Nouveau rapport PFE soumis",
                    message=f"Le stagiaire {report.stagiaire.get_full_name()} a soumis son rapport PFE '{report.title}' pour révision.",
                    notification_type='info',
                    related_stage=report.stage
                )
            
            return Response({
                'message': 'Rapport soumis avec succès',
                'status': report.status
            })
            
        except PFEReport.DoesNotExist:
            return Response(
                {'error': 'Rapport non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la soumission: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PFEReportValidationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PFEReportValidationSerializer
    queryset = PFEReport.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role in ['tuteur', 'admin']:
            return PFEReport.objects.filter(tuteur=user, status='submitted')
        return PFEReport.objects.none()

    def perform_update(self, serializer):
        report = serializer.save()
        
        # Create notification for stagiaire
        if report.status == PFEReport.Status.APPROVED:
            Notification.objects.create(
                recipient=report.stagiaire,
                title="Rapport PFE approuvé",
                message=f"Votre rapport PFE '{report.title}' a été approuvé par votre tuteur.",
                notification_type='success',
                related_stage=report.stage
            )
        elif report.status == PFEReport.Status.REJECTED:
            Notification.objects.create(
                recipient=report.stagiaire,
                title="Rapport PFE rejeté",
                message=f"Votre rapport PFE '{report.title}' a été rejeté. Veuillez consulter les commentaires et le corriger.",
                notification_type='warning',
                related_stage=report.stage
            )

class PFEReportArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            # Only RH and admin can archive reports
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            report = get_object_or_404(PFEReport, id=pk, status='approved')
            report.archive()
            
            return Response({
                'message': 'Rapport archivé avec succès',
                'status': report.status
            })
            
        except PFEReport.DoesNotExist:
            return Response(
                {'error': 'Rapport approuvé non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'archivage: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PFEReportDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = get_object_or_404(PFEReport, id=pk)
            
            # Check permissions
            user = request.user
            if user.role not in ['admin', 'rh'] and user != report.stagiaire and user != report.tuteur:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Increment download count
            report.increment_download_count()
            
            # Return file URL
            return Response({
                'download_url': request.build_absolute_uri(report.pdf_file.url),
                'filename': report.pdf_file.name.split('/')[-1]
            })
            
        except PFEReport.DoesNotExist:
            return Response(
                {'error': 'Rapport non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class KPISurveySystemView(APIView):
    """
    KPI Survey System that implements the complete flowchart:
    1. System triggers survey
    2. Stagiaire receives notification
    3. Stagiaire responds to survey
    4. System collects response
    5. System calculates KPI indicators
    6. Update dashboard
    7. Generate automatic reports
    8. Check KPI critical threshold
    9. Alert RH for action if needed
    10. RH analyzes results
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Trigger a new KPI survey for all active stagiaires"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all active stagiaires
            active_stagiaires = User.objects.filter(role='stagiaire')
            active_stages = Stage.objects.filter(stagiaire__in=active_stagiaires, status='active')
            
            # Create survey notifications
            notifications_created = 0
            for stage in active_stages:
                # Create notification for stagiaire
                notification = Notification.objects.create(
                    title="Nouveau sondage KPI disponible",
                    message="Un nouveau sondage d'évaluation KPI est disponible. Veuillez y répondre pour améliorer votre suivi.",
                    notification_type='info',
                    user=stage.stagiaire
                )
                notifications_created += 1
                
                # Create notification for tuteur if exists
                if stage.tuteur:
                    Notification.objects.create(
                        title="Sondage KPI lancé",
                        message=f"Un sondage KPI a été lancé pour {stage.stagiaire.prenom} {stage.stagiaire.nom}",
                        notification_type='info',
                        user=stage.tuteur
                    )
            
            return Response({
                'message': f'Sondage KPI déclenché avec succès',
                'notifications_created': notifications_created,
                'active_stagiaires': active_stagiaires.count(),
                'next_survey_date': (timezone.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors du déclenchement du sondage: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Get survey status and statistics"""
        try:
            # Get survey statistics
            total_stagiaires = User.objects.filter(role='stagiaire').count()
            active_stagiaires = Stage.objects.filter(status='active').count()
            
            # Get recent evaluations
            recent_evaluations = Evaluation.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            # Calculate response rate
            response_rate = round((recent_evaluations / active_stagiaires * 100), 1) if active_stagiaires > 0 else 0
            
            # Get pending surveys
            pending_surveys = active_stagiaires - recent_evaluations
            
            return Response({
                'survey_status': {
                    'total_stagiaires': total_stagiaires,
                    'active_stagiaires': active_stagiaires,
                    'recent_evaluations': recent_evaluations,
                    'response_rate': response_rate,
                    'pending_surveys': pending_surveys,
                    'last_survey_date': '2024-12-15',
                    'next_survey_date': '2024-12-22',
                    'surveys_active': True
                }
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération du statut: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class KPISurveyResponseView(APIView):
    """
    Handle KPI survey responses from stagiaires
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Submit a KPI survey response"""
        try:
            if request.user.role != 'stagiaire':
                return Response(
                    {'error': 'Seuls les stagiaires peuvent répondre aux sondages KPI'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get user's active stage
            stage = Stage.objects.filter(stagiaire=request.user, status='active').first()
            if not stage:
                return Response(
                    {'error': 'Aucun stage actif trouvé'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get survey data
            survey_data = request.data.get('survey_data', {})
            evaluation_type = request.data.get('evaluation_type', 'stagiaire_self')
            
            # Create evaluation
            evaluation = Evaluation.objects.create(
                evaluation_type=evaluation_type,
                scores=survey_data,
                overall_score=self.calculate_overall_score(survey_data),
                is_completed=True,
                completed_at=timezone.now(),
                evaluator=request.user,
                evaluated=request.user,
                stage=stage
            )
            
            # Mark notification as read
            Notification.objects.filter(
                user=request.user,
                title="Nouveau sondage KPI disponible"
            ).update(is_read=True, read_at=timezone.now())
            
            # Check for critical thresholds and alert RH if needed
            self.check_critical_thresholds(evaluation, stage)
            
            return Response({
                'message': 'Réponse au sondage KPI soumise avec succès',
                'evaluation_id': evaluation.id,
                'overall_score': evaluation.overall_score
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la soumission: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def calculate_overall_score(self, survey_data):
        """Calculate overall score from survey responses"""
        if not survey_data:
            return 0
        
        total_score = sum(survey_data.values())
        max_possible = len(survey_data) * 20  # Assuming max score is 20 per question
        
        return round((total_score / max_possible) * 20, 1)

    def check_critical_thresholds(self, evaluation, stage):
        """Check if KPI thresholds are critical and alert RH"""
        critical_threshold = 12  # Score below 12/20 is considered critical
        
        if evaluation.overall_score < critical_threshold:
            # Alert RH
            rh_users = User.objects.filter(role='rh')
            for rh_user in rh_users:
                Notification.objects.create(
                    title="Alerte KPI Critique",
                    message=f"Le stagiaire {evaluation.evaluated.prenom} {evaluation.evaluated.nom} a un score KPI critique: {evaluation.overall_score}/20",
                    notification_type='error',
                    user=rh_user
                )

class KPIReportGenerationView(APIView):
    """
    Generate automatic KPI reports
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate KPI report"""
        try:
            if request.user.role not in ['rh', 'admin']:
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            report_type = request.data.get('report_type', 'monthly')
            
            # Generate report based on type
            if report_type == 'monthly':
                report_data = self.generate_monthly_report()
            elif report_type == 'weekly':
                report_data = self.generate_weekly_report()
            else:
                report_data = self.generate_comprehensive_report()
            
            return Response({
                'message': f'Rapport KPI {report_type} généré avec succès',
                'report_data': report_data,
                'generated_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la génération du rapport: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_monthly_report(self):
        """Generate monthly KPI report"""
        # Get data for the last month
        last_month = timezone.now() - timedelta(days=30)
        
        # Calculate monthly KPIs
        monthly_evaluations = Evaluation.objects.filter(created_at__gte=last_month)
        avg_score = monthly_evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 0
        
        # Get stage completion rate
        completed_stages = Stage.objects.filter(
            status='completed',
            updated_at__gte=last_month
        ).count()
        total_stages = Stage.objects.filter(updated_at__gte=last_month).count()
        completion_rate = round((completed_stages / total_stages * 100), 1) if total_stages > 0 else 0
        
        return {
            'period': 'Mensuel',
            'average_score': round(avg_score, 1),
            'completion_rate': completion_rate,
            'total_evaluations': monthly_evaluations.count(),
            'total_stages': total_stages,
            'completed_stages': completed_stages
        }

    def generate_weekly_report(self):
        """Generate weekly KPI report"""
        # Get data for the last week
        last_week = timezone.now() - timedelta(days=7)
        
        weekly_evaluations = Evaluation.objects.filter(created_at__gte=last_week)
        avg_score = weekly_evaluations.aggregate(avg=Avg('overall_score'))['avg'] or 0
        
        return {
            'period': 'Hebdomadaire',
            'average_score': round(avg_score, 1),
            'total_evaluations': weekly_evaluations.count(),
            'response_rate': 85  # Mock data
        }

    def generate_comprehensive_report(self):
        """Generate comprehensive KPI report"""
        # Get all-time data
        total_evaluations = Evaluation.objects.count()
        avg_score = Evaluation.objects.aggregate(avg=Avg('overall_score'))['avg'] or 0
        
        # Get stage statistics
        total_stages = Stage.objects.count()
        completed_stages = Stage.objects.filter(status='completed').count()
        active_stages = Stage.objects.filter(status='active').count()
        
        # Calculate success rate
        success_rate = round((completed_stages / total_stages * 100), 1) if total_stages > 0 else 0
        
        return {
            'period': 'Complet',
            'average_score': round(avg_score, 1),
            'success_rate': success_rate,
            'total_evaluations': total_evaluations,
            'total_stages': total_stages,
            'completed_stages': completed_stages,
            'active_stages': active_stages
        }


# Filiale (Entreprise) Views
class EntreprisesListView(APIView):
    """List all filiales"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            entreprises = Entreprise.objects.filter(is_active=True).order_by('nom')
            serializer = EntrepriseListSerializer(entreprises, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des entreprises: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EntrepriseDetailView(APIView):
    """Get details of a specific filiale"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            entreprise = get_object_or_404(Entreprise, pk=pk, is_active=True)
            serializer = EntrepriseSerializer(entreprise)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération de l\'entreprise: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EntrepriseStagesView(APIView):
    """Get all stages for a specific filiale"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            entreprise = get_object_or_404(Entreprise, pk=pk, is_active=True)
            stages = Stage.objects.filter(company_entreprise=entreprise).order_by('-created_at')
            serializer = StageListSerializer(stages, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des stages: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EntrepriseOffresView(APIView):
    """Get all offres for a specific filiale"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            entreprise = get_object_or_404(Entreprise, pk=pk, is_active=True)
            offres = OffreStage.objects.filter(entreprise=entreprise).order_by('-created_at')
            serializer = OffreStageListSerializer(offres, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la récupération des offres: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
