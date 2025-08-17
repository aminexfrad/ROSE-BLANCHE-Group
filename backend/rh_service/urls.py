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
    path('stagiaires/<int:pk>/assigner-tuteur/', views.RHAssignerTuteurView.as_view(), name='rh-assigner-tuteur'),
    path('stagiaires/<int:pk>/create-stage/', views.RHCreateStageForStagiaireView.as_view(), name='rh-create-stage'),
    

    
    # Stage management
    path('stages/', views.RHStagesView.as_view(), name='rh-stages'),
    path('stages/<int:pk>/', views.RHStageDetailView.as_view(), name='rh-stage-detail'),
    path('stages/<int:pk>/evaluations/', views.RHStageEvaluationsView.as_view(), name='rh-stage-evaluations'),
    
    # Testimonial management
    path('testimonials/', views.RHTestimonialsView.as_view(), name='rh-testimonials'),
    path('testimonials/<int:pk>/moderate/', views.RHTestimonialModerationView.as_view(), name='rh-testimonial-moderate'),
    path('testimonials/<int:pk>/approve/', views.RHTestimonialApprovalView.as_view(), name='rh-testimonial-approval'),
    path('testimonials/<int:pk>/reject/', views.RHTestimonialRejectionView.as_view(), name='rh-testimonial-rejection'),
    

    
    # Evaluations
    path('evaluations/', views.RHEvaluationsView.as_view(), name='rh-evaluations'),
    path('evaluations/<int:pk>/', views.RHEvaluationDetailView.as_view(), name='rh-evaluation-detail'),
    

    
    # Notifications
    path('notifications/', views.RHNotificationsView.as_view(), name='rh-notifications'),
    path('notifications/<int:pk>/read/', views.RHNotificationReadView.as_view(), name='rh-notification-read'),
    
    # Survey management
    path('surveys/', views.RHSurveyManagementView.as_view(), name='rh-surveys'),
    path('surveys/<int:pk>/', views.RHSurveyDetailView.as_view(), name='rh-survey-detail'),
    path('surveys/<int:pk>/action/', views.RHSurveyActionView.as_view(), name='rh-survey-action'),
    path('surveys/analysis/', views.RHSurveyAnalysisView.as_view(), name='rh-survey-analysis'),
] 