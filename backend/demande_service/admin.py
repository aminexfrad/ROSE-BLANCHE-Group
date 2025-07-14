"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Demande


@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    """Admin configuration for Demande model"""
    
    list_display = ('nom_complet', 'email', 'institut', 'type_stage', 'niveau', 'pfe_reference_display', 'stage_binome', 'status', 'created_at')
    list_filter = ('status', 'type_stage', 'institut', 'stage_binome', 'created_at')
    search_fields = ('nom', 'prenom', 'email', 'institut', 'specialite', 'pfe_reference')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'nom_complet', 'nom_complet_binome', 'duree_stage', 'is_pfe_stage')
    
    fieldsets = (
        (_('Informations du candidat principal'), {
            'fields': ('nom', 'prenom', 'email', 'telephone', 'cin')
        }),
        (_('Informations académiques'), {
            'fields': ('institut', 'specialite', 'type_stage', 'niveau', 'pfe_reference')
        }),
        (_('Détails du stage'), {
            'fields': ('date_debut', 'date_fin', 'duree_stage')
        }),
        (_('Stage en binôme'), {
            'fields': ('stage_binome', 'nom_binome', 'prenom_binome', 'email_binome', 'telephone_binome', 'cin_binome'),
            'classes': ('collapse',)
        }),
        (_('Documents du candidat principal'), {
            'fields': ('cv', 'lettre_motivation', 'demande_stage')
        }),
        (_('Documents du binôme'), {
            'fields': ('cv_binome', 'lettre_motivation_binome', 'demande_stage_binome'),
            'classes': ('collapse',)
        }),
        (_('Statut et traitement'), {
            'fields': ('status', 'raison_refus', 'user_created')
        }),
        (_('Informations système'), {
            'fields': ('created_at', 'updated_at', 'is_pfe_stage'),
            'classes': ('collapse',)
        }),
    )
    
    def nom_complet(self, obj):
        return obj.nom_complet
    nom_complet.short_description = _('Nom complet')
    nom_complet.admin_order_field = 'nom'
    
    def nom_complet_binome(self, obj):
        return obj.nom_complet_binome
    nom_complet_binome.short_description = _('Nom complet du binôme')
    
    def pfe_reference_display(self, obj):
        if obj.pfe_reference:
            return format_html('<span style="color: green;">✓ {}</span>', obj.pfe_reference)
        return format_html('<span style="color: red;">✗ Non fourni</span>')
    pfe_reference_display.short_description = _('Référence PFE')
    
    def is_pfe_stage(self, obj):
        return obj.is_pfe_stage
    is_pfe_stage.short_description = _('Stage PFE')
    is_pfe_stage.boolean = True
