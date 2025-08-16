"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

app_name = 'candidat_service'

urlpatterns = [
    # Public endpoints
    path('offres/', views.public_offres_list, name='public_offres_list'),
    path('offres/<int:offre_id>/', views.public_offre_detail, name='public_offre_detail'),
    
    # Authentication
    path('register/', views.CandidatRegistrationView.as_view(), name='candidat_register'),
    path('login/', views.CandidatLoginView.as_view(), name='candidat_login'),
    
    # Candidate profile and dashboard
    path('profile/', views.CandidatProfileView.as_view(), name='candidat_profile'),
    path('dashboard/', views.CandidatDashboardView.as_view(), name='candidat_dashboard'),
    path('demandes/', views.CandidatDemandesView.as_view(), name='candidat_demandes'),
    path('status/', views.check_candidat_status, name='check_candidat_status'),
    
    # Candidature management
    path('candidatures/', views.CandidatCandidaturesView.as_view(), name='candidat_candidatures'),
    path('candidatures/create/', views.CandidatCandidatureCreateView.as_view(), name='candidat_candidature_create'),
    path('candidatures/<int:candidature_id>/', views.CandidatCandidatureDetailView.as_view(), name='candidat_candidature_detail'),
]
