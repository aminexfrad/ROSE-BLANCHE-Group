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
from shared.models import Stage


class DemandeCreateView(generics.CreateAPIView):
    """Public endpoint for submitting demande de stage - allows both authenticated and anonymous users"""
    serializer_class = DemandeSerializer
    permission_classes = [AllowAny]  # Allow public submissions
    
    def perform_create(self, serializer):
        from rest_framework.exceptions import APIException
        
        # Get email from the request
        email = serializer.validated_data.get('email')
        
        # Check if user is authenticated and has candidat profile
        if self.request.user.is_authenticated and hasattr(self.request.user, 'candidat_profile'):
            candidat = self.request.user.candidat_profile
            
            # Check if candidate can submit more applications
            if not candidat.peut_soumettre:
                raise APIException(
                    f"Vous avez atteint la limite de {candidat.nombre_demandes_max} candidatures"
                )
        else:
            # For anonymous users, check if they have too many pending requests
            existing_count = Demande.objects.filter(
                email=email,
                status__in=[Demande.Status.PENDING, Demande.Status.APPROVED]
            ).count()
            
            if existing_count >= 4:  # Limit anonymous users to 4 requests
                raise APIException("Vous avez atteint la limite de 4 demandes de stage.")
        
        # Check for existing pending/approved PFE demande for this email
        type_stage = serializer.validated_data.get('type_stage')
        offer_ids = serializer.validated_data.get('offer_ids', [])
        
        if type_stage == 'Stage PFE':
            # Allow up to 4 different PFE demands with different offers
            # Count only pending and approved demands (rejected ones don't count towards the limit)
            existing_pfe_demandes = Demande.objects.filter(
                email=email,
                type_stage='Stage PFE',
                status__in=[Demande.Status.PENDING, Demande.Status.APPROVED]
            )
            
            # Check if this specific combination of offers already exists
            if offer_ids:
                # Only allow 1 offer per demand
                if len(offer_ids) > 1:
                    raise APIException("Vous ne pouvez sélectionner qu'une seule offre par demande.")
                
                # Check if this specific offer is already in existing demands
                selected_offer_id = offer_ids[0]  # Only one offer
                
                for existing_demande in existing_pfe_demandes:
                    existing_offres = existing_demande.offres.all()
                    existing_offer_ids = [offre.id for offre in existing_offres]
                    
                    # If this offer is already in an existing demand, block the submission
                    if selected_offer_id in existing_offer_ids:
                        # Check the status of this offer in the existing demande
                        from .models import DemandeOffre
                        try:
                            demande_offre = DemandeOffre.objects.get(
                                demande=existing_demande,
                                offre_id=selected_offer_id
                            )
                            if demande_offre.status == 'accepted':
                                raise APIException(f"Vous avez déjà une demande acceptée pour l'offre {selected_offer_id}. Chaque offre ne peut être sélectionnée qu'une seule fois.")
                            elif demande_offre.status == 'rejected':
                                raise APIException(f"Vous avez déjà soumis une demande pour l'offre {selected_offer_id} qui a été rejetée. Chaque offre ne peut être sélectionnée qu'une seule fois.")
                            else:
                                raise APIException(f"Vous avez déjà une demande en attente pour l'offre {selected_offer_id}. Chaque offre ne peut être sélectionnée qu'une seule fois.")
                        except DemandeOffre.DoesNotExist:
                            raise APIException(f"Vous avez déjà soumis une demande pour l'offre {selected_offer_id}. Chaque offre ne peut être sélectionnée qu'une seule fois.")
                
                # Also check all previous demands (including rejected ones) for accepted offers
                all_previous_demandes = Demande.objects.filter(
                    email=email,
                    type_stage='Stage PFE'
                )
                
                for previous_demande in all_previous_demandes:
                    if previous_demande.status == Demande.Status.REJECTED:
                        # Check if the selected offer was accepted in this rejected demande
                        from .models import DemandeOffre
                        accepted_offres = DemandeOffre.objects.filter(
                            demande=previous_demande,
                            status='accepted'
                        )
                        accepted_offer_ids = [do.offre.id for do in accepted_offres]
                        
                        if selected_offer_id in accepted_offer_ids:
                            raise APIException("Vous ne pouvez pas soumettre une nouvelle demande pour une offre qui a déjà été acceptée dans une demande précédente.")
                
                # Check total number of PFE demands (should not exceed 4)
                # Only count pending and approved demands
                active_demands_count = existing_pfe_demandes.count()
                if active_demands_count >= 4:
                    raise APIException(f"Vous avez atteint la limite de 4 demandes PFE maximum (actuellement {active_demands_count} en cours). Vous ne pouvez plus soumettre de nouvelles demandes.")
                
            else:
                # For PFE demands, exactly one offer must be selected
                raise APIException("Pour un stage PFE, vous devez sélectionner exactement une offre.")
                
                # If no specific offers selected, check total count
                active_demands_count = existing_pfe_demandes.count()
                if active_demands_count >= 4:
                    raise APIException(f"Vous avez atteint la limite de 4 demandes PFE maximum (actuellement {active_demands_count} en cours). Vous ne pouvez plus soumettre de nouvelles demandes.")
        
        try:
            demande = serializer.save()
            
            # Increment candidate's application count if authenticated
            if self.request.user.is_authenticated and hasattr(self.request.user, 'candidat_profile'):
                candidat = self.request.user.candidat_profile
                candidat.increment_demandes_count()
            
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
        # Only RH and admin can view demandes
        if self.request.user.role in ['rh', 'admin']:
            if self.request.user.role == 'rh' and self.request.user.entreprise:
                # RH users can only see demandes for their company
                return Demande.objects.filter(entreprise=self.request.user.entreprise)
            elif self.request.user.role == 'admin':
                # Admin can see all demandes
                return Demande.objects.all()
            else:
                # RH users without company assignment see no demandes
                return Demande.objects.none()
        return Demande.objects.none()


