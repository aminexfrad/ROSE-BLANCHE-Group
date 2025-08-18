"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Demande, Interview


@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    """Admin configuration for Demande model"""
    
    list_display = ('nom_complet', 'email', 'institut', 'type_stage', 'niveau', 'pfe_reference_display', 'stage_binome', 'entreprise', 'status', 'created_at')
    list_filter = ('status', 'type_stage', 'institut', 'stage_binome', 'entreprise', 'created_at')
    search_fields = ('nom', 'prenom', 'email', 'institut', 'specialite', 'pfe_reference', 'entreprise__nom')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'nom_complet', 'nom_complet_binome', 'duree_stage', 'is_pfe_stage')
    
    fieldsets = (
        (_('Informations du candidat principal'), {
            'fields': ('nom', 'prenom', 'email', 'telephone')
        }),
        (_('Informations académiques'), {
            'fields': ('institut', 'specialite', 'type_stage', 'niveau', 'pfe_reference')
        }),
        (_('Détails du stage'), {
            'fields': ('date_debut', 'date_fin', 'duree_stage')
        }),
        (_('Stage en binôme'), {
            'fields': ('stage_binome', 'nom_binome', 'prenom_binome', 'email_binome', 'telephone_binome'),
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
            'fields': ('status', 'raison_refus', 'user_created', 'entreprise')
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


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    """Admin configuration for Interview model"""
    
    list_display = ('demande_candidate', 'demande_entreprise', 'interview_datetime', 'location', 'status', 'email_sent', 'scheduled_by', 'created_at')
    list_filter = ('status', 'email_sent', 'date', 'scheduled_by', 'created_at')
    search_fields = ('demande__nom', 'demande__prenom', 'demande__email', 'location', 'notes')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'email_sent_at', 'formatted_datetime')
    
    fieldsets = (
        (_('Informations de l\'entretien'), {
            'fields': ('demande', 'scheduled_by', 'date', 'time', 'location', 'notes')
        }),
        (_('Statut et notifications'), {
            'fields': ('status', 'email_sent', 'email_sent_at')
        }),
        (_('Informations système'), {
            'fields': ('created_at', 'updated_at', 'formatted_datetime'),
            'classes': ('collapse',)
        }),
    )
    
    def demande_candidate(self, obj):
        return obj.demande.nom_complet
    demande_candidate.short_description = _('Candidat')
    demande_candidate.admin_order_field = 'demande__nom'
    
    def demande_entreprise(self, obj):
        return obj.demande.entreprise.nom if obj.demande.entreprise else '-'
    demande_entreprise.short_description = _('Entreprise')
    demande_entreprise.admin_order_field = 'demande__entreprise__nom'
    
    def interview_datetime(self, obj):
        return obj.formatted_datetime
    interview_datetime.short_description = _('Date et heure')
    interview_datetime.admin_order_field = 'date'
    
    def formatted_datetime(self, obj):
        return obj.formatted_datetime
    formatted_datetime.short_description = _('Date et heure formatées')
