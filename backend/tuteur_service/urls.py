"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Stagiaires management
    path('stagiaires/', views.TuteurStagiairesView.as_view(), name='tuteur-stagiaires'),
    path('stagiaires/<int:stagiaire_id>/', views.TuteurStagiaireDetailView.as_view(), name='tuteur-stagiaire-detail'),
    
    # Evaluations
    path('evaluations/', views.TuteurEvaluationsView.as_view(), name='tuteur-evaluations'),
    
    # Statistics
    path('statistiques/', views.TuteurStatisticsView.as_view(), name='tuteur-statistics'),
    
    # Existing views (if any)
    # path('stages/', views.TuteurStagesView.as_view(), name='tuteur-stages'),
    # path('stages/<int:stage_id>/', views.TuteurStageDetailView.as_view(), name='tuteur-stage-detail'),
]