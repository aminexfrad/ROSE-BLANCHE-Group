"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from auth_service.models import User
from shared.models import Stage
from django.utils import timezone

class InternKpiEvaluation(models.Model):
    """
    Modèle pour évaluer les stagiaires après leur stage (PFE) à l'aide d'un tableau de suivi KPI
    """
    
    class PotentialCategory(models.TextChoices):
        HIGH = 'elevé', _('Potentiel élevé')
        GOOD = 'bon', _('Bon potentiel')
        AVERAGE = 'moyen', _('Potentiel moyen')
        TO_STRENGTHEN = 'à renforcer', _('Potentiel à renforcer')
    
    # Relations
    intern = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='kpi_evaluations',
        verbose_name=_('stagiaire'),
        limit_choices_to={'role': 'stagiaire'}
    )
    evaluator = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='kpi_evaluations_given',
        verbose_name=_('évaluateur'),
        limit_choices_to={'role': 'rh'}
    )
    stage = models.ForeignKey(
        Stage, 
        on_delete=models.CASCADE, 
        related_name='kpi_evaluations',
        verbose_name=_('stage'),
        null=True,
        blank=True
    )
    
    # Date d'évaluation
    evaluation_date = models.DateField(_('date d\'évaluation'), default=timezone.now)
    
    # KPIs avec notes sur 5
    delivery_satisfaction_rate = models.DecimalField(
        _('taux de satisfaction des livrables'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour le taux de satisfaction des livrables (poids: 25%)')
    )
    
    deadline_respect_rate = models.DecimalField(
        _('respect des délais'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour le respect des délais (poids: 20%)')
    )
    
    learning_capacity = models.DecimalField(
        _('capacité d\'apprentissage'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour la capacité d\'apprentissage (poids: 15%)')
    )
    
    initiative_taking = models.DecimalField(
        _('prise d\'initiatives'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour la prise d\'initiatives (poids: 10%)')
    )
    
    professional_behavior = models.DecimalField(
        _('comportement en entreprise et conduite'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour le comportement professionnel (poids: 15%)')
    )
    
    adaptability = models.DecimalField(
        _('adaptabilité au changement'),
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Note sur 5 pour l\'adaptabilité (poids: 15%)')
    )
    
    # Score total calculé automatiquement
    total_score = models.DecimalField(
        _('score total'),
        max_digits=4,
        decimal_places=2,
        editable=False,
        help_text=_('Score total calculé automatiquement sur 5')
    )
    
    # Interprétation automatique
    interpretation = models.CharField(
        _('interprétation'),
        max_length=20,
        choices=PotentialCategory.choices,
        editable=False,
        help_text=_('Catégorie de potentiel déterminée automatiquement')
    )
    
    # Commentaires additionnels
    comments = models.TextField(_('commentaires'), blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)
    
    class Meta:
        verbose_name = _('évaluation KPI stagiaire')
        verbose_name_plural = _('évaluations KPI stagiaires')
        db_table = 'intern_kpi_evaluations'
        ordering = ['-evaluation_date', '-created_at']
        unique_together = ['intern', 'stage', 'evaluation_date']
    
    def __str__(self):
        return f"Évaluation KPI de {self.intern.get_full_name()} - {self.evaluation_date}"
    
    def save(self, *args, **kwargs):
        """Calculer automatiquement le score total et l'interprétation"""
        self.calculate_total_score()
        self.determine_interpretation()
        super().save(*args, **kwargs)
    
    def calculate_total_score(self):
        """Calculer le score total pondéré"""
        # Poids des KPIs selon le fichier Excel
        weights = {
            'delivery_satisfaction_rate': 0.25,  # 25%
            'deadline_respect_rate': 0.20,       # 20%
            'learning_capacity': 0.15,           # 15%
            'initiative_taking': 0.10,           # 10%
            'professional_behavior': 0.15,       # 15%
            'adaptability': 0.15                 # 15%
        }
        
        # Calcul du score pondéré
        total = (
            self.delivery_satisfaction_rate * weights['delivery_satisfaction_rate'] +
            self.deadline_respect_rate * weights['deadline_respect_rate'] +
            self.learning_capacity * weights['learning_capacity'] +
            self.initiative_taking * weights['initiative_taking'] +
            self.professional_behavior * weights['professional_behavior'] +
            self.adaptability * weights['adaptability']
        )
        
        self.total_score = round(total, 2)
    
    def determine_interpretation(self):
        """Déterminer l'interprétation basée sur le score total"""
        if self.total_score >= 4.5:
            self.interpretation = self.PotentialCategory.HIGH
        elif self.total_score >= 3.5:
            self.interpretation = self.PotentialCategory.GOOD
        elif self.total_score >= 2.5:
            self.interpretation = self.PotentialCategory.AVERAGE
        else:
            self.interpretation = self.PotentialCategory.TO_STRENGTHEN
    
    @property
    def get_weights_summary(self):
        """Retourner un résumé des poids pour l'affichage"""
        return {
            'delivery_satisfaction_rate': {'weight': 0.25, 'percentage': '25%'},
            'deadline_respect_rate': {'weight': 0.20, 'percentage': '20%'},
            'learning_capacity': {'weight': 0.15, 'percentage': '15%'},
            'initiative_taking': {'weight': 0.10, 'percentage': '10%'},
            'professional_behavior': {'weight': 0.15, 'percentage': '15%'},
            'adaptability': {'weight': 0.15, 'percentage': '15%'}
        }
    
    @property
    def get_score_details(self):
        """Retourner les détails des scores pour l'affichage"""
        return {
            'delivery_satisfaction_rate': {
                'score': self.delivery_satisfaction_rate,
                'weight': 0.25,
                'weighted_score': self.delivery_satisfaction_rate * 0.25
            },
            'deadline_respect_rate': {
                'score': self.deadline_respect_rate,
                'weight': 0.20,
                'weighted_score': self.deadline_respect_rate * 0.20
            },
            'learning_capacity': {
                'score': self.learning_capacity,
                'weight': 0.15,
                'weighted_score': self.learning_capacity * 0.15
            },
            'initiative_taking': {
                'score': self.initiative_taking,
                'weight': 0.10,
                'weighted_score': self.initiative_taking * 0.10
            },
            'professional_behavior': {
                'score': self.professional_behavior,
                'weight': 0.15,
                'weighted_score': self.professional_behavior * 0.15
            },
            'adaptability': {
                'score': self.adaptability,
                'weight': 0.15,
                'weighted_score': self.adaptability * 0.15
            }
        }
