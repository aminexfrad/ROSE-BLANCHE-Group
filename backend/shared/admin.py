"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from .models import OffreStage

@admin.register(OffreStage)
class OffreStageAdmin(admin.ModelAdmin):
    list_display = ('reference', 'title', 'diplome', 'specialite', 'nombre_postes', 'ville')
    search_fields = ('reference', 'title', 'specialite', 'ville')
    fields = ('reference', 'title', 'description', 'objectifs', 'keywords', 'diplome', 'specialite', 'nombre_postes', 'ville')
