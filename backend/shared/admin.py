from django.contrib import admin
from .models import OffreStage

@admin.register(OffreStage)
class OffreStageAdmin(admin.ModelAdmin):
    list_display = ('reference', 'title', 'diplome', 'specialite', 'nombre_postes', 'ville')
    search_fields = ('reference', 'title', 'specialite', 'ville')
    fields = ('reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville')
