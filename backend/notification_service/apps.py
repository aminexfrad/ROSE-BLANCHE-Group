"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.apps import AppConfig


class NotificationServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notification_service'
    verbose_name = 'Notification Service'

    def ready(self):
        import notification_service.signals
