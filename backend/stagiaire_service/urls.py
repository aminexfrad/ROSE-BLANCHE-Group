"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Internship details
    path('internship/', views.InternshipView.as_view(), name='internship-detail'),
    path('internship/steps/', views.InternshipStepsView.as_view(), name='internship-steps'),
    path('internship/documents/', views.InternshipDocumentsView.as_view(), name='internship-documents'),
    path('internship/evaluations/', views.InternshipEvaluationsView.as_view(), name='internship-evaluations'),
    path('internship/testimonials/', views.InternshipTestimonialsView.as_view(), name='internship-testimonials'),
    path('internship/notifications/', views.InternshipNotificationsView.as_view(), name='internship-notifications'),
    
    # Step management
    path('steps/<int:pk>/', views.StepDetailView.as_view(), name='step-detail'),
    path('steps/<int:pk>/update/', views.StepUpdateView.as_view(), name='step-update'),
    
    # Document management
    path('documents/upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    
    # Evaluation management
    path('evaluations/create/', views.EvaluationCreateView.as_view(), name='evaluation-create'),
    path('evaluations/<int:pk>/', views.EvaluationDetailView.as_view(), name='evaluation-detail'),
    
    # Testimonial management
    path('testimonials/create/', views.TestimonialCreateView.as_view(), name='testimonial-create'),
    path('testimonials/<int:pk>/', views.TestimonialDetailView.as_view(), name='testimonial-detail'),
    

] 