"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Entreprise, OffreStage, PFEReport, PFEDocument, Candidat
from django.utils import timezone

@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'secteur_activite', 'ville', 'pays', 'is_active', 'nombre_stagiaires', 'nombre_rh')
    list_filter = ('is_active', 'secteur_activite', 'pays', 'ville')
    search_fields = ('nom', 'description', 'secteur_activite', 'ville')
    readonly_fields = ('nombre_stagiaires', 'nombre_rh', 'created_at', 'updated_at')
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'description', 'secteur_activite')
        }),
        ('Localisation', {
            'fields': ('adresse', 'ville', 'pays')
        }),
        ('Contact', {
            'fields': ('telephone', 'email', 'site_web')
        }),
        ('Médias', {
            'fields': ('logo',)
        }),
        ('Statut', {
            'fields': ('is_active',)
        }),
        ('Statistiques', {
            'fields': ('nombre_stagiaires', 'nombre_rh'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(OffreStage)
class OffreStageAdmin(admin.ModelAdmin):
    list_display = ('reference', 'title', 'entreprise', 'diplome', 'specialite', 'nombre_postes', 'ville', 'status', 'validated')
    list_filter = ('entreprise', 'status', 'type', 'ville', 'validated')
    search_fields = ('reference', 'title', 'specialite', 'ville', 'entreprise__nom')
    list_editable = ('status', 'validated')
    fields = ('reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville', 'entreprise', 'status', 'type', 'validated')
    
    actions = ['delete_selected_offres', 'mark_as_validated', 'mark_as_open']
    
    def delete_selected_offres(self, request, queryset):
        """Supprimer les offres sélectionnées en gérant les relations"""
        from demande_service.models import DemandeOffre
        
        count = 0
        for offre in queryset:
            try:
                # Supprimer d'abord les relations DemandeOffre
                DemandeOffre.objects.filter(offre=offre).delete()
                # Puis supprimer l'offre
                offre.delete()
                count += 1
            except Exception as e:
                self.message_user(request, f"Erreur lors de la suppression de {offre.reference}: {e}", level='ERROR')
        
        if count > 0:
            self.message_user(request, f"{count} offre(s) supprimée(s) avec succès!")
    
    delete_selected_offres.short_description = "Supprimer les offres sélectionnées (avec relations)"
    
    def mark_as_validated(self, request, queryset):
        """Marquer les offres comme validées"""
        updated = queryset.update(validated=True)
        self.message_user(request, f"{updated} offre(s) marquée(s) comme validées!")
    
    mark_as_validated.short_description = "Marquer comme validées"
    
    def mark_as_open(self, request, queryset):
        """Marquer les offres comme ouvertes"""
        updated = queryset.update(status='open')
        self.message_user(request, f"{updated} offre(s) marquée(s) comme ouvertes!")
    
    mark_as_open.short_description = "Marquer comme ouvertes"
    
    def get_queryset(self, request):
        """Optimiser les requêtes avec select_related"""
        return super().get_queryset(request).select_related('entreprise')

@admin.register(PFEReport)
class PFEReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'stagiaire', 'tuteur', 'status', 'year', 'speciality', 'created_at', 'submitted_at')
    list_filter = ('status', 'year', 'speciality', 'created_at', 'submitted_at')
    search_fields = ('title', 'abstract', 'keywords', 'stagiaire__nom', 'stagiaire__prenom', 'tuteur__nom', 'tuteur__prenom')
    readonly_fields = ('created_at', 'updated_at', 'submitted_at', 'reviewed_at', 'approved_at', 'archived_at', 'download_count', 'view_count')
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'abstract', 'keywords', 'speciality', 'year', 'version')
        }),
        ('Utilisateurs', {
            'fields': ('stage', 'stagiaire', 'tuteur')
        }),
        ('Fichiers', {
            'fields': ('pdf_file', 'presentation_file', 'additional_files')
        }),
        ('Statut et validation', {
            'fields': ('status', 'submitted_at', 'reviewed_at', 'approved_at', 'archived_at')
        }),
        ('Feedback', {
            'fields': ('tuteur_feedback', 'stagiaire_comment', 'rejection_reason')
        }),
        ('Statistiques', {
            'fields': ('download_count', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('stagiaire', 'tuteur', 'stage')

@admin.register(PFEDocument)
class PFEDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'authors', 'year', 'speciality', 'status', 'published_at']
    list_filter = ['status', 'year', 'speciality', 'published_at']
    search_fields = ['title', 'description', 'authors', 'keywords', 'abstract']
    readonly_fields = ['created_at', 'updated_at', 'download_count', 'view_count']
    list_per_page = 20


@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'institut', 'specialite', 'niveau', 
        'nombre_demandes_soumises', 'demandes_restantes', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'niveau', 'institut', 'created_at']
    search_fields = [
        'user__email', 'user__nom', 'user__prenom', 
        'institut', 'specialite', 'niveau'
    ]
    readonly_fields = [
        'nombre_demandes_soumises', 'demandes_restantes', 
        'date_derniere_demande', 'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Informations utilisateur', {
            'fields': ('user', 'is_active')
        }),
        ('Informations académiques', {
            'fields': ('institut', 'specialite', 'niveau')
        }),
        ('Informations supplémentaires', {
            'fields': ('bio', 'linkedin_url', 'portfolio_url')
        }),
        ('Suivi des demandes', {
            'fields': (
                'nombre_demandes_soumises', 'nombre_demandes_max', 
                'demandes_restantes', 'date_derniere_demande'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    list_per_page = 20
    
    def demandes_restantes(self, obj):
        return obj.demandes_restantes
    demandes_restantes.short_description = 'Demandes restantes'





