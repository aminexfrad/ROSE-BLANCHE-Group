"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone


class Demande(models.Model):
    """
    Demande de stage model with all fields from the frontend form.
    Supports both individual and binôme (team) applications.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('En attente')
        APPROVED = 'approved', _('Approuvée')
        REJECTED = 'rejected', _('Rejetée')
    
    class TypeStage(models.TextChoices):
        PFE = 'Stage PFE', _('Stage PFE')
    
    # Candidate principal information
    nom = models.CharField(_('nom'), max_length=100)
    prenom = models.CharField(_('prénom'), max_length=100)
    email = models.EmailField(_('email'))
    telephone = models.CharField(_('téléphone'), max_length=20)
    
    # Academic information
    institut = models.CharField(_('institut'), max_length=200)
    specialite = models.CharField(_('spécialité'), max_length=200)
    type_stage = models.CharField(
        _('type de stage'),
        max_length=50,
        choices=TypeStage.choices
    )
    niveau = models.CharField(_('niveau'), max_length=100)  # Changed to text field
    pfe_reference = models.CharField(_('référence PFE'), max_length=200, blank=True)  # New field for PFE reference
    # Grouped PFE: Many-to-many to selected offers
    offres = models.ManyToManyField('shared.OffreStage', blank=True, related_name='demandes', through='DemandeOffre')
    
    # Stage details
    date_debut = models.DateField(_('date de début'))
    date_fin = models.DateField(_('date de fin'))
    
    # Binôme (team) information
    stage_binome = models.BooleanField(_('stage en binôme'), default=False)
    nom_binome = models.CharField(_('nom du binôme'), max_length=100, blank=True)
    prenom_binome = models.CharField(_('prénom du binôme'), max_length=100, blank=True)
    email_binome = models.EmailField(_('email du binôme'), blank=True)
    telephone_binome = models.CharField(_('téléphone du binôme'), max_length=20, blank=True)
    
    # Documents - Candidate principal
    cv = models.FileField(_('CV'), upload_to='demandes/cv/', blank=True, null=True)
    lettre_motivation = models.FileField(_('lettre de motivation'), upload_to='demandes/lettres/', blank=True, null=True)
    demande_stage = models.FileField(_('demande de stage'), upload_to='demandes/demandes/', blank=True, null=True)
    
    # Documents - Binôme (if applicable)
    cv_binome = models.FileField(_('CV binôme'), upload_to='demandes/cv/', blank=True, null=True)
    lettre_motivation_binome = models.FileField(_('lettre de motivation binôme'), upload_to='demandes/lettres/', blank=True, null=True)
    demande_stage_binome = models.FileField(_('demande de stage binôme'), upload_to='demandes/demandes/', blank=True, null=True)
    
    # Status and processing
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    raison_refus = models.TextField(_('raison du refus'), blank=True)
    
    # Created user (if approved)
    user_created = models.ForeignKey(
        'auth_service.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes_approved'
    )
    
    # Company reference (derived from the first offer, for easier filtering)
    entreprise = models.ForeignKey(
        'shared.Entreprise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes',
        verbose_name=_('entreprise')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    date_soumission = models.DateField(_('date de soumission'), auto_now_add=True, help_text=_('Date automatique de soumission de la demande'))
    
    class Meta:
        verbose_name = _('demande de stage')
        verbose_name_plural = _('demandes de stage')
        db_table = 'demande_stage'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Demande de {self.prenom} {self.nom} - {self.status}"
    
    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"
    
    @property
    def nom_complet_binome(self):
        if self.stage_binome and self.prenom_binome and self.nom_binome:
            return f"{self.prenom_binome} {self.nom_binome}"
        return None
    
    @property
    def duree_stage(self):
        """Calculate stage duration in days"""
        if self.date_debut and self.date_fin:
            return (self.date_fin - self.date_debut).days
        return 0
    
    @property
    def is_pfe_stage(self):
        """Check if this is a PFE stage"""
        return self.type_stage in ['Stage PFE']
    
    def approve(self, user_created=None):
        """Approve the demande and optionally create a user"""
        self.status = self.Status.APPROVED
        if user_created:
            self.user_created = user_created
        self.save()
    
    def reject(self, raison=None):
        """Reject the demande with optional reason"""
        self.status = self.Status.REJECTED
        if raison:
            self.raison_refus = raison
        self.save()
    
    def update_entreprise_from_offres(self):
        """Update entreprise reference based on the first offer"""
        first_offre = self.offres.first()
        if first_offre and first_offre.entreprise:
            self.entreprise = first_offre.entreprise
            self.save(update_fields=['entreprise'])
    
    def update_pfe_reference_from_offres(self):
        """Update PFE reference based on the first offer"""
        first_offre = self.offres.first()
        if first_offre and first_offre.reference and first_offre.reference != 'Inconnu':
            self.pfe_reference = first_offre.reference
            self.save(update_fields=['pfe_reference'])
    
    def update_fields_from_offres(self):
        """Update both entreprise and PFE reference from offers"""
        first_offre = self.offres.first()
        if first_offre:
            updated_fields = []
            
            # Update entreprise
            if first_offre.entreprise and not self.entreprise:
                self.entreprise = first_offre.entreprise
                updated_fields.append('entreprise')
            
            # Update PFE reference
            if first_offre.reference and first_offre.reference != 'Inconnu' and not self.pfe_reference:
                self.pfe_reference = first_offre.reference
                updated_fields.append('pfe_reference')
            
            # Save if any fields were updated
            if updated_fields:
                self.save(update_fields=updated_fields)
    
    def save(self, *args, **kwargs):
        """Override save to automatically set entreprise and PFE reference if not set"""
        super().save(*args, **kwargs)
        # Auto-set entreprise and PFE reference if not already set
        if self.offres.exists():
            self.update_fields_from_offres()


class DemandeOffre(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Rejetée'),
    ]
    demande = models.ForeignKey('Demande', on_delete=models.CASCADE, related_name='demande_offres')
    offre = models.ForeignKey('shared.OffreStage', on_delete=models.CASCADE, related_name='offre_demandes')
    entreprise = models.ForeignKey(
        'shared.Entreprise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demande_offres',
        verbose_name=_('entreprise')
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('demande', 'offre')

    def __str__(self):
        return f"{self.demande} - {self.offre} ({self.status})"
    
    def save(self, *args, **kwargs):
        """Override save to automatically set entreprise from the offer"""
        if not self.entreprise and self.offre:
            self.entreprise = self.offre.entreprise
        super().save(*args, **kwargs)


# Signal handlers to automatically update Demande fields
@receiver(post_save, sender=DemandeOffre)
def update_demande_from_demande_offre(sender, instance, created, **kwargs):
    """Update Demande fields when DemandeOffre is created or updated"""
    if instance.demande:
        instance.demande.update_fields_from_offres()


@receiver(post_delete, sender=DemandeOffre)
def update_demande_after_offre_deletion(sender, instance, **kwargs):
    """Update Demande fields when DemandeOffre is deleted"""
    if instance.demande:
        instance.demande.update_fields_from_offres()


# Signal handler to automatically increment candidat's demande count
@receiver(post_save, sender=Demande)
def increment_candidat_demande_count(sender, instance, created, **kwargs):
    """Increment candidat's demande count when a new demande is created"""
    if created:
        try:
            # Try to find the candidat by email
            from shared.models import Candidat
            candidat = Candidat.objects.filter(user__email=instance.email).first()
            
            if candidat:
                # Increment the count
                candidat.nombre_demandes_soumises += 1
                candidat.date_derniere_demande = timezone.now()
                candidat.save(update_fields=['nombre_demandes_soumises', 'date_derniere_demande'])
                print(f"✅ Compteur de demandes incrémenté pour {candidat.user.get_full_name()}: {candidat.nombre_demandes_soumises}")
            else:
                print(f"⚠️  Candidat non trouvé pour l'email: {instance.email}")
                
        except Exception as e:
            print(f"❌ Erreur lors de l'incrémentation du compteur: {e}")
            import traceback
            traceback.print_exc()


# Signal handler to decrement candidat's demande count when demande is deleted
@receiver(post_delete, sender=Demande)
def decrement_candidat_demande_count(sender, instance, **kwargs):
    """Decrement candidat's demande count when a demande is deleted"""
    try:
        # Try to find the candidat by email
        from shared.models import Candidat
        candidat = Candidat.objects.filter(user__email=instance.email).first()
        
        if candidat and candidat.nombre_demandes_soumises > 0:
            # Decrement the count
            candidat.nombre_demandes_soumises = max(0, candidat.nombre_demandes_soumises - 1)
            candidat.save(update_fields=['nombre_demandes_soumises'])
            print(f"✅ Compteur de demandes décrémenté pour {candidat.user.get_full_name()}: {candidat.nombre_demandes_soumises}")
        elif candidat:
            print(f"⚠️  Compteur déjà à 0 pour {candidat.user.get_full_name()}")
        else:
            print(f"⚠️  Candidat non trouvé pour l'email: {instance.email}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la décrémentation du compteur: {e}")
        import traceback
        traceback.print_exc()
