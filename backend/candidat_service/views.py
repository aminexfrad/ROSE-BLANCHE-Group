"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.conf import settings

from .serializers import (
    CandidatSerializer, CandidatCreateSerializer, CandidatDashboardSerializer
)
from shared.models import Candidat, OffreStage, Demande, Candidature
from shared.serializers import OffreStageSerializer, CandidatureSerializer, CandidatureCreateSerializer
from shared.utils import MailService


class CandidatRegistrationView(generics.CreateAPIView):
    """View for candidate registration"""
    permission_classes = [AllowAny]
    serializer_class = CandidatCreateSerializer
    
    def create(self, request, *args, **kwargs):
        """Create candidate account and return tokens"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Keep plaintext password for the welcome email before saving
        raw_password = request.data.get('password')
        candidat = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(candidat.user)

        try:
            # Send welcome email with credentials
            MailService.send_email(
                subject='Bienvenue sur StageBloom – Vos identifiants',
                recipient_list=[candidat.user.email],
                template_name='emails/candidat_welcome.txt',
                html_template_name='emails/candidat_welcome.html',
                context={
                    'full_name': f"{candidat.user.prenom} {candidat.user.nom}",
                    'email': candidat.user.email,
                    'password': raw_password,
                    'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
                },
                fail_silently=True
            )
        except Exception:
            # Do not block registration if email fails
            pass
        
        return Response({
            'message': 'Compte candidat créé avec succès',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'candidat': CandidatSerializer(candidat).data
        }, status=status.HTTP_201_CREATED)


class CandidatLoginView(generics.GenericAPIView):
    """View for candidate login"""
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Authenticate candidate and return tokens"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email et mot de passe sont requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({
                'error': 'Email ou mot de passe incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is a candidate
        if not hasattr(user, 'candidat_profile'):
            return Response({
                'error': 'Ce compte n\'est pas un compte candidat'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Additional check: ensure user role is candidate
        if user.role != 'candidat':
            return Response({
                'error': 'Ce compte n\'est pas un compte candidat. Veuillez utiliser la connexion utilisateur.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not user.is_active:
            return Response({
                'error': 'Ce compte a été désactivé'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.save()
        
        return Response({
            'message': 'Connexion réussie',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'candidat': CandidatSerializer(user.candidat_profile).data
        })


class CandidatDemandesView(generics.ListAPIView):
    """View for candidates to see their own demandes (stage requests)"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get demandes for the authenticated candidate"""
        if not hasattr(self.request.user, 'candidat_profile'):
            return Demande.objects.none()
        
        # Get demandes by candidate's email
        return Demande.objects.filter(email=self.request.user.email)
    
    def list(self, request, *args, **kwargs):
        """Return simplified demande data"""
        queryset = self.get_queryset()
        
        # Create simple data structure
        demandes_data = []
        for demande in queryset:
            demandes_data.append({
                'id': demande.id,
                'nom': demande.nom,
                'prenom': demande.prenom,
                'email': demande.email,
                'type_stage': demande.type_stage,
                'niveau': demande.niveau,
                'institut': demande.institut,
                'specialite': demande.specialite,
                'status': demande.status,
                'created_at': demande.created_at,
                'updated_at': demande.updated_at,
                'type': 'demande'  # Mark as demande type
            })
        
        return Response(demandes_data)


