"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from .models import Entreprise, OffreStage, PFEReport, PFEDocument

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
    list_display = ('reference', 'title', 'entreprise', 'diplome', 'specialite', 'nombre_postes', 'ville')
    list_filter = ('entreprise', 'status', 'type', 'ville')
    search_fields = ('reference', 'title', 'specialite', 'ville', 'entreprise__nom')
    fields = ('reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville', 'entreprise', 'status', 'type', 'validated')

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
    list_display = ('title', 'authors', 'year', 'speciality', 'status', 'published_at', 'download_count', 'view_count')
    list_filter = ('status', 'year', 'speciality', 'published_at')
    search_fields = ('title', 'authors', 'keywords', 'abstract')
    readonly_fields = ('created_at', 'updated_at', 'published_at', 'download_count', 'view_count')
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'description', 'authors', 'year', 'speciality', 'supervisor')
        }),
        ('Contenu', {
            'fields': ('keywords', 'abstract')
        }),
        ('Fichiers', {
            'fields': ('pdf_file', 'presentation_file')
        }),
        ('Statut', {
            'fields': ('status', 'published_at', 'published_by')
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
