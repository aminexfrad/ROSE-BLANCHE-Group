"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from shared.security import SecurityValidator
from shared.utils import FileUploadValidator
from .models import Demande, DemandeOffre
from shared.models import OffreStage
from shared.serializers import EntrepriseListSerializer


class DemandeSerializer(serializers.ModelSerializer):
    """Serializer for demande de stage"""
    cv = serializers.FileField(required=False, allow_null=True)
    lettre_motivation = serializers.FileField(required=False, allow_null=True)
    demande_stage = serializers.FileField(required=False, allow_null=True)
    cv_binome = serializers.FileField(required=False, allow_null=True)
    lettre_motivation_binome = serializers.FileField(required=False, allow_null=True)
    demande_stage_binome = serializers.FileField(required=False, allow_null=True)
    offer_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True,
        help_text="IDs des offres sélectionnées (max 4 pour PFE)"
    )
    offres = serializers.SerializerMethodField(read_only=True)
    interview_requests = serializers.SerializerMethodField(read_only=True)
    entreprise = EntrepriseListSerializer(read_only=True)

    class Meta:
        model = Demande
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone',
            'institut', 'specialite', 'type_stage', 'niveau', 'pfe_reference',
            'date_debut', 'date_fin', 'stage_binome',
            'nom_binome', 'prenom_binome', 'email_binome',
            'telephone_binome',
            'cv', 'lettre_motivation', 'demande_stage',
            'cv_binome', 'lettre_motivation_binome', 'demande_stage_binome',
            'status', 'raison_refus', 'entreprise', 'created_at', 'updated_at',
            'offer_ids', 'offres', 'interview_requests'
        ]
        read_only_fields = ['id', 'status', 'raison_refus', 'created_at', 'updated_at', 'offres', 'interview_requests']
    
    def get_offres(self, obj):
        # Return offers with per-offer status
        return [
            {
                'id': do.offre.id,
                'reference': do.offre.reference,
                'titre': do.offre.title,  # Keep both title and titre for compatibility
                'title': do.offre.title,
                'entreprise': {
                    'id': do.offre.entreprise.id if do.offre.entreprise else None,
                    'nom': do.offre.entreprise.nom if do.offre.entreprise else 'N/A'
                },
                'status': do.status
            }
            for do in obj.demande_offres.select_related('offre', 'offre__entreprise').all()
        ]
    
    def get_interview_requests(self, obj):
        """Return interview requests for this demande"""
        return [
            {
                'id': ir.id,
                'status': ir.status,
                'proposed_date': ir.proposed_date.strftime('%Y-%m-%d'),
                'proposed_time': ir.proposed_time.strftime('%H:%M'),
                'suggested_date': ir.suggested_date.strftime('%Y-%m-%d') if ir.suggested_date else None,
                'suggested_time': ir.suggested_time.strftime('%H:%M') if ir.suggested_time else None,
                'location': ir.location,
                'mode': getattr(ir, 'mode', 'in_person'),
                'meeting_link': getattr(ir, 'meeting_link', ''),
                'tuteur': {
                    'id': ir.tuteur.id,
                    'name': ir.tuteur.get_full_name(),
                    'email': ir.tuteur.email,
                },
                'filiale': {
                    'id': ir.filiale.id if ir.filiale else None,
                    'name': ir.filiale.nom if ir.filiale else 'N/A',
                },
                'tuteur_comment': ir.tuteur_comment,
                'created_at': ir.created_at.isoformat(),
            }
            for ir in obj.interview_requests.select_related('tuteur', 'filiale').all()
        ]

    def validate_nom(self, value):
        """Validate and sanitize nom field"""
        try:
            return SecurityValidator.validate_name(value, "nom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_prenom(self, value):
        """Validate and sanitize prenom field"""
        try:
            return SecurityValidator.validate_name(value, "prénom")
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_email(self, value):
        """Validate and sanitize email field"""
        try:
            return SecurityValidator.validate_email(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_telephone(self, value):
        """Validate and sanitize telephone field"""
        try:
            return SecurityValidator.validate_phone(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_institut(self, value):
        """Validate and sanitize institut field"""
        try:
            return SecurityValidator.validate_text(value, max_length=200, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_specialite(self, value):
        """Validate and sanitize specialite field"""
        try:
            return SecurityValidator.validate_text(value, max_length=200, allow_html=False)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
    
    def validate_pfe_reference(self, value):
        """Validate and sanitize PFE reference field"""
        if value:
            try:
                return SecurityValidator.validate_text(value, max_length=100, allow_html=False)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_nom_binome(self, value):
        """Validate and sanitize nom_binome field"""
        if value:
            try:
                return SecurityValidator.validate_name(value, "nom du binôme")
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_prenom_binome(self, value):
        """Validate and sanitize prenom_binome field"""
        if value:
            try:
                return SecurityValidator.validate_name(value, "prénom du binôme")
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_email_binome(self, value):
        """Validate and sanitize email_binome field"""
        if value:
            try:
                return SecurityValidator.validate_email(value)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_telephone_binome(self, value):
        """Validate and sanitize telephone_binome field"""
        if value:
            try:
                return SecurityValidator.validate_phone(value)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_file_field(self, value, field_name):
        """Generic file validation for PDF files only"""
        if value:
            # Validate file size and type
            allowed_types = ['application/pdf']
            max_size = 10 * 1024 * 1024  # 10MB
            
            try:
                FileUploadValidator.validate_file(value, allowed_types, max_size)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
            
            # Validate filename safety
            if not FileUploadValidator.is_safe_filename(value.name):
                raise serializers.ValidationError(
                    f'Le nom du fichier {field_name} contient des caractères dangereux.'
                )
        
        return value
    
    def validate_cv(self, value):
        """Validate CV file"""
        return self.validate_file_field(value, 'CV')
    
    def validate_lettre_motivation(self, value):
        """Validate lettre de motivation file"""
        return self.validate_file_field(value, 'lettre de motivation')
    
    def validate_demande_stage(self, value):
        """Validate demande stage file"""
        return self.validate_file_field(value, 'demande de stage')
    
    def validate_cv_binome(self, value):
        """Validate binôme CV file"""
        return self.validate_file_field(value, 'CV binôme')
    
    def validate_lettre_motivation_binome(self, value):
        """Validate binôme lettre de motivation file"""
        return self.validate_file_field(value, 'lettre de motivation binôme')
    
    def validate_demande_stage_binome(self, value):
        """Validate binôme demande stage file"""
        return self.validate_file_field(value, 'demande de stage binôme')
    
    def validate_offer_ids(self, value):
        if value and len(value) > 4:
            raise serializers.ValidationError('Vous pouvez sélectionner jusqu\'à 4 offres maximum.')
        return value

    def validate(self, data):
        data = super().validate(data)
        offer_ids = data.get('offer_ids', [])
        type_stage = data.get('type_stage')
        # Validate dates: block past dates and ensure end >= start
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')
        today = timezone.now().date()
        if date_debut and date_debut < today:
            raise serializers.ValidationError('La date de début ne peut pas être dans le passé.')
        if date_fin and date_fin < today:
            raise serializers.ValidationError('La date de fin ne peut pas être dans le passé.')
        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError('La date de fin doit être postérieure ou égale à la date de début.')
        
        # Validate binôme fields when stage_binome is True
        stage_binome = data.get('stage_binome', False)
        if stage_binome:
            required_binome_fields = ['nom_binome', 'prenom_binome', 'email_binome', 'telephone_binome']
            missing_fields = []
            for field in required_binome_fields:
                if not data.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                raise serializers.ValidationError(
                    f'Les champs suivants sont obligatoires pour un stage en binôme: {", ".join(missing_fields)}'
                )
        
        if type_stage == 'Stage PFE':
            # For PFE stages, we need either offer_ids OR pfe_reference
            has_offer_ids = offer_ids and len(offer_ids) > 0
            has_pfe_reference = data.get('pfe_reference')
            
            if has_offer_ids:
                if len(offer_ids) > 1:
                    raise serializers.ValidationError('Vous ne pouvez sélectionner qu\'une seule offre par demande.')
                
                # Check for duplicate offer IDs (should not happen with single offer, but safety check)
                if len(offer_ids) != len(set(offer_ids)):
                    raise serializers.ValidationError('Vous ne pouvez pas sélectionner la même offre plusieurs fois.')
            elif not has_pfe_reference:
                # If no offer_ids, pfe_reference is required
                raise serializers.ValidationError('Pour un stage PFE, vous devez soit sélectionner une offre, soit fournir une référence PFE.')
        return data

    def create(self, validated_data):
        offer_ids = validated_data.pop('offer_ids', [])
        demande = super().create(validated_data)
        if offer_ids:
            from shared.models import OffreStage
            offres = OffreStage.objects.filter(id__in=offer_ids)
            demande.offres.set(offres)
        return demande


class DemandeListSerializer(DemandeSerializer):
    """Serializer for listing demandes (RH view)"""
    
    nom_complet = serializers.CharField(read_only=True)
    nom_complet_binome = serializers.CharField(read_only=True)
    duree_stage = serializers.IntegerField(read_only=True)
    is_pfe_stage = serializers.BooleanField(read_only=True)
    offres = serializers.SerializerMethodField(read_only=True)
    interview_requests = serializers.SerializerMethodField(read_only=True)
    
    class Meta(DemandeSerializer.Meta):
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'email', 'telephone', 'institut', 'specialite',
            'type_stage', 'niveau', 'pfe_reference', 'date_debut', 'date_fin',
            'duree_stage', 'stage_binome', 'nom_complet_binome',
            'is_pfe_stage', 'status', 'entreprise', 'created_at',
            'cv', 'lettre_motivation', 'demande_stage',
            'cv_binome', 'lettre_motivation_binome', 'demande_stage_binome',
            'offres', 'interview_requests'
        ]


class DemandeDetailSerializer(DemandeSerializer):
    """Serializer for detailed demande view"""
    
    nom_complet = serializers.CharField(read_only=True)
    nom_complet_binome = serializers.CharField(read_only=True)
    duree_stage = serializers.IntegerField(read_only=True)
    is_pfe_stage = serializers.BooleanField(read_only=True)
    offres = serializers.SerializerMethodField(read_only=True)
    interview_requests = serializers.SerializerMethodField(read_only=True)
    
    class Meta(DemandeSerializer.Meta):
        fields = DemandeSerializer.Meta.fields + [
            'nom_complet', 'nom_complet_binome', 'duree_stage', 'is_pfe_stage'
        ]


class DemandeApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting demandes"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    raison = serializers.CharField(required=False, allow_blank=True)
    
    def validate_action(self, value):
        if value not in ['approve', 'reject']:
            raise serializers.ValidationError(
                'L\'action doit être "approve" ou "reject".'
            )
        return value
    
    def validate_raison(self, value):
        """Validate and sanitize raison field"""
        if value:
            try:
                return SecurityValidator.validate_text(value, max_length=500, allow_html=False)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate(self, data):
        if data.get('action') == 'reject' and not data.get('raison'):
            raise serializers.ValidationError(
                'Une raison est requise pour rejeter une demande.'
            )
        return data 


class DemandeOffreStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[('accepted', 'Acceptée'), ('rejected', 'Rejetée')])
    
    def validate_status(self, value):
        if value not in ['accepted', 'rejected']:
            raise serializers.ValidationError(
                'Le statut doit être "accepted" ou "rejected".'
            )
        return value 