"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
# Email and PDF imports removed - only dashboard notifications now
import secrets
import string

from .models import Demande, DemandeOffre
from .serializers import (
    DemandeSerializer, DemandeListSerializer, DemandeDetailSerializer,
    DemandeApprovalSerializer, DemandeOffreStatusUpdateSerializer
)
from auth_service.models import User
from shared.utils import MailService


class DemandeCreateView(generics.CreateAPIView):
    """Public endpoint for submitting demande de stage"""
    serializer_class = DemandeSerializer
    permission_classes = [AllowAny]
    # The serializer now handles offer_ids and pfe_reference logic for grouped/single-offer PFE
    def perform_create(self, serializer):
        from rest_framework.exceptions import APIException
        # Check for existing pending/approved PFE demande for this candidate
        email = serializer.validated_data.get('email')
        cin = serializer.validated_data.get('cin')
        type_stage = serializer.validated_data.get('type_stage')
        offer_ids = serializer.validated_data.get('offer_ids', [])
        if type_stage in ['Stage PFE', "Stage de Fin d'Études"]:
            existing = Demande.objects.filter(
                email=email,
                type_stage__in=['Stage PFE', "Stage de Fin d'Études"],
                status__in=[Demande.Status.PENDING, Demande.Status.APPROVED]
            )
            if existing.exists():
                raise APIException("Vous avez déjà une demande PFE en attente ou en cours.")
            if offer_ids and len(offer_ids) > 4:
                raise APIException("Vous pouvez sélectionner jusqu’à 4 offres maximum.")
        try:
            demande = serializer.save()
            
            # Create dashboard notifications for RH users (NO EMAILS)
            from shared.models import Notification
            from auth_service.models import User
            
            # Get RH users
            rh_users = User.objects.filter(role='rh', is_active=True)
            
            for rh_user in rh_users:
                Notification.objects.create(
                    recipient=rh_user,
                    title='Nouvelle demande de stage',
                    message=f'Nouvelle candidature reçue de {demande.prenom} {demande.nom} ({demande.institut}) pour un stage {demande.type_stage}.',
                    notification_type='info'
                )
                
        except Exception as e:
            import traceback
            print('Error in DemandeCreateView.perform_create:', e)
            traceback.print_exc()
            from rest_framework.exceptions import APIException
            raise APIException(f"Erreur lors de la création de la demande: {str(e)}")
    
    # PDF generation removed - only dashboard notifications now
    
    # Email sending removed - only dashboard notifications now


class DemandeListView(generics.ListAPIView):
    """List demandes (RH view)"""
    serializer_class = DemandeListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type_stage', 'niveau', 'institut']
    search_fields = ['nom', 'prenom', 'email', 'institut', 'specialite', 'pfe_reference']
    ordering_fields = ['created_at', 'date_debut', 'date_fin']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only RH and admin can view all demandes
        if self.request.user.role in ['rh', 'admin']:
            return Demande.objects.all()
        return Demande.objects.none()


