from django.db import models
from django.utils.translation import gettext_lazy as _

class PFEProject(models.Model):
    reference_id = models.CharField(_('référence'), max_length=50, unique=True, default='Inconnu')
    title = models.CharField(_('titre'), max_length=200, default='Inconnu')
    description = models.TextField(_('description'), default='Inconnu')
    objectives = models.TextField(_('objectifs'), blank=True, default='Inconnu')
    keywords = models.TextField(_('mots clés'), blank=True, default='Inconnu')
    diplome = models.CharField(_('diplôme'), max_length=100, default='Inconnu')
    specialite = models.CharField(_('spécialité'), max_length=100, default='Inconnu')
    nombre_postes = models.PositiveIntegerField(_('nombre de postes'), default=1)
    ville = models.CharField(_('ville'), max_length=100, default='Inconnu')

    class Meta:
        verbose_name = _('projet PFE')
        verbose_name_plural = _('projets PFE')
        db_table = 'pfe_project'
        ordering = ['-id']

    def __str__(self):
        return f"{self.reference_id} - {self.title}" 