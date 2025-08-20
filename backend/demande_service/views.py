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
from .models import InterviewRequest
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
            # Assign to the filiale where they applied
            user.entreprise = demande.entreprise
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
                role='stagiaire',
                entreprise=demande.entreprise  # Assign to the filiale where they applied
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
    
    # Require at least one validated interview request from tuteur before scheduling
    if not InterviewRequest.objects.filter(demande=demande, status=InterviewRequest.Status.VALIDATED).exists():
        return Response(
            {'error': "Le tuteur doit d'abord confirmer sa disponibilité avant de planifier l'entretien"},
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
        
        # Validate that interview is in the future (make datetime aware to avoid naive/aware comparison errors)
        interview_datetime_naive = datetime.combine(interview_date, interview_time)
        # Ensure timezone-aware datetime for reliable comparison
        interview_datetime = timezone.make_aware(
            interview_datetime_naive,
            timezone.get_current_timezone()
        ) if timezone.is_naive(interview_datetime_naive) else interview_datetime_naive
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
        
        # Send email notification to candidate (do not fail the schedule if email fails)
        from shared.utils import MailService
        try:
            email_sent = MailService.send_interview_notification(interview)
        except Exception as email_error:
            import logging
            logging.getLogger(__name__).error(
                f"Failed to send interview notification for interview {interview.id}: {email_error}"
            )
            email_sent = False

        # Also notify the tuteur and candidate via dashboard notifications
        try:
            from shared.models import Notification, Stage
            stage = Stage.objects.filter(demande=demande).first()
            # Candidate notification (if user exists)
            candidate_user = User.objects.filter(email=demande.email).first()
            if candidate_user:
                Notification.objects.create(
                    recipient=candidate_user,
                    title="Entretien confirmé",
                    message=f"Votre entretien est confirmé le {interview.date.strftime('%d/%m/%Y')} à {interview.time.strftime('%H:%M')} au lieu: {interview.location}.",
                    notification_type='success',
                    related_stage=stage
                )
            # Tuteur notification
            if stage and stage.tuteur:
                Notification.objects.create(
                    recipient=stage.tuteur,
                    title="Entretien confirmé",
                    message=f"Entretien confirmé avec {demande.nom_complet} le {interview.date.strftime('%d/%m/%Y')} à {interview.time.strftime('%H:%M')}.",
                    notification_type='success',
                    related_stage=stage
                )
                # Email to tuteur
                try:
                    MailService.send_email(
                        subject="Entretien confirmé",
                        recipient_list=[stage.tuteur.email],
                        template_name='emails/interview_confirmed_tuteur.txt',
                        context={
                            'tuteur_name': stage.tuteur.get_full_name(),
                            'candidate_name': demande.nom_complet,
                            'interview_date': interview.date.strftime('%d/%m/%Y'),
                            'interview_time': interview.time.strftime('%H:%M'),
                            'interview_location': interview.location,
                        },
                        html_template_name='emails/interview_confirmed_tuteur.html'
                    )
                except Exception:
                    pass
        except Exception:
            pass
        
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
def get_available_tuteurs_for_demande(request, pk):
    """Get available tuteurs for a specific demande's filiale"""
    if request.user.role not in ['rh', 'admin']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    demande = get_object_or_404(Demande, pk=pk)
    
    # Verify RH has access to this demande
    if request.user.role == 'rh' and demande.entreprise != request.user.entreprise:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    if not demande.entreprise:
        return Response({'error': "Cette demande n'a pas de filiale assignée"}, status=status.HTTP_400_BAD_REQUEST)

    # Get tuteurs for this filiale
    from auth_service.models import User
    tuteurs = User.objects.filter(
        role='tuteur',
        entreprise=demande.entreprise,
        is_active=True
    ).order_by('prenom', 'nom')

    tuteurs_data = []
    for tuteur in tuteurs:
        # Count current active stages for this tuteur
        from shared.models import Stage
        stagiaires_assignes = Stage.objects.filter(
            tuteur=tuteur,
            status='active'
        ).count()
        
        tuteur_data = {
            'id': tuteur.id,
            'first_name': tuteur.prenom,
            'last_name': tuteur.nom,
            'email': tuteur.email,
            'telephone': tuteur.telephone,
            'departement': tuteur.departement,
            'stagiaires_assignes': stagiaires_assignes,
            'disponible': stagiaires_assignes < 5,  # Limit of 5 stagiaires per tuteur
            'entreprise': tuteur.entreprise.nom if tuteur.entreprise else None
        }
        tuteurs_data.append(tuteur_data)

    return Response({
        'results': tuteurs_data,
        'count': len(tuteurs_data)
    })


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def propose_interview_request(request, pk):
    """RH proposes an interview to tuteur for availability confirmation"""
    if request.user.role not in ['rh', 'admin']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    demande = get_object_or_404(Demande, pk=pk)

    # Validate that the demande has a filiale
    if not demande.entreprise:
        return Response({'error': "Cette demande n'a pas de filiale assignée"}, status=status.HTTP_400_BAD_REQUEST)

    # Enforce only one interview per candidate/demande (no multiple interview requests)
    if InterviewRequest.objects.filter(demande=demande).exists():
        return Response({'error': "Un seul entretien est autorisé par candidature. Un entretien a déjà été proposé pour cette demande."}, status=status.HTTP_400_BAD_REQUEST)

    # Get tuteur_id from request data
    tuteur_id = request.data.get('tuteur_id')
    if not tuteur_id:
        return Response({'error': "ID du tuteur requis"}, status=status.HTTP_400_BAD_REQUEST)

    # Get the selected tuteur
    from auth_service.models import User
    tuteur = get_object_or_404(User, id=tuteur_id, role='tuteur')
    
    # Verify the tuteur belongs to the same company as the RH
    if request.user.role == 'rh' and tuteur.entreprise != request.user.entreprise:
        return Response({'error': "Vous ne pouvez pas assigner un tuteur d'une autre entreprise"}, status=status.HTTP_403_FORBIDDEN)
    
    # Verify the tuteur belongs to the same filiale as the demande
    if tuteur.entreprise != demande.entreprise:
        return Response({'error': "Le tuteur sélectionné n'appartient pas à la filiale de cette demande"}, status=status.HTTP_400_BAD_REQUEST)

    required_fields = ['date', 'time', 'location']
    for field in required_fields:
        if field not in request.data:
            return Response({'error': f"Champ manquant: {field}"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from datetime import datetime
        from django.utils import timezone

        proposed_date = datetime.strptime(request.data['date'], '%Y-%m-%d').date()
        proposed_time = datetime.strptime(request.data['time'], '%H:%M').time()

        # Ensure future datetime
        dt_naive = datetime.combine(proposed_date, proposed_time)
        dt = timezone.make_aware(dt_naive, timezone.get_current_timezone()) if timezone.is_naive(dt_naive) else dt_naive
        if dt <= timezone.now():
            return Response({'error': "La date/heure doit être dans le futur"}, status=status.HTTP_400_BAD_REQUEST)

        # Create InterviewRequest with selected tuteur
        interview_request = InterviewRequest.objects.create(
            demande=demande,
            rh=request.user,
            filiale=demande.entreprise,
            tuteur=tuteur,
            proposed_date=proposed_date,
            proposed_time=proposed_time,
            location=request.data['location']
        )

        # Notify Tuteur: dashboard notification
        from shared.models import Notification
        Notification.objects.create(
            recipient=tuteur,
            title='Proposition d\'entretien',
            message=f"Un entretien est prévu avec {demande.nom_complet} le {proposed_date.strftime('%d/%m/%Y')} à {proposed_time.strftime('%H:%M')}. Confirmez votre disponibilité.",
            notification_type='info'
        )

        # Email to tuteur
        from shared.utils import MailService
        try:
            MailService.send_email(
                subject="Proposition d'entretien",
                recipient_list=[tuteur.email],
                template_name='emails/interview_request_tuteur.txt',
                context={
                    'tuteur_name': tuteur.get_full_name(),
                    'candidate_name': demande.nom_complet,
                    'proposed_date': proposed_date.strftime('%d/%m/%Y'),
                    'proposed_time': proposed_time.strftime('%H:%M'),
                    'location': request.data['location'],
                    'company_name': demande.entreprise.nom,
                },
                html_template_name='emails/interview_request_tuteur.html'
            )
        except Exception as e:
            print(f"Error sending email to tuteur: {e}")

        return Response({
            'message': 'Proposition d\'entretien envoyée au tuteur',
            'request': {
                'id': interview_request.id,
                'status': interview_request.status,
                'tuteur': {
                    'id': tuteur.id,
                    'name': tuteur.get_full_name(),
                    'email': tuteur.email
                }
            }
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({'error': f"Format de date/heure invalide: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': "Erreur interne"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_interview_requests(request, pk):
    """List interview requests for a demande (RH/Admin only)"""
    if request.user.role not in ['rh', 'admin']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    demande = get_object_or_404(Demande, pk=pk)
    requests = InterviewRequest.objects.filter(demande=demande).select_related('tuteur', 'rh', 'filiale')
    data = []
    for r in requests:
        data.append({
            'id': r.id,
            'status': r.status,
            'proposed_date': r.proposed_date.strftime('%Y-%m-%d'),
            'proposed_time': r.proposed_time.strftime('%H:%M'),
            'suggested_date': r.suggested_date.strftime('%Y-%m-%d') if r.suggested_date else None,
            'suggested_time': r.suggested_time.strftime('%H:%M') if r.suggested_time else None,
            'location': r.location,
            'tuteur': {
                'id': r.tuteur.id,
                'name': r.tuteur.get_full_name(),
                'email': r.tuteur.email,
            },
            'filiale': {
                'id': r.filiale.id,
                'name': r.filiale.nom,
            },
            'tuteur_comment': r.tuteur_comment,
            'created_at': r.created_at.isoformat(),
        })
    return Response({'results': data, 'count': len(data)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rh_respond_to_proposal(request, pk):
    """RH responds to tuteur's interview proposal: accept or modify"""
    if request.user.role not in ['rh', 'admin']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    interview_request = get_object_or_404(InterviewRequest, pk=pk)
    
    # Verify RH has access to this interview request
    if interview_request.rh != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    action = request.data.get('action')
    comment = request.data.get('comment', '')

    if action == 'accept':
        # Accept tuteur's suggested time
        if interview_request.status != InterviewRequest.Status.REVISION_REQUESTED:
            return Response({'error': 'Cette demande ne peut pas être acceptée'}, status=status.HTTP_400_BAD_REQUEST)

        if not interview_request.suggested_date or not interview_request.suggested_time:
            return Response({'error': 'Aucune proposition de date/heure disponible'}, status=status.HTTP_400_BAD_REQUEST)

        # Update to use suggested date/time
        interview_request.proposed_date = interview_request.suggested_date
        interview_request.proposed_time = interview_request.suggested_time
        interview_request.status = InterviewRequest.Status.VALIDATED
        interview_request.save(update_fields=['proposed_date', 'proposed_time', 'status', 'updated_at'])

        # Notify Tuteur
        Notification.objects.create(
            recipient=interview_request.tuteur,
            title="Proposition d'entretien acceptée",
            message=f"Votre proposition d'entretien pour {interview_request.demande.nom_complet} a été acceptée.",
            notification_type='success'
        )

        # Notify Candidate
        try:
            from shared.utils import MailService
            MailService.send_email(
                subject="Entretien confirmé",
                recipient_list=[interview_request.demande.email],
                template_name='emails/interview_confirmed_candidate.txt',
                context={
                    'candidate_name': interview_request.demande.nom_complet,
                    'interview_date': interview_request.proposed_date.strftime('%d/%m/%Y'),
                    'interview_time': interview_request.proposed_time.strftime('%H:%M'),
                    'interview_location': interview_request.location,
                    'filiale_name': interview_request.filiale.nom,
                    'tuteur_name': interview_request.tuteur.get_full_name(),
                },
                html_template_name='emails/interview_confirmed_candidate.html'
            )
        except Exception as e:
            print(f"Error sending email to candidate: {e}")

        return Response({'message': 'Proposition acceptée. Le candidat a été notifié.'})

    elif action == 'modify':
        # RH proposes a new time
        new_date = request.data.get('new_date')
        new_time = request.data.get('new_time')
        
        if not new_date or not new_time:
            return Response({'error': 'Nouvelle date et heure requises'}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import datetime
        from django.utils import timezone
        
        try:
            new_date_obj = datetime.strptime(new_date, '%Y-%m-%d').date()
            new_time_obj = datetime.strptime(new_time, '%H:%M').time()
            
            # Ensure future datetime
            dt_naive = datetime.combine(new_date_obj, new_time_obj)
            dt = timezone.make_aware(dt_naive, timezone.get_current_timezone()) if timezone.is_naive(dt_naive) else dt_naive
            if dt <= timezone.now():
                return Response({'error': "La nouvelle date/heure doit être dans le futur"}, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError:
            return Response({'error': 'Format de date/heure invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Update to new proposed time and reset status
        interview_request.proposed_date = new_date_obj
        interview_request.proposed_time = new_time_obj
        interview_request.suggested_date = None
        interview_request.suggested_time = None
        interview_request.status = InterviewRequest.Status.PENDING_TUTEUR
        interview_request.save(update_fields=['proposed_date', 'proposed_time', 'suggested_date', 'suggested_time', 'status', 'updated_at'])

        # Notify Tuteur
        Notification.objects.create(
            recipient=interview_request.tuteur,
            title="Nouvelle proposition d'entretien",
            message=f"Une nouvelle proposition d'entretien pour {interview_request.demande.nom_complet} nécessite votre confirmation.",
            notification_type='info'
        )

        # Email Tuteur
        try:
            from shared.utils import MailService
            MailService.send_email(
                subject="Nouvelle proposition d'entretien",
                recipient_list=[interview_request.tuteur.email],
                template_name='emails/interview_request_tuteur.txt',
                context={
                    'tuteur_name': interview_request.tuteur.get_full_name(),
                    'candidate_name': interview_request.demande.nom_complet,
                    'proposed_date': new_date_obj.strftime('%d/%m/%Y'),
                    'proposed_time': new_time_obj.strftime('%H:%M'),
                    'location': interview_request.location,
                    'company_name': interview_request.filiale.nom,
                },
                html_template_name='emails/interview_request_tuteur.html'
            )
        except Exception as e:
            print(f"Error sending email to tuteur: {e}")

        return Response({'message': 'Nouvelle proposition envoyée au tuteur.'})

    else:
        return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)



