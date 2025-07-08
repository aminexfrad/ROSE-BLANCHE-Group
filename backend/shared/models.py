from django.db import models
from django.utils.translation import gettext_lazy as _
from auth_service.models import User
from demande_service.models import Demande

class Stage(models.Model):
    """
    Stage/Internship model that represents an approved internship
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Actif')
        COMPLETED = 'completed', _('Terminé')
        SUSPENDED = 'suspended', _('Suspendu')
        CANCELLED = 'cancelled', _('Annulé')
    
    # Basic information
    demande = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='stage')
    stagiaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stages_stagiaire')
    tuteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stages_tuteur', null=True, blank=True)
    
    # Stage details
    title = models.CharField(_('titre'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    company = models.CharField(_('entreprise'), max_length=200)
    location = models.CharField(_('localisation'), max_length=200)
    
    # Dates
    start_date = models.DateField(_('date de début'))
    end_date = models.DateField(_('date de fin'))
    
    # Status and progress
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    progress = models.IntegerField(_('progression'), default=0)  # 0-100
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('stage')
        verbose_name_plural = _('stages')
        db_table = 'stage'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Stage: {self.title} - {self.stagiaire.get_full_name()}"
    
    @property
    def duration_days(self):
        """Calculate stage duration in days"""
        return (self.end_date - self.start_date).days
    
    @property
    def days_remaining(self):
        """Calculate days remaining"""
        from django.utils import timezone
        today = timezone.now().date()
        if self.end_date > today:
            return (self.end_date - today).days
        return 0
    
    def calculate_progress(self):
        """Calculate progress based on completed steps"""
        total_steps = self.steps.count()
        if total_steps == 0:
            return 0
        completed_steps = self.steps.filter(status__in=['completed', 'validated']).count()
        return int((completed_steps / total_steps) * 100)
    
    def save(self, *args, **kwargs):
        # Auto-calculate progress if not set
        if self.progress == 0:
            self.progress = self.calculate_progress()
        super().save(*args, **kwargs)

class Step(models.Model):
    """
    Step model for internship progression tracking
    """
    class Status(models.TextChoices):
        PENDING = 'pending', _('En attente')
        IN_PROGRESS = 'in_progress', _('En cours')
        COMPLETED = 'completed', _('Terminé')
        VALIDATED = 'validated', _('Validé')
        REJECTED = 'rejected', _('Rejeté')
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(_('titre'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    order = models.IntegerField(_('ordre'))
    
    # Status and validation
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    due_date = models.DateField(_('date limite'), null=True, blank=True)
    completed_date = models.DateField(_('date de completion'), null=True, blank=True)
    validated_date = models.DateField(_('date de validation'), null=True, blank=True)
    
    # Feedback
    tuteur_feedback = models.TextField(_('feedback tuteur'), blank=True)
    stagiaire_comment = models.TextField(_('commentaire stagiaire'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('étape')
        verbose_name_plural = _('étapes')
        db_table = 'step'
        ordering = ['order']
        unique_together = ['stage', 'order']
    
    def __str__(self):
        return f"Étape {self.order}: {self.title} - {self.stage.title}"
    
    def save(self, *args, **kwargs):
        # Update stage progress when step status changes
        old_instance = None
        if self.pk:
            try:
                old_instance = Step.objects.get(pk=self.pk)
            except Step.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        # Update stage progress if step status changed
        if old_instance and old_instance.status != self.status:
            self.stage.progress = self.stage.calculate_progress()
            self.stage.save()

class Document(models.Model):
    """
    Document model for internship documents
    """
    class Type(models.TextChoices):
        RAPPORT = 'rapport', _('Rapport')
        FICHE_SUIVI = 'fiche_suivi', _('Fiche de suivi')
        PFE = 'pfe', _('PFE')
        PRESENTATION = 'presentation', _('Présentation')
        OTHER = 'other', _('Autre')
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='documents')
    step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    
    # Document details
    title = models.CharField(_('titre'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    document_type = models.CharField(
        _('type de document'),
        max_length=20,
        choices=Type.choices,
        default=Type.OTHER
    )
    
    # File
    file = models.FileField(_('fichier'), upload_to='documents/')
    file_size = models.IntegerField(_('taille du fichier'), null=True, blank=True)
    
    # Status
    is_approved = models.BooleanField(_('approuvé'), default=False)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_documents'
    )
    approved_at = models.DateTimeField(_('date d\'approbation'), null=True, blank=True)
    
    # Feedback
    feedback = models.TextField(_('feedback'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('document')
        verbose_name_plural = _('documents')
        db_table = 'document'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.stage.title}"

class Evaluation(models.Model):
    """
    Evaluation model for KPI 360° feedback
    """
    class Type(models.TextChoices):
        STAGIAIRE_SELF = 'stagiaire_self', _('Auto-évaluation Stagiaire')
        TUTEUR_STAGIAIRE = 'tuteur_stagiaire', _('Évaluation Tuteur → Stagiaire')
        STAGIAIRE_TUTEUR = 'stagiaire_tuteur', _('Évaluation Stagiaire → Tuteur')
        RH_GLOBAL = 'rh_global', _('Évaluation RH Globale')
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_given')
    evaluated = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_received')
    evaluation_type = models.CharField(
        _('type d\'évaluation'),
        max_length=20,
        choices=Type.choices
    )
    
    # Evaluation data
    scores = models.JSONField(_('scores'), default=dict)  # Store question scores
    comments = models.TextField(_('commentaires'), blank=True)
    overall_score = models.DecimalField(_('score global'), max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Status
    is_completed = models.BooleanField(_('terminée'), default=False)
    completed_at = models.DateTimeField(_('date de completion'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('évaluation')
        verbose_name_plural = _('évaluations')
        db_table = 'evaluation'
        ordering = ['-created_at']
        unique_together = ['stage', 'evaluator', 'evaluated', 'evaluation_type']
    
    def __str__(self):
        return f"{self.evaluation_type} - {self.evaluator.get_full_name()} → {self.evaluated.get_full_name()}"

class KPIQuestion(models.Model):
    """
    KPI Question model for evaluation surveys
    """
    class Category(models.TextChoices):
        TECHNICAL = 'technical', _('Technique')
        SOFT_SKILLS = 'soft_skills', _('Soft Skills')
        COMMUNICATION = 'communication', _('Communication')
        TEAMWORK = 'teamwork', _('Travail d\'équipe')
        LEADERSHIP = 'leadership', _('Leadership')
        ADAPTABILITY = 'adaptability', _('Adaptabilité')
        OTHER = 'other', _('Autre')
    
    question_text = models.TextField(_('question'))
    category = models.CharField(
        _('catégorie'),
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    order = models.IntegerField(_('ordre'), default=0)
    is_active = models.BooleanField(_('actif'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('question KPI')
        verbose_name_plural = _('questions KPI')
        db_table = 'kpi_question'
        ordering = ['category', 'order']
    
    def __str__(self):
        return f"{self.category}: {self.question_text[:50]}..."

class Testimonial(models.Model):
    """
    Testimonial model for stagiaire feedback
    """
    class Status(models.TextChoices):
        PENDING = 'pending', _('En attente')
        APPROVED = 'approved', _('Approuvé')
        REJECTED = 'rejected', _('Rejeté')
    
    class Type(models.TextChoices):
        TEXT = 'text', _('Texte')
        VIDEO = 'video', _('Vidéo')
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='testimonials')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='testimonials')
    
    # Content
    title = models.CharField(_('titre'), max_length=200)
    content = models.TextField(_('contenu'))
    testimonial_type = models.CharField(
        _('type de témoignage'),
        max_length=10,
        choices=Type.choices,
        default=Type.TEXT
    )
    
    # Media
    video_url = models.URLField(_('URL vidéo'), blank=True)
    video_file = models.FileField(_('fichier vidéo'), upload_to='testimonials/videos/', blank=True)
    
    # Status and moderation
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    moderated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='moderated_testimonials'
    )
    moderated_at = models.DateTimeField(_('date de modération'), null=True, blank=True)
    moderation_comment = models.TextField(_('commentaire de modération'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('témoignage')
        verbose_name_plural = _('témoignages')
        db_table = 'testimonial'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.author.get_full_name()}"

class Notification(models.Model):
    """
    Notification model for system notifications
    """
    class Type(models.TextChoices):
        INFO = 'info', _('Information')
        SUCCESS = 'success', _('Succès')
        WARNING = 'warning', _('Avertissement')
        ERROR = 'error', _('Erreur')
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(_('titre'), max_length=200)
    message = models.TextField(_('message'))
    notification_type = models.CharField(
        _('type de notification'),
        max_length=10,
        choices=Type.choices,
        default=Type.INFO
    )
    
    # Status
    is_read = models.BooleanField(_('lu'), default=False)
    read_at = models.DateTimeField(_('date de lecture'), null=True, blank=True)
    
    # Related objects
    related_stage = models.ForeignKey(Stage, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    related_step = models.ForeignKey(Step, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    related_document = models.ForeignKey(Document, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        db_table = 'notification'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.get_full_name()}"

class PFEDocument(models.Model):
    """
    PFE Document model for the PFE Digital Hub
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Brouillon')
        PUBLISHED = 'published', _('Publié')
        ARCHIVED = 'archived', _('Archivé')
    
    title = models.CharField(_('titre'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    authors = models.CharField(_('auteurs'), max_length=200)
    year = models.IntegerField(_('année'))
    speciality = models.CharField(_('spécialité'), max_length=200)
    supervisor = models.CharField(_('encadrant'), max_length=200, blank=True)
    
    # Files
    pdf_file = models.FileField(_('fichier PDF'), upload_to='pfe_documents/')
    presentation_file = models.FileField(_('fichier présentation'), upload_to='pfe_presentations/', blank=True)
    
    # Metadata
    keywords = models.TextField(_('mots-clés'), blank=True)
    abstract = models.TextField(_('résumé'), blank=True)
    
    # Status
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    published_at = models.DateTimeField(_('date de publication'), null=True, blank=True)
    published_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='published_pfe_documents'
    )
    
    # Statistics
    download_count = models.IntegerField(_('nombre de téléchargements'), default=0)
    view_count = models.IntegerField(_('nombre de vues'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('document PFE')
        verbose_name_plural = _('documents PFE')
        db_table = 'pfe_document'
        ordering = ['-year', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.authors} ({self.year})"
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def increment_download_count(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=['download_count'])

class OffreStage(models.Model):
    reference = models.CharField(_('référence'), max_length=50, unique=True, default='Inconnu')
    title = models.CharField(_('titre'), max_length=200, default='Inconnu')
    description = models.TextField(_('description'), default='Inconnu')
    objectifs = models.TextField(_('objectifs'), blank=True, default='Inconnu')
    keywords = models.TextField(_('mots clés'), blank=True, default='Inconnu')
    diplome = models.CharField(_('diplôme'), max_length=100, default='Inconnu')
    specialite = models.CharField(_('spécialité'), max_length=100, default='Inconnu')
    nombre_postes = models.PositiveIntegerField(_('nombre de postes'), default=1)
    ville = models.CharField(_('ville'), max_length=100, default='Inconnu')
    STATUS_CHOICES = [
        ('open', 'Ouverte'),
        ('closed', 'Fermée'),
        ('draft', 'Brouillon'),
        ('expired', 'Expirée'),
    ]
    status = models.CharField(_('statut'), max_length=20, choices=STATUS_CHOICES, default='draft')

    TYPE_CHOICES = [
        ('Classique', 'Classique'),
        ('PFE', 'PFE'),
    ]
    type = models.CharField(_('type'), max_length=20, choices=TYPE_CHOICES, default='Classique')

    validated = models.BooleanField(_('validée'), default=False)

    class Meta:
        verbose_name = _('offre de stage')
        verbose_name_plural = _('offres de stage')
        db_table = 'offre_stage'
        ordering = ['-id']

    def __str__(self):
        return f"{self.reference} - {self.title}"
