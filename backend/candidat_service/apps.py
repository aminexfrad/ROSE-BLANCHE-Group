"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.apps import AppConfig


class CandidatServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'candidat_service'
    verbose_name = 'Service Candidat'
