"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

app_name = 'notification_service'

urlpatterns = [
    # Notification events
    path('events/', views.NotificationEventListView.as_view(), name='events'),
    
    # Notification templates
    path('templates/', views.NotificationTemplateListView.as_view(), name='templates'),
    path('templates/<int:pk>/', views.NotificationTemplateDetailView.as_view(), name='template-detail'),
    
    # WebSocket connections
    path('connections/', views.WebSocketConnectionListView.as_view(), name='connections'),
    
    # Test and broadcast endpoints
    path('test/', views.send_test_notification, name='test-notification'),
    path('broadcast/', views.send_broadcast_message, name='broadcast'),
    
    # Statistics
    path('stats/', views.notification_stats, name='stats'),
]
