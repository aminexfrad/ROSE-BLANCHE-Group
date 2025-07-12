from django.urls import path
from . import views

urlpatterns = [
    # Stagiaires management
    path('stagiaires/', views.TuteurStagiairesView.as_view(), name='tuteur-stagiaires'),
    path('stagiaires/<int:stagiaire_id>/', views.TuteurStagiaireDetailView.as_view(), name='tuteur-stagiaire-detail'),
    
    # Existing views (if any)
    # path('stages/', views.TuteurStagesView.as_view(), name='tuteur-stages'),
    # path('stages/<int:stage_id>/', views.TuteurStageDetailView.as_view(), name='tuteur-stage-detail'),
] 