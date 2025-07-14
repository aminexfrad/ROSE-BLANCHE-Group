"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Stagiaire management
    path('stagiaires/', views.RHStagiairesView.as_view(), name='rh-stagiaires'),
    path('stagiaires/<int:pk>/', views.RHStagiaireDetailView.as_view(), name='rh-stagiaire-detail'),
    path('stagiaires/<int:pk>/stages/', views.RHStagiaireStagesView.as_view(), name='rh-stagiaire-stages'),
    
    # Tuteur assignment
    path('tuteurs-disponibles/', views.RHTuteursDisponiblesView.as_view(), name='rh-tuteurs-disponibles'),
    path('stagiaires/<int:stagiaire_id>/assigner-tuteur/', views.RHAssignerTuteurView.as_view(), name='rh-assigner-tuteur'),
    
    # Stagiaire creation
    path('creer-stagiaire/', views.RHCreerStagiaireView.as_view(), name='rh-creer-stagiaire'),
    
    # Stage management
    path('stages/', views.RHStagesView.as_view(), name='rh-stages'),
    path('stages/<int:pk>/', views.RHStageDetailView.as_view(), name='rh-stage-detail'),
    path('stages/<int:pk>/evaluations/', views.RHStageEvaluationsView.as_view(), name='rh-stage-evaluations'),
    
    # Testimonial management
    path('testimonials/', views.RHTestimonialsView.as_view(), name='rh-testimonials'),
    path('testimonials/<int:pk>/moderate/', views.RHTestimonialModerationView.as_view(), name='rh-testimonial-moderate'),
    path('testimonials/<int:pk>/approve/', views.RHTestimonialApprovalView.as_view(), name='rh-testimonial-approval'),
    path('testimonials/<int:pk>/reject/', views.RHTestimonialRejectionView.as_view(), name='rh-testimonial-rejection'),
    
    # KPI and statistics
    path('kpi-globaux/', views.RHKPIGlobauxView.as_view(), name='rh-kpi-globaux'),
    path('statistiques/', views.RHStatistiquesView.as_view(), name='rh-statistiques'),
    path('statistiques/export/', views.RHStatistiquesExportView.as_view(), name='rh-statistiques-export'),
    
    # Evaluations
    path('evaluations/', views.RHEvaluationsView.as_view(), name='rh-evaluations'),
    path('evaluations/<int:pk>/', views.RHEvaluationDetailView.as_view(), name='rh-evaluation-detail'),
    
    # Reports
    path('rapports/', views.RHReportsView.as_view(), name='rh-reports'),
    path('rapports/generate/', views.RHReportGenerationView.as_view(), name='rh-report-generation'),
    path('rapports/<str:report_type>/', views.RHReportDownloadView.as_view(), name='rh-report-download'),
    
    # Notifications
    path('notifications/', views.RHNotificationsView.as_view(), name='rh-notifications'),
    path('notifications/<int:pk>/read/', views.RHNotificationReadView.as_view(), name='rh-notification-read'),
] 