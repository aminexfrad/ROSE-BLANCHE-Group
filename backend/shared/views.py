"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

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
            
            # Create notification for RH team
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
            print(f"[DEBUG] Update request for offre_id: {offre_id}")
            # Check if user has permission
            if request.user.role not in ['admin', 'rh']:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            try:
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
