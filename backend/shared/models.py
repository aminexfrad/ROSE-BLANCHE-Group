"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from auth_service.models import User
from demande_service.models import Demande
from django.utils import timezone

class Entreprise(models.Model):
    """
    Company model to support multiple companies in the system
    """
    nom = models.CharField(_('nom'), max_length=200, unique=True)
    description = models.TextField(_('description'), blank=True)
    secteur_activite = models.CharField(_('secteur d\'activité'), max_length=200, blank=True)
    adresse = models.TextField(_('adresse'), blank=True)
    ville = models.CharField(_('ville'), max_length=100, blank=True)
    pays = models.CharField(_('pays'), max_length=100, default='Maroc')
    telephone = models.CharField(_('téléphone'), max_length=20, blank=True)
    email = models.EmailField(_('email'), blank=True)
    site_web = models.URLField(_('site web'), blank=True)
    logo = models.ImageField(_('logo'), upload_to='entreprises/logos/', blank=True, null=True)
    
    # Company status
    is_active = models.BooleanField(_('active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('entreprise')
        verbose_name_plural = _('entreprises')
        db_table = 'entreprise'
        ordering = ['nom']
    
    def __str__(self):
        return self.nom
    
    @property
    def nombre_stagiaires(self):
        """Get the number of active stagiaires in this company"""
        from auth_service.models import User
        return User.objects.filter(
            role='stagiaire',
            stages_stagiaire__company_entreprise=self,
            stages_stagiaire__status='active'
        ).distinct().count()
    
    @property
    def nombre_rh(self):
        """Get the number of RH users in this company"""
        from auth_service.models import User
        return User.objects.filter(
            role='rh',
            entreprise=self
        ).count()

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
    company_entreprise = models.ForeignKey(Entreprise, on_delete=models.SET_NULL, null=True, blank=True, related_name='stages', verbose_name=_('entreprise'))
    company_name = models.CharField(_('nom entreprise'), max_length=200, blank=True)  # Keep for backward compatibility
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
        company_name = self.company_entreprise.nom if self.company_entreprise else self.company_name or 'Aucune entreprise'
        return f"Stage: {self.title} - {self.stagiaire.get_full_name()} - {company_name}"
    
    @property
    def duration_days(self):
        """Calculate stage duration in days"""
        return (self.end_date - self.start_date).days
    
    @property
    def days_remaining(self):
        """Calculate days remaining"""
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
        if self.pk and self.progress == 0:
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

class Survey(models.Model):
    """
    Survey model for KPI 360° feedback
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Brouillon')
        ACTIVE = 'active', _('Actif')
        CLOSED = 'closed', _('Fermé')
        ARCHIVED = 'archived', _('Archivé')
    
    class TargetType(models.TextChoices):
        ALL_STAGIAIRES = 'all_stagiaires', _('Tous les stagiaires')
        SPECIFIC_STAGIAIRES = 'specific_stagiaires', _('Stagiaires spécifiques')
        BY_INSTITUTE = 'by_institute', _('Par institut')
        BY_SPECIALITY = 'by_speciality', _('Par spécialité')
    
    # Basic information
    title = models.CharField(_('titre'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_surveys')
    
    # Target configuration
    target_type = models.CharField(
        _('type de cible'),
        max_length=20,
        choices=TargetType.choices,
        default=TargetType.ALL_STAGIAIRES
    )
    target_stagiaires = models.ManyToManyField(
        User, 
        blank=True, 
        related_name='assigned_surveys',
        limit_choices_to={'role': 'stagiaire'}
    )
    target_institutes = models.JSONField(_('instituts cibles'), default=list, blank=True)
    target_specialities = models.JSONField(_('spécialités cibles'), default=list, blank=True)
    
    # Scheduling
    scheduled_start = models.DateTimeField(_('début programmé'), null=True, blank=True)
    scheduled_end = models.DateTimeField(_('fin programmée'), null=True, blank=True)
    actual_start = models.DateTimeField(_('début réel'), null=True, blank=True)
    actual_end = models.DateTimeField(_('fin réelle'), null=True, blank=True)
    
    # Status
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    # KPI thresholds for alerts
    kpi_threshold_warning = models.DecimalField(_('seuil d\'alerte'), max_digits=5, decimal_places=2, default=3.0)
    kpi_threshold_critical = models.DecimalField(_('seuil critique'), max_digits=5, decimal_places=2, default=2.0)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('sondage')
        verbose_name_plural = _('sondages')
        db_table = 'survey'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def response_rate(self):
        """Calculate response rate percentage"""
        total_targets = self.get_target_stagiaires().count()
        if total_targets == 0:
            return 0
        responses = self.responses.filter(is_completed=True).count()
        return round((responses / total_targets) * 100, 1)
    
    @property
    def average_score(self):
        """Calculate average score from completed responses"""
        completed_responses = self.responses.filter(is_completed=True)
        if not completed_responses.exists():
            return 0
        total_score = sum(response.overall_score or 0 for response in completed_responses)
        return round(total_score / completed_responses.count(), 2)
    
    def get_target_stagiaires(self):
        """Get all target stagiaires based on configuration"""
        if self.target_type == Survey.TargetType.ALL_STAGIAIRES:
            return User.objects.filter(role='stagiaire')
        elif self.target_type == Survey.TargetType.SPECIFIC_STAGIAIRES:
            return self.target_stagiaires.all()
        elif self.target_type == Survey.TargetType.BY_INSTITUTE:
            return User.objects.filter(role='stagiaire', institut__in=self.target_institutes)
        elif self.target_type == Survey.TargetType.BY_SPECIALITY:
            return User.objects.filter(role='stagiaire', specialite__in=self.target_specialities)
        return User.objects.none()
    
    def send_survey(self):
        """Send survey to target stagiaires"""
        if self.status != Survey.Status.DRAFT:
            return False
        
        target_stagiaires = self.get_target_stagiaires()
        
        # Create survey responses for each target stagiaire
        for stagiaire in target_stagiaires:
            SurveyResponse.objects.get_or_create(
                survey=self,
                stagiaire=stagiaire,
                defaults={'is_completed': False}
            )
        
        # Update survey status and dates
        self.status = Survey.Status.ACTIVE
        self.actual_start = timezone.now()
        self.save()
        
        # Send notifications
        for stagiaire in target_stagiaires:
            Notification.objects.create(
                recipient=stagiaire,
                title=f"Nouveau sondage: {self.title}",
                message=f"Un nouveau sondage KPI est disponible. Veuillez y répondre.",
                notification_type=Notification.Type.INFO
            )
        
        return True
    
    def close_survey(self):
        """Close the survey"""
        if self.status != Survey.Status.ACTIVE:
            return False
        
        self.status = Survey.Status.CLOSED
        self.actual_end = timezone.now()
        self.save()
        
        return True
    
    def check_kpi_thresholds(self):
        """Check KPI thresholds and generate alerts"""
        completed_responses = self.responses.filter(is_completed=True)
        
        for response in completed_responses:
            if response.overall_score:
                if response.overall_score <= self.kpi_threshold_critical:
                    # Create critical alert for RH
                    Notification.objects.create(
                        recipient=self.created_by,
                        title=f"Alerte critique KPI - {response.stagiaire.get_full_name()}",
                        message=f"Score critique ({response.overall_score}/5) pour le sondage '{self.title}'",
                        notification_type=Notification.Type.ERROR
                    )
                elif response.overall_score <= self.kpi_threshold_warning:
                    # Create warning alert for RH
                    Notification.objects.create(
                        recipient=self.created_by,
                        title=f"Alerte KPI - {response.stagiaire.get_full_name()}",
                        message=f"Score faible ({response.overall_score}/5) pour le sondage '{self.title}'",
                        notification_type=Notification.Type.WARNING
                    )


class SurveyQuestion(models.Model):
    """
    Survey question model
    """
    class QuestionType(models.TextChoices):
        RATING = 'rating', _('Évaluation (1-5)')
        TEXT = 'text', _('Texte libre')
        CHOICE = 'choice', _('Choix multiple')
        BOOLEAN = 'boolean', _('Oui/Non')
    
    class Category(models.TextChoices):
        TECHNICAL = 'technical', _('Technique')
        SOFT_SKILLS = 'soft_skills', _('Soft Skills')
        COMMUNICATION = 'communication', _('Communication')
        TEAMWORK = 'teamwork', _('Travail d\'équipe')
        LEADERSHIP = 'leadership', _('Leadership')
        ADAPTABILITY = 'adaptability', _('Adaptabilité')
        SATISFACTION = 'satisfaction', _('Satisfaction')
        OTHER = 'other', _('Autre')
    
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField(_('question'))
    question_type = models.CharField(
        _('type de question'),
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.RATING
    )
    category = models.CharField(
        _('catégorie'),
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    order = models.IntegerField(_('ordre'), default=0)
    is_required = models.BooleanField(_('obligatoire'), default=True)
    
    # For choice questions
    choices = models.JSONField(_('choix'), default=list, blank=True)
    
    # KPI weight for scoring
    kpi_weight = models.DecimalField(_('poids KPI'), max_digits=3, decimal_places=2, default=1.00)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('question de sondage')
        verbose_name_plural = _('questions de sondage')
        db_table = 'survey_question'
        ordering = ['order']
        unique_together = ['survey', 'order']
    
    def __str__(self):
        return f"{self.survey.title}: {self.question_text[:50]}..."


class SurveyResponse(models.Model):
    """
    Survey response model
    """
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    stagiaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='survey_responses')
    
    # Response data
    answers = models.JSONField(_('réponses'), default=dict)  # Store question_id: answer mapping
    overall_score = models.DecimalField(_('score global'), max_digits=5, decimal_places=2, null=True, blank=True)
    category_scores = models.JSONField(_('scores par catégorie'), default=dict, blank=True)
    
    # Status
    is_completed = models.BooleanField(_('terminé'), default=False)
    completed_at = models.DateTimeField(_('date de completion'), null=True, blank=True)
    
    # Additional feedback
    additional_comments = models.TextField(_('commentaires additionnels'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('réponse au sondage')
        verbose_name_plural = _('réponses au sondage')
        db_table = 'survey_response'
        ordering = ['-created_at']
        unique_together = ['survey', 'stagiaire']
    
    def __str__(self):
        return f"{self.stagiaire.get_full_name()} - {self.survey.title}"
    
    def calculate_scores(self):
        """Calculate overall and category scores from answers"""
        if not self.answers or not self.is_completed:
            return
        
        total_score = 0
        total_weight = 0
        category_scores = {}
        category_weights = {}
        
        for question_id, answer in self.answers.items():
            try:
                question = self.survey.questions.get(id=question_id)
                
                # Calculate score based on question type
                if question.question_type == SurveyQuestion.QuestionType.RATING:
                    score = float(answer) if answer else 0
                elif question.question_type == SurveyQuestion.QuestionType.BOOLEAN:
                    score = 5.0 if answer else 1.0
                elif question.question_type == SurveyQuestion.QuestionType.CHOICE:
                    # For choice questions, assume 1-5 scale based on choice index
                    choices = question.choices
                    if answer in choices:
                        score = (choices.index(answer) + 1) * (5.0 / len(choices))
                    else:
                        score = 0
                else:
                    score = 0  # Text questions don't contribute to score
                
                # Apply weight
                weighted_score = score * float(question.kpi_weight)
                total_score += weighted_score
                total_weight += float(question.kpi_weight)
                
                # Category scores
                category = question.category
                if category not in category_scores:
                    category_scores[category] = 0
                    category_weights[category] = 0
                
                category_scores[category] += weighted_score
                category_weights[category] += float(question.kpi_weight)
                
            except (SurveyQuestion.DoesNotExist, ValueError, TypeError):
                continue
        
        # Calculate overall score
        if total_weight > 0:
            self.overall_score = round(total_score / total_weight, 2)
        else:
            self.overall_score = 0
        
        # Calculate category averages
        self.category_scores = {}
        for category, total in category_scores.items():
            weight = category_weights.get(category, 0)
            if weight > 0:
                self.category_scores[category] = round(total / weight, 2)
            else:
                self.category_scores[category] = 0
        
        self.save(update_fields=['overall_score', 'category_scores'])


class KPIDashboard(models.Model):
    """
    KPI Dashboard model for aggregated survey data
    """
    survey = models.OneToOneField(Survey, on_delete=models.CASCADE, related_name='kpi_dashboard')
    
    # Aggregated data
    total_responses = models.IntegerField(_('total réponses'), default=0)
    response_rate = models.DecimalField(_('taux de réponse'), max_digits=5, decimal_places=2, default=0)
    average_score = models.DecimalField(_('score moyen'), max_digits=5, decimal_places=2, default=0)
    category_averages = models.JSONField(_('moyennes par catégorie'), default=dict, blank=True)
    
    # Alert counts
    critical_alerts = models.IntegerField(_('alertes critiques'), default=0)
    warning_alerts = models.IntegerField(_('alertes d\'avertissement'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('tableau de bord KPI')
        verbose_name_plural = _('tableaux de bord KPI')
        db_table = 'kpi_dashboard'
    
    def __str__(self):
        return f"KPI Dashboard - {self.survey.title}"
    
    def calculate_kpi_data(self):
        """Calculate and update KPI dashboard data"""
        completed_responses = self.survey.responses.filter(is_completed=True)
        
        # Basic counts
        self.total_responses = completed_responses.count()
        total_targets = self.survey.get_target_stagiaires().count()
        self.response_rate = round((self.total_responses / total_targets * 100), 2) if total_targets > 0 else 0
        
        # Average scores
        if self.total_responses > 0:
            total_score = sum(response.overall_score or 0 for response in completed_responses)
            self.average_score = round(total_score / self.total_responses, 2)
            
            # Category averages
            category_totals = {}
            category_counts = {}
            
            for response in completed_responses:
                for category, score in response.category_scores.items():
                    if category not in category_totals:
                        category_totals[category] = 0
                        category_counts[category] = 0
                    category_totals[category] += score
                    category_counts[category] += 1
            
            self.category_averages = {}
            for category in category_totals:
                if category_counts[category] > 0:
                    self.category_averages[category] = round(
                        category_totals[category] / category_counts[category], 2
                    )
        
        # Alert counts
        self.critical_alerts = completed_responses.filter(
            overall_score__lte=self.survey.kpi_threshold_critical
        ).count()
        
        self.warning_alerts = completed_responses.filter(
            overall_score__lte=self.survey.kpi_threshold_warning,
            overall_score__gt=self.survey.kpi_threshold_critical
        ).count()
        
        self.save()
    
    def generate_report_data(self):
        """Generate data for reports"""
        return {
            'survey_title': self.survey.title,
            'total_responses': self.total_responses,
            'response_rate': self.response_rate,
            'average_score': self.average_score,
            'category_averages': self.category_averages,
            'critical_alerts': self.critical_alerts,
            'warning_alerts': self.warning_alerts,
            'last_updated': self.updated_at.isoformat()
        }


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
    entreprise = models.ForeignKey(Entreprise, on_delete=models.SET_NULL, null=True, blank=True, related_name='offres_stage', verbose_name=_('entreprise'))
    STATUS_CHOICES = [
        ('open', 'Ouverte'),
        ('closed', 'Fermée'),
        ('draft', 'Brouillon'),
        ('expired', 'Expirée'),
    ]
    status = models.CharField(_('statut'), max_length=20, choices=STATUS_CHOICES, default='draft')

    TYPE_CHOICES = [
        ('PFE', 'PFE'),
    ]
    type = models.CharField(_('type'), max_length=20, choices=TYPE_CHOICES, default='PFE')

    validated = models.BooleanField(_('validée'), default=False)

    class Meta:
        verbose_name = _('offre de stage')
        verbose_name_plural = _('offres de stage')
        db_table = 'offre_stage'
        ordering = ['-id']

    def __str__(self):
        return f"{self.reference} - {self.title} - {self.entreprise.nom}"

class PFEReport(models.Model):
    """
    PFE Report model for the PFE Digital Hub - manages PFE report submission and validation
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Brouillon')
        SUBMITTED = 'submitted', _('Soumis')
        UNDER_REVIEW = 'under_review', _('En cours de révision')
        APPROVED = 'approved', _('Approuvé')
        REJECTED = 'rejected', _('Rejeté')
        ARCHIVED = 'archived', _('Archivé')
    
    # Basic information
    stage = models.OneToOneField(Stage, on_delete=models.CASCADE, related_name='pfe_report')
    stagiaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pfe_reports')
    tuteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pfe_reports_tuteur', null=True, blank=True)
    
    # Report details
    title = models.CharField(_('titre'), max_length=200)
    abstract = models.TextField(_('résumé'), blank=True)
    keywords = models.TextField(_('mots-clés'), blank=True)
    speciality = models.CharField(_('spécialité'), max_length=200)
    year = models.IntegerField(_('année'), default=timezone.now().year)
    
    # Files
    pdf_file = models.FileField(_('rapport PDF'), upload_to='pfe_reports/', blank=True, null=True)
    presentation_file = models.FileField(_('présentation'), upload_to='pfe_presentations/', blank=True)
    additional_files = models.FileField(_('fichiers additionnels'), upload_to='pfe_additional/', blank=True)
    
    # Status and validation
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    submitted_at = models.DateTimeField(_('date de soumission'), null=True, blank=True)
    reviewed_at = models.DateTimeField(_('date de révision'), null=True, blank=True)
    approved_at = models.DateTimeField(_('date d\'approbation'), null=True, blank=True)
    archived_at = models.DateTimeField(_('date d\'archivage'), null=True, blank=True)
    
    # Feedback and comments
    tuteur_feedback = models.TextField(_('feedback tuteur'), blank=True)
    stagiaire_comment = models.TextField(_('commentaire stagiaire'), blank=True)
    rejection_reason = models.TextField(_('raison du rejet'), blank=True)
    
    # Metadata
    version = models.IntegerField(_('version'), default=1)
    is_final = models.BooleanField(_('version finale'), default=False)
    
    # Statistics
    download_count = models.IntegerField(_('nombre de téléchargements'), default=0)
    view_count = models.IntegerField(_('nombre de vues'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('rapport PFE')
        verbose_name_plural = _('rapports PFE')
        db_table = 'pfe_report'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.stagiaire.get_full_name()} ({self.year})"
    
    def submit(self):
        """Submit the report for review"""
        self.status = self.Status.SUBMITTED
        self.submitted_at = timezone.now()
        self.save()
    
    def approve(self, tuteur_feedback=""):
        """Approve the report"""
        self.status = self.Status.APPROVED
        self.reviewed_at = timezone.now()
        self.approved_at = timezone.now()
        self.tuteur_feedback = tuteur_feedback
        self.save()
    
    def reject(self, rejection_reason):
        """Reject the report with reason"""
        self.status = self.Status.REJECTED
        self.reviewed_at = timezone.now()
        self.rejection_reason = rejection_reason
        self.save()
    
    def archive(self):
        """Archive the approved report"""
        if self.status == self.Status.APPROVED:
            self.status = self.Status.ARCHIVED
            self.archived_at = timezone.now()
            self.save()
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def increment_download_count(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
