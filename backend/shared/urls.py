"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Root API endpoint
    path('', views.APIRootView.as_view(), name='api-root'),
    
    # Dashboard and stats
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats-alt'),
    path('users/', views.UsersListView.as_view(), name='users-list'),
    
    # Stages
    path('stages/', views.StagesListView.as_view(), name='stages-list'),
    path('stages/<int:pk>/', views.StageDetailView.as_view(), name='stage-detail'),
    path('stages/my-internship/', views.MyInternshipView.as_view(), name='my-internship'),
    
    # Steps
    path('steps/', views.StepsListView.as_view(), name='steps-list'),
    path('steps/<int:pk>/', views.StepDetailView.as_view(), name='step-detail'),
    
    # Documents
    path('documents/', views.DocumentsListView.as_view(), name='documents-list'),
    path('documents/upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    
    # Evaluations and KPI
    path('evaluations/', views.EvaluationsListView.as_view(), name='evaluations-list'),
    path('evaluations/create/', views.EvaluationCreateView.as_view(), name='evaluation-create'),
    path('kpi-questions/', views.KPIQuestionsListView.as_view(), name='kpi-questions-list'),
    
    # Testimonials
    path('testimonials/', views.TestimonialsListView.as_view(), name='testimonials-list'),
    path('testimonials/create/', views.TestimonialCreateView.as_view(), name='testimonial-create'),
    path('testimonials/<int:pk>/moderate/', views.TestimonialModerationView.as_view(), name='testimonial-moderate'),
    path('testimonials/<int:pk>/update/', views.TestimonialUpdateView.as_view(), name='testimonial-update'),
    path('public/testimonials/', views.PublicTestimonialsView.as_view(), name='public-testimonials'),
    
    # Notifications
    path('notifications/', views.NotificationsListView.as_view(), name='notifications-list'),
    path('notifications/<int:pk>/read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', views.NotificationsMarkAllReadView.as_view(), name='notifications-mark-all-read'),
    
    # PFE Documents
    path('pfe-documents/', views.PFEDocumentsListView.as_view(), name='pfe-documents-list'),
    path('pfe-documents/<int:pk>/', views.PFEDocumentDetailView.as_view(), name='pfe-document-detail'),
    path('pfe-documents/create/', views.PFEDocumentCreateView.as_view(), name='pfe-document-create'),
    path('pfe-documents/<int:pk>/update/', views.PFEDocumentUpdateView.as_view(), name='pfe-document-update'),
    
    # Offres de Stage (Internship Offers)
    path('offres-stage/', views.OffreStageListView.as_view(), name='offres-stage-list'),
    path('offres-stage/<int:offre_id>/', views.OffreStageDetailView.as_view(), name='offre-stage-detail'),
    path('offres-stage/create/', views.OffreStageCreateView.as_view(), name='offre-stage-create'),
    path('offres-stage/<int:offre_id>/update/', views.OffreStageUpdateView.as_view(), name='offre-stage-update'),
    path('offres-stage/<int:offre_id>/delete/', views.OffreStageDeleteView.as_view(), name='offre-stage-delete'),
    path('offres-stage/<int:offre_id>/apply/', views.OffreStageApplyView.as_view(), name='offre-stage-apply'),
    
    # PFE Projects

    # PFE Reports
    path('pfe-reports/', views.PFEReportsListView.as_view(), name='pfe-reports-list'),
    path('pfe-reports/<int:pk>/', views.PFEReportDetailView.as_view(), name='pfe-report-detail'),
    path('pfe-reports/create/', views.PFEReportCreateView.as_view(), name='pfe-report-create'),
    path('pfe-reports/<int:pk>/update/', views.PFEReportUpdateView.as_view(), name='pfe-report-update'),
    path('pfe-reports/<int:pk>/submit/', views.PFEReportSubmitView.as_view(), name='pfe-report-submit'),
    path('pfe-reports/<int:pk>/validate/', views.PFEReportValidationView.as_view(), name='pfe-report-validate'),
    path('pfe-reports/<int:pk>/archive/', views.PFEReportArchiveView.as_view(), name='pfe-report-archive'),
    path('pfe-reports/<int:pk>/download/', views.PFEReportDownloadView.as_view(), name='pfe-report-download'),

] 