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
                
                # IMPORTANT: Check if this specific offer is already used in ANY demande (including rejected ones)
                # This prevents candidates from applying to the same offer multiple times
                all_existing_demandes_for_offer = Demande.objects.filter(
                    email=email,
                    type_stage='Stage PFE',
                    offres__id=selected_offer_id
                )
                
                if all_existing_demandes_for_offer.exists():
                    raise APIException(
                        f"Vous avez déjà soumis une demande pour cette offre. "
                        f"Chaque offre ne peut être sélectionnée qu'une seule fois, "
                        f"même si la demande précédente a été rejetée."
                    )
                
                # Check total number of PFE demands (should not exceed 4)
                # Only count pending and approved demands
                active_demands_count = existing_pfe_demandes.count()
                if active_demands_count >= 4:
                    raise APIException(
                        f"Vous avez atteint la limite de 4 demandes PFE maximum "
                        f"(actuellement {active_demands_count} en cours). "
                        f"Vous ne pouvez plus soumettre de nouvelles demandes."
                    )
                
            else:
                # For PFE demands without offer_ids, check if we have pfe_reference
                if not serializer.validated_data.get('pfe_reference'):
                    raise APIException("Pour un stage PFE, vous devez soit sélectionner une offre, soit fournir une référence PFE.")
        
        try:
            demande = serializer.save()
            
            # Auto-fill entreprise and PFE reference from the selected offer or pfe_reference
            if offer_ids:
                from shared.models import OffreStage
                try:
                    offre = OffreStage.objects.get(id=offer_ids[0])
                    
                    # Auto-fill entreprise if not set
                    if offre.entreprise and not demande.entreprise:
                        demande.entreprise = offre.entreprise
                        demande.save(update_fields=['entreprise'])
                        print(f"✅ Entreprise auto-remplie: {offre.entreprise.nom}")
                    
                    # Auto-fill PFE reference if not set
                    if offre.reference and offre.reference != 'Inconnu' and not demande.pfe_reference:
                        demande.pfe_reference = offre.reference
                        demande.save(update_fields=['pfe_reference'])
                        print(f"✅ Référence PFE auto-remplie: {offre.reference}")
                    
                except OffreStage.DoesNotExist:
                    print(f"⚠️  Offre {offer_ids[0]} non trouvée")
            
            # If no offer_ids but we have pfe_reference, try to find the offer and fill entreprise
            elif not offer_ids and demande.pfe_reference:
                from shared.models import OffreStage
                try:
                    offre = OffreStage.objects.get(reference=demande.pfe_reference)
                    
                    # Auto-fill entreprise if not set
                    if offre.entreprise and not demande.entreprise:
                        demande.entreprise = offre.entreprise
                        demande.save(update_fields=['entreprise'])
                        print(f"✅ Entreprise auto-remplie depuis pfe_reference: {offre.entreprise.nom}")
                    
                except OffreStage.DoesNotExist:
                    print(f"⚠️  Offre avec référence {demande.pfe_reference} non trouvée")
                    print("⚠️  L'entreprise ne pourra pas être remplie automatiquement")
            
            # Increment candidate's application count if authenticated
            if self.request.user.is_authenticated and hasattr(self.request.user, 'candidat_profile'):
                candidat = self.request.user.candidat_profile
                candidat.increment_demandes_count()
            
            # Create dashboard notifications for RH users
            from shared.models import Notification
            from auth_service.models import User
            
            # Get RH users - prioritize RH users from the specific company if available
            rh_users = []
            
            if demande.entreprise:
                # First, try to find RH users from the specific company
                company_rh_users = User.objects.filter(
                    role='rh', 
                    is_active=True, 
                    entreprise=demande.entreprise
                )
                rh_users.extend(company_rh_users)
                print(f"✅ Notifications envoyées aux RH de l'entreprise: {demande.entreprise.nom}")
            
            # Also notify general RH users (for admin purposes)
            general_rh_users = User.objects.filter(
                role='rh', 
                is_active=True
            ).exclude(id__in=[rh.id for rh in rh_users])
            rh_users.extend(general_rh_users)
            
            # Create notifications
            for rh_user in rh_users:
                company_info = f" ({demande.entreprise.nom})" if demande.entreprise else ""
                Notification.objects.create(
                    recipient=rh_user,
                    title='Nouvelle demande de stage',
                    message=f'Nouvelle candidature reçue de {demande.prenom} {demande.nom} ({demande.institut}) pour un stage {demande.type_stage}{company_info}.',
                    notification_type='info'
                )
            
            print(f"✅ {len(rh_users)} notification(s) créée(s) pour les RH")
                
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_interview(request, pk):
    """Schedule an interview for a demande"""
    if request.user.role not in ['rh', 'admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    demande = get_object_or_404(Demande, pk=pk)
    
    # Check if demande is in pending status
    if demande.status != Demande.Status.PENDING:
        return Response(
            {'error': 'Seules les demandes en attente peuvent faire l\'objet d\'un entretien'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if interview already exists
    if hasattr(demande, 'interview'):
        return Response(
            {'error': 'Un entretien a déjà été planifié pour cette demande'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate request data
    required_fields = ['date', 'time', 'location']
    for field in required_fields:
        if field not in request.data:
            return Response(
                {'error': f'Le champ "{field}" est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        from datetime import datetime
        from django.utils import timezone
        
        # Parse date and time
        interview_date = datetime.strptime(request.data['date'], '%Y-%m-%d').date()
        interview_time = datetime.strptime(request.data['time'], '%H:%M').time()
        
        # Validate that interview is in the future
        interview_datetime = datetime.combine(interview_date, interview_time)
        if interview_datetime <= timezone.now():
            return Response(
                {'error': 'L\'entretien doit être planifié dans le futur'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create interview
        from .models import Interview
        interview = Interview.objects.create(
            demande=demande,
            scheduled_by=request.user,
            date=interview_date,
            time=interview_time,
            location=request.data['location'],
            notes=request.data.get('notes', '')
        )
        
        # Update demande status to interview_scheduled
        demande.status = Demande.Status.INTERVIEW_SCHEDULED
        demande.save(update_fields=['status'])
        
        # Send email notification to candidate
        from shared.utils import MailService
        email_sent = MailService.send_interview_notification(interview)
        
        return Response({
            'message': 'Entretien planifié avec succès',
            'interview': {
                'id': interview.id,
                'date': interview.date.strftime('%Y-%m-%d'),
                'time': interview.time.strftime('%H:%M'),
                'location': interview.location,
                'notes': interview.notes,
                'email_sent': email_sent
            },
            'demande_status': demande.status
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response(
            {'error': f'Format de date/heure invalide: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        print("DEBUG ERROR in schedule_interview:", e)
        traceback.print_exc()
        return Response(
            {'error': f'Erreur lors de la planification de l\'entretien: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_details(request, pk):
    """Get interview details for a demande"""
    demande = get_object_or_404(Demande, pk=pk)
    
    # Check permissions
    if request.user.role == 'rh':
        if not request.user.entreprise or demande.entreprise != request.user.entreprise:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    elif request.user.role == 'candidat':
        if demande.email != request.user.email:
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    elif request.user.role not in ['admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if interview exists
    if not hasattr(demande, 'interview'):
        return Response(
            {'error': 'Aucun entretien planifié pour cette demande'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    interview = demande.interview
    
    return Response({
        'interview': {
            'id': interview.id,
            'date': interview.date.strftime('%Y-%m-%d'),
            'time': interview.time.strftime('%H:%M'),
            'location': interview.location,
            'notes': interview.notes,
            'status': interview.status,
            'email_sent': interview.email_sent,
            'email_sent_at': interview.email_sent_at.isoformat() if interview.email_sent_at else None,
            'scheduled_by': {
                'id': interview.scheduled_by.id,
                'name': interview.scheduled_by.get_full_name(),
                'email': interview.scheduled_by.email
            } if interview.scheduled_by else None
        },
        'demande': {
            'id': demande.id,
            'status': demande.status,
            'candidate_name': demande.nom_complet,
            'email': demande.email
        }
    }, status=status.HTTP_200_OK)