class DemandeDetailView(generics.RetrieveAPIView):
    """Get detailed demande information"""
    serializer_class = DemandeDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only RH and admin can view demandes
        if self.request.user.role in ['rh', 'admin']:
            if self.request.user.role == 'rh' and self.request.user.entreprise:
                # RH users can only see demandes for their company
                return Demande.objects.filter(entreprise=self.request.user.entreprise)
            elif self.request.user.role == 'admin':
                # Admin can see all demandes
                return Demande.objects.all()
            else:
                # RH users without company assignment see no demandes
                return Demande.objects.none()
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
        
        # Create active stage for the stagiaire
        
        # Check if stage already exists for this demande
        existing_stage = Stage.objects.filter(demande=demande).first()
        if not existing_stage:
            # Create a new stage
            stage = Stage.objects.create(
                demande=demande,
                stagiaire=user,
                title=f"Stage {demande.type_stage} - {demande.prenom} {demande.nom}",
                description=f"Stage de {demande.specialite} chez {demande.institut}",
                company_entreprise=demande.entreprise,  # Use the entreprise from demande
                company_name=demande.entreprise.nom if demande.entreprise else (demande.institut or "Rose Blanche Group"),
                location="Tunis",  # Default location
                start_date=demande.date_debut,
                end_date=demande.date_fin,
                status='active',
                progress=0
            )
        else:
            # Update existing stage to active
            existing_stage.status = 'active'
            existing_stage.stagiaire = user
            existing_stage.company_entreprise = demande.entreprise
            existing_stage.company_name = demande.entreprise.nom if demande.entreprise else (demande.institut or "Rose Blanche Group")
            existing_stage.save()
            stage = existing_stage
        
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
                },
                'stage_created': {
                    'id': stage.id,
                    'title': stage.title,
                    'status': stage.status
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
                },
                'stage_created': {
                    'id': stage.id,
                    'title': stage.title,
                    'status': stage.status
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



