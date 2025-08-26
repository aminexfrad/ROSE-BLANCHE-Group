"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder
import json

User = get_user_model()


class NotificationEvent(models.Model):
    """
    Model to track notification events for real-time processing
    """
    class EventType(models.TextChoices):
        SYSTEM = 'system', _('System Event')
        USER_ACTION = 'user_action', _('User Action')
        STAGE_UPDATE = 'stage_update', _('Stage Update')
        DOCUMENT_UPLOAD = 'document_upload', _('Document Upload')
        EVALUATION = 'evaluation', _('Evaluation')
        SURVEY = 'survey', _('Survey')
        TESTIMONIAL = 'testimonial', _('Testimonial')
        DEMANDE = 'demande', _('Demande')
        KPI_ALERT = 'kpi_alert', _('KPI Alert')

    event_type = models.CharField(
        _('type d\'événement'),
        max_length=20,
        choices=EventType.choices
    )
    event_data = models.JSONField(
        _('données de l\'événement'),
        encoder=DjangoJSONEncoder,
        default=dict
    )
    source_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_events'
    )
    target_users = models.ManyToManyField(
        User,
        related_name='targeted_events',
        blank=True
    )
    processed = models.BooleanField(_('traité'), default=False)
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    processed_at = models.DateTimeField(_('date de traitement'), null=True, blank=True)

    class Meta:
        verbose_name = _('événement de notification')
        verbose_name_plural = _('événements de notification')
        db_table = 'notification_event'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} - {self.created_at}"

    def mark_processed(self):
        """Mark event as processed"""
        self.processed = True
        self.processed_at = timezone.now()
        self.save()


class NotificationTemplate(models.Model):
    """
    Template for generating notifications
    """
    name = models.CharField(_('nom'), max_length=100, unique=True)
    title_template = models.CharField(_('modèle de titre'), max_length=200)
    message_template = models.TextField(_('modèle de message'))
    notification_type = models.CharField(
        _('type de notification'),
        max_length=10,
        choices=[
            ('info', _('Information')),
            ('success', _('Succès')),
            ('warning', _('Avertissement')),
            ('error', _('Erreur')),
        ],
        default='info'
    )
    is_active = models.BooleanField(_('actif'), default=True)
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('date de modification'), auto_now=True)

    class Meta:
        verbose_name = _('modèle de notification')
        verbose_name_plural = _('modèles de notification')
        db_table = 'notification_template'

    def __str__(self):
        return self.name

    def render(self, context_data):
        """Render template with context data"""
        try:
            title = self.title_template.format(**context_data)
            message = self.message_template.format(**context_data)
            return title, message
        except KeyError as e:
            # Fallback to template as-is if context is missing
            return self.title_template, self.message_template


class WebSocketConnection(models.Model):
    """
    Track active WebSocket connections
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websocket_connections')
    connection_id = models.CharField(_('ID de connexion'), max_length=191, unique=True)
    is_active = models.BooleanField(_('actif'), default=True)
    last_activity = models.DateTimeField(_('dernière activité'), auto_now=True)
    created_at = models.DateTimeField(_('date de création'), auto_now_add=True)

    class Meta:
        verbose_name = _('connexion WebSocket')
        verbose_name_plural = _('connexions WebSocket')
        db_table = 'websocket_connection'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.connection_id}"

    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])

    def deactivate(self):
        """Deactivate connection"""
        self.is_active = False
        self.save(update_fields=['is_active'])
