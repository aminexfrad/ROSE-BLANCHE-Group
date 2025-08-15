"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


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
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
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


class DemandeOffre(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Rejetée'),
    ]
    demande = models.ForeignKey('Demande', on_delete=models.CASCADE, related_name='demande_offres')
    offre = models.ForeignKey('shared.OffreStage', on_delete=models.CASCADE, related_name='offre_demandes')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('demande', 'offre')

    def __str__(self):
        return f"{self.demande} - {self.offre} ({self.status})"