class CandidatDashboardView(generics.RetrieveAPIView):
    """View for candidate dashboard"""
    permission_classes = [IsAuthenticated]
    serializer_class = CandidatDashboardSerializer
    
    def get_object(self):
        """Get candidate profile for authenticated user"""
        if not hasattr(self.request.user, 'candidat_profile'):
            return None
        return self.request.user.candidat_profile
    
    def retrieve(self, request, *args, **kwargs):
        """Get candidate dashboard data"""
        candidat = self.get_object()
        if not candidat:
            return Response({
                'error': 'Profil candidat non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(candidat)
        return Response(serializer.data)


class CandidatProfileView(generics.RetrieveUpdateAPIView):
    """View for candidate profile management"""
    permission_classes = [IsAuthenticated]
    serializer_class = CandidatSerializer
    
    def get_object(self):
        """Get candidate profile for authenticated user"""
        if not hasattr(self.request.user, 'candidat_profile'):
            return None
        return self.request.user.candidat_profile
    
    def retrieve(self, request, *args, **kwargs):
        """Get candidate profile"""
        candidat = self.get_object()
        if not candidat:
            return Response({
                'error': 'Profil candidat non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(candidat)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update candidate profile"""
        candidat = self.get_object()
        if not candidat:
            return Response({
                'error': 'Profil candidat non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(candidat, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Profil mis à jour avec succès',
            'candidat': serializer.data
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def public_offres_list(request):
    """Public view for listing internship offers"""
    try:
        offres = OffreStage.objects.filter(
            status='open',
            validated=True
        ).select_related('entreprise')
        
        data = []
        for offre in offres:
            data.append({
                'id': offre.id,
                'reference': offre.reference,
                'title': offre.title,
                'description': offre.description,
                'entreprise': offre.entreprise.nom if offre.entreprise else None,
                'ville': offre.ville,
                'type': offre.type,
                'specialite': offre.specialite,
                'diplome': offre.diplome,
                'nombre_postes': offre.nombre_postes,
                'keywords': getattr(offre, 'keywords', '')
            })
        
        return Response({
            'count': len(data),
            'results': data
        })
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la récupération des offres: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_offre_detail(request, offre_id):
    """Public view for internship offer details"""
    try:
        offre = OffreStage.objects.get(
            id=offre_id,
            status='open',
            validated=True
        )
        
        data = {
            'id': offre.id,
            'reference': offre.reference,
            'title': offre.title,
            'description': offre.description,
            'objectifs': getattr(offre, 'objectifs', ''),
            'keywords': getattr(offre, 'keywords', ''),
            'entreprise': {
                'id': offre.entreprise.id,
                'nom': offre.entreprise.nom,
                'description': offre.entreprise.description,
                'ville': offre.entreprise.ville,
                'pays': offre.entreprise.pays
            } if offre.entreprise else None,
            'ville': offre.ville,
            'type': offre.type,
            'specialite': offre.specialite,
            'diplome': offre.diplome,
            'nombre_postes': offre.nombre_postes,
            'status': offre.status
        }
        
        return Response(data)
        
    except OffreStage.DoesNotExist:
        return Response({
            'error': 'Offre non trouvée'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la récupération de l\'offre: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_candidat_status(request):
    """Check if authenticated user is a candidate and their application status"""
    if not hasattr(request.user, 'candidat_profile'):
        return Response({
            'is_candidat': False,
            'message': 'Utilisateur non authentifié ou non candidat'
        }, status=status.HTTP_403_FORBIDDEN)
    
    candidat = request.user.candidat_profile
    
    return Response({
        'is_candidat': True,
        'candidat': {
            'id': candidat.id,
            'nombre_demandes_soumises': candidat.nombre_demandes_soumises,
            'demandes_restantes': candidat.demandes_restantes,
            'peut_soumettre': candidat.peut_soumettre
        }
    })


class CandidatCandidaturesView(generics.ListAPIView):
    """View for candidates to see their candidatures"""
    permission_classes = [IsAuthenticated]
    serializer_class = CandidatureSerializer
    
    def get_queryset(self):
        """Get candidatures for the authenticated candidate"""
        if not hasattr(self.request.user, 'candidat_profile'):
            return Candidature.objects.none()
        
        return Candidature.objects.filter(candidat=self.request.user.candidat_profile)


class CandidatCandidatureCreateView(generics.CreateAPIView):
    """View for candidates to create candidatures"""
    permission_classes = [IsAuthenticated]
    serializer_class = CandidatureCreateSerializer
    
    def perform_create(self, serializer):
        """Set the candidat when creating candidature"""
        serializer.save(candidat=self.request.user.candidat_profile)


class CandidatCandidatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for candidates to manage individual candidatures"""
    permission_classes = [IsAuthenticated]
    serializer_class = CandidatureSerializer
    
    def get_queryset(self):
        """Get candidatures for the authenticated candidate"""
        if not hasattr(self.request.user, 'candidat_profile'):
            return Candidature.objects.none()
        
        return Candidature.objects.filter(candidat=self.request.user.candidat_profile)
