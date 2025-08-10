"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from . import views

app_name = 'notification_service'

urlpatterns = [
    # User notification endpoints
    path('notifications/', views.get_user_notifications, name='get_user_notifications'),
    path('notifications/unread-count/', views.get_unread_count, name='get_unread_count'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/<int:notification_id>/delete/', views.delete_notification, name='delete_notification'),
    path('notifications/clear-all/', views.clear_all_notifications, name='clear_all_notifications'),
    path('notifications/statistics/', views.get_notification_statistics, name='get_notification_statistics'),
    path('notifications/search/', views.search_notifications, name='search_notifications'),
    
    # Role-based notification endpoints (admin/RH only)
    path('send-role-notification/', views.send_role_notification, name='send_role_notification'),
    path('send-broadcast/', views.send_broadcast_notification, name='send_broadcast_notification'),
    
    # System-wide notification management (admin only)
    path('system-stats/', views.get_system_notification_stats, name='get_system_notification_stats'),
]
