from django.contrib import admin
from .models import PFEProject

@admin.register(PFEProject)
class PFEProjectAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'title', 'diplome', 'specialite', 'nombre_postes', 'ville')
    search_fields = ('reference_id', 'title', 'specialite', 'ville')
    fields = ('reference_id', 'title', 'description', 'objectives', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville') 