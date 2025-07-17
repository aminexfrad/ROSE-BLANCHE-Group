"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.urls import path
from .views import (
    AdminDashboardView, 
    AdminDatabaseStatsView, 
    AdminDatabaseBackupView
)

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('database/stats/', AdminDatabaseStatsView.as_view(), name='admin-database-stats'),
    path('database/backup/', AdminDatabaseBackupView.as_view(), name='admin-database-backup'),
] 