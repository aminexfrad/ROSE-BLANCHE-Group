"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

app_name = 'demande_service'

urlpatterns = [
    # Public endpoints
    path('create/', views.DemandeCreateView.as_view(), name='create'),
    
    # RH endpoints (protected)
    path('', views.DemandeListView.as_view(), name='list'),
    path('<int:pk>/', views.DemandeDetailView.as_view(), name='detail'),
    path('<int:pk>/approve/', views.approve_demande, name='approve'),
    path('<int:pk>/reject/', views.reject_demande, name='reject'),
] 