class DemandeDetailView(generics.RetrieveAPIView):
    """Get detailed demande information"""
    serializer_class = DemandeDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = Demande.objects.all()
    
    def get_queryset(self):
        # Only RH and admin can view demande details
        if self.request.user.role in ['rh', 'admin']:
            return Demande.objects.all()
        return Demande.objects.none()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_demande(request, pk):
    """Approve a demande and create user account"""
    if request.user.role not in ['rh', 'admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    demande = get_object_or_404(Demande, pk=pk)
    
    if demande.status != Demande.Status.PENDING:
        return Response(
            {'error': 'Cette demande a déjà été traitée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate password
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    try:
        # Check if user already exists
        existing_user = User.objects.filter(email=demande.email).first()
        if existing_user:
            # If user exists, use the existing user
            user = existing_user
            # Update user information if needed
            user.nom = demande.nom
            user.prenom = demande.prenom
            user.telephone = demande.telephone
            user.institut = demande.institut
            user.specialite = demande.specialite
            user.role = 'stagiaire'
            user.save()
        else:
            # Create new user account
            user = User.objects.create_user(
                email=demande.email,
                password=password,
                nom=demande.nom,
                prenom=demande.prenom,
                telephone=demande.telephone,
                institut=demande.institut,
                specialite=demande.specialite,
                role='stagiaire'
            )
        
        # Approve demande
        demande.approve(user_created=user)
        
        # Send acceptance email to candidate
        if existing_user:
            # If using existing user, don't send password in email
            MailService.send_acceptance_email(demande, None)
            return Response({
                'message': 'Demande approuvée avec succès (utilisateur existant)',
                'user_created': {
                    'id': user.id,
                    'email': user.email,
                    'password': None
                }
            }, status=status.HTTP_200_OK)
        else:
            # Send acceptance email with password for new user
            MailService.send_acceptance_email(demande, password)
            return Response({
                'message': 'Demande approuvée avec succès',
                'user_created': {
                    'id': user.id,
                    'email': user.email,
                    'password': password
                }
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print("DEBUG ERROR in approve_demande:", e)
        traceback.print_exc()
        return Response(
            {'error': f'Erreur lors de l\'approbation: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_demande(request, pk):
    """Reject a demande"""
    if request.user.role not in ['rh', 'admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = DemandeApprovalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    demande = get_object_or_404(Demande, pk=pk)
    
    if demande.status != Demande.Status.PENDING:
        return Response(
            {'error': 'Cette demande a déjà été traitée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Reject demande
        demande.reject(raison=serializer.validated_data.get('raison'))
        
        # Send rejection email to candidate
        MailService.send_rejection_email(demande, serializer.validated_data.get('raison'))
        
        return Response({
            'message': 'Demande rejetée avec succès'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print("DEBUG ERROR in reject_demande:", e)
        traceback.print_exc()
        return Response(
            {'error': f'Erreur lors du rejet: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_demande_offre_status(request, demande_id, offre_id):
    """RH: Update the status of a specific offer in a grouped demande (accept/reject) with PFE business rules"""
    if request.user.role not in ['rh', 'admin']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    try:
        do = DemandeOffre.objects.get(demande_id=demande_id, offre_id=offre_id)
    except DemandeOffre.DoesNotExist:
        return Response({'error': 'Demande-offre introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = DemandeOffreStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    new_status = serializer.validated_data['status']

    # Business rule: Only one accepted PFE offer per demande
    demande = do.demande
    is_pfe = demande.is_pfe_stage

    if new_status == 'accepted' and is_pfe:
        # Reject all other offers for this demande
        DemandeOffre.objects.filter(demande=demande).exclude(offre=do.offre).update(status='rejected')
        # Accept this offer
        do.status = 'accepted'
        do.save()
        # Send acceptance email for the accepted offer
        from shared.utils import MailService
        MailService.send_acceptance_email(demande)
        return Response({'id': do.id, 'demande': do.demande_id, 'offre': do.offre_id, 'status': do.status}, status=status.HTTP_200_OK)

    elif new_status == 'rejected' and is_pfe:
        do.status = 'rejected'
        do.save()
        # If all offers are now rejected, send global refusal email
        if not demande.demande_offres.filter(status='accepted').exists() and not demande.demande_offres.filter(status='pending').exists():
            from shared.utils import MailService
            MailService.send_rejection_email(demande, 'Toutes vos candidatures PFE ont été refusées.')
        return Response({'id': do.id, 'demande': do.demande_id, 'offre': do.offre_id, 'status': do.status}, status=status.HTTP_200_OK)

    # For non-PFE or fallback: just update status and send emails as before
    do.status = new_status
    do.save()
    if new_status == 'accepted':
        from shared.utils import MailService
        MailService.send_acceptance_email(demande)
    elif new_status == 'rejected':
        # If all offers are now rejected, send global refusal email
        if not demande.demande_offres.filter(status='accepted').exists() and not demande.demande_offres.filter(status='pending').exists():
            from shared.utils import MailService
            MailService.send_rejection_email(demande, 'Toutes vos candidatures ont été refusées.')
    return Response({'id': do.id, 'demande': do.demande_id, 'offre': do.offre_id, 'status': do.status}, status=status.HTTP_200_OK)



