from django.shortcuts import render
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

from .models import Stage, Step, Document, Evaluation, KPIQuestion, Testimonial, Notification, PFEDocument, OffreStage
from .serializers import (
    StageSerializer, StageListSerializer, StepSerializer, StepListSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentUploadSerializer,
    EvaluationSerializer, EvaluationCreateSerializer, KPIQuestionSerializer,
    TestimonialSerializer, TestimonialCreateSerializer, TestimonialModerationSerializer,
    NotificationSerializer, NotificationListSerializer,
    PFEDocumentSerializer, PFEDocumentListSerializer, PFEDocumentCreateSerializer,
    OffreStageSerializer, OffreStageListSerializer, OffreStageCreateSerializer
)
from auth_service.models import User
from auth_service.serializers import UserSerializer

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

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

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
    permission_classes = [IsAuthenticated]
    serializer_class = PFEDocumentListSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'year', 'speciality']
    search_fields = ['title', 'authors', 'keywords', 'abstract']
    ordering_fields = ['year', 'created_at', 'download_count', 'view_count']
    ordering = ['-year', '-created_at']

    def get_queryset(self):
        # Only show published documents to non-admin users
        if self.request.user.role == 'admin':
            return PFEDocument.objects.all()
        else:
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
    List all active internship offers with filtering and search
    """
    permission_classes = []  # Public access
    
    def get(self, request):
        try:
            # Get query parameters
            specialite = request.query_params.get('specialite')
            niveau = request.query_params.get('niveau')
            localisation = request.query_params.get('localisation')
            search = request.query_params.get('search')
            featured = request.query_params.get('featured', 'false').lower() == 'true'
            
            # Start with active offers
            queryset = OffreStage.objects.filter(status='open')
            
            # Apply filters
            if specialite:
                queryset = queryset.filter(specialite__icontains=specialite)
            if niveau:
                queryset = queryset.filter(niveau=niveau)
            if localisation:
                queryset = queryset.filter(localisation__icontains=localisation)
            if featured:
                queryset = queryset.filter(is_featured=True)
            if search:
                queryset = queryset.filter(
                    Q(titre__icontains=search) |
                    Q(entreprise__icontains=search) |
                    Q(description__icontains=search) |
                    Q(specialite__icontains=search)
                )
            
            # Order by featured first, then by creation date
            queryset = queryset.order_by('-is_featured', '-created_at')
            
            # Serialize
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
            
            serializer = OffreStageCreateSerializer(data=request.data, context={'request': request})
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
            # Check if user has permission
            if request.user.role not in ['admin', 'rh']:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            offre = get_object_or_404(OffreStage, id=offre_id)
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
