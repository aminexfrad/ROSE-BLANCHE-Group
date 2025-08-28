"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.apps import AppConfig


class RhServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rh_service'
    verbose_name = 'Service RH'
    
    def ready(self):
        """Configuration à l'initialisation de l'application"""
        try:
            import rh_service.signals  # noqa
        except ImportError:
            pass
