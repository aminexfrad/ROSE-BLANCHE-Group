"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import logging
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from typing import List, Optional, Dict, Any
import traceback

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        # Unhandled error, return JSON instead of HTML
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return response


class MailService:
    """
    Centralized mail service for sending emails via Mailtrap SMTP.
    Handles both HTML and plain text emails with proper error handling.
    """
    
    @staticmethod
    def send_email(
        subject: str,
        recipient_list: List[str],
        template_name: str,
        context: Dict[str, Any],
        html_template_name: Optional[str] = None,
        from_email: Optional[str] = None,
        fail_silently: bool = False,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """
        Send an email using Django's email backend.
        
        Args:
            subject: Email subject
            recipient_list: List of recipient email addresses
            template_name: Path to the plain text template
            context: Template context variables
            html_template_name: Path to the HTML template (optional)
            from_email: Sender email address (defaults to settings.DEFAULT_FROM_EMAIL)
            fail_silently: Whether to suppress exceptions
            attachments: List of attachment dictionaries with 'filename', 'content', 'content_type' keys
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Validate inputs
            if not subject or not recipient_list or not template_name:
                logger.error("Missing required email parameters")
                return False
            
            # Validate email addresses
            from shared.security import SecurityValidator
            validated_recipients = []
            for email in recipient_list:
                try:
                    validated_email = SecurityValidator.validate_email(email)
                    validated_recipients.append(validated_email)
                except ValidationError as e:
                    logger.error(f"Invalid email address: {email} - {e}")
                    continue
            
            if not validated_recipients:
                logger.error("No valid email addresses provided")
                return False
            
            # Set default from email
            if not from_email:
                from_email = settings.DEFAULT_FROM_EMAIL
            
            # Render templates
            plain_message = render_to_string(template_name, context)
            html_message = None
            if html_template_name:
                html_message = render_to_string(html_template_name, context)
            
            # Create email message
            if attachments:
                # Use EmailMessage for attachments
                email = EmailMessage(
                    subject=subject,
                    body=html_message or plain_message,
                    from_email=from_email,
                    to=validated_recipients,
                )
                
                if html_message:
                    email.content_subtype = "html"
                
                # Add attachments
                for attachment in attachments:
                    if isinstance(attachment, dict) and all(k in attachment for k in ['filename', 'content', 'content_type']):
                        email.attach(
                            attachment['filename'],
                            attachment['content'],
                            attachment['content_type']
                        )
                
                email.send()
            else:
                # Use send_mail for simple emails
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=from_email,
                    recipient_list=validated_recipients,
                    html_message=html_message,
                    fail_silently=fail_silently,
                )
            
            logger.info(f"Email sent successfully to {validated_recipients}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
            if not fail_silently:
                raise
            return False
    
    @staticmethod
    def send_acceptance_email(demande, password: str) -> bool:
        """
        Send acceptance email to candidate.
        
        Args:
            demande: Demande object
            password: Generated password for the new user account
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = 'Félicitations ! Votre demande de stage a été acceptée'
        
        context = {
            'demande': demande,
            'password': password,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
        }
        
        return MailService.send_email(
            subject=subject,
            recipient_list=[demande.email],
            template_name='emails/demande_accepted.txt',
            context=context,
            html_template_name='emails/demande_accepted.html'
        )
    
    @staticmethod
    def send_rejection_email(demande, raison: str) -> bool:
        """
        Send rejection email to candidate.
        
        Args:
            demande: Demande object
            raison: Reason for rejection
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = 'Réponse à votre demande de stage'
        
        context = {
            'demande': demande,
            'raison': raison,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
        }
        
        return MailService.send_email(
            subject=subject,
            recipient_list=[demande.email],
            template_name='emails/demande_rejected.txt',
            context=context,
            html_template_name='emails/demande_rejected.html'
        )
    
    @staticmethod
    def send_rh_notification(demande, pdf_content: bytes = None, attachments: List[Dict] = None) -> bool:
        """
        Send notification email to RH team about new demande.
        
        Args:
            demande: Demande object
            pdf_content: PDF summary content (optional)
            attachments: List of attachment files (optional)
            
        Returns:
            bool: True if email was sent successfully
        """
        from auth_service.models import User
        
        subject = f'Nouvelle demande de stage - {demande.nom_complet}'
        
        context = {
            'demande': demande,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000')
        }
        
        # Get RH users
        rh_users = User.objects.filter(role='rh', is_active=True)
        rh_emails = [user.email for user in rh_users]
        
        if not rh_emails:
            logger.warning("No RH users found to send notification to")
            return False
        
        # Prepare attachments
        email_attachments = []
        
        # Add PDF summary if provided
        if pdf_content:
            email_attachments.append({
                'filename': f'resume_demande_{demande.id}.pdf',
                'content': pdf_content,
                'content_type': 'application/pdf'
            })
        
        # Add file attachments if provided
        if attachments:
            email_attachments.extend(attachments)
        
        return MailService.send_email(
            subject=subject,
            recipient_list=rh_emails,
            template_name='emails/new_demande_rh.txt',
            context=context,
            html_template_name='emails/new_demande_rh.html',
            attachments=email_attachments if email_attachments else None
        )
    
    @staticmethod
    def test_email_configuration() -> bool:
        """
        Test email configuration by sending a test email.
        
        Returns:
            bool: True if test email was sent successfully
        """
        try:
            test_subject = 'Test Email Configuration - StageBloom'
            test_message = 'This is a test email to verify the email configuration is working properly.'
            
            send_mail(
                subject=test_subject,
                message=test_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],  # Send to self for testing
                fail_silently=False,
            )
            
            logger.info("Email configuration test successful")
            return True
            
        except Exception as e:
            logger.error(f"Email configuration test failed: {str(e)}")
            return False


class FileUploadValidator:
    """
    Utility class for validating file uploads.
    """
    
    @staticmethod
    def validate_file(file_obj, allowed_types: List[str] = None, max_size: int = None) -> bool:
        """
        Validate file upload with security checks.
        
        Args:
            file_obj: File object to validate
            allowed_types: List of allowed MIME types
            max_size: Maximum file size in bytes
            
        Returns:
            bool: True if file is valid
            
        Raises:
            ValidationError: If file is invalid
        """
        from shared.security import SecurityValidator
        
        if not file_obj:
            return True
        
        # Use security validator
        return SecurityValidator.validate_file_upload(file_obj, allowed_types, max_size)
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """
        Get file extension from filename.
        
        Args:
            filename: Filename to extract extension from
            
        Returns:
            str: File extension (lowercase)
        """
        if not filename:
            return ""
        
        return filename.lower().split('.')[-1] if '.' in filename else ""
    
    @staticmethod
    def is_safe_filename(filename: str) -> bool:
        """
        Check if filename is safe (no path traversal, etc.).
        
        Args:
            filename: Filename to check
            
        Returns:
            bool: True if filename is safe
        """
        import os
        
        # Check for path traversal attempts
        dangerous_patterns = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
        
        for pattern in dangerous_patterns:
            if pattern in filename:
                return False
        
        # Check if filename is too long
        if len(filename) > 255:
            return False
        
        # Check if filename is empty or only whitespace
        if not filename.strip():
            return False
        
        return True


class RateLimitDecorator:
    """
    Decorator for rate limiting API endpoints.
    """
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    def __call__(self, func):
        def wrapper(request, *args, **kwargs):
            from shared.security import rate_limiter
            
            # Get client IP
            client_ip = self._get_client_ip(request)
            
            # Check rate limit
            if not rate_limiter.is_allowed(client_ip, self.max_requests, self.window_seconds):
                return Response(
                    {'error': 'Trop de requêtes. Veuillez réessayer plus tard.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            return func(request, *args, **kwargs)
        
        return wrapper
    
    def _get_client_ip(self, request):
        """
        Get client IP address from request.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 

    @staticmethod
    def send_testimonial_submission_notification(testimonial) -> bool:
        """
        Send notification to RH team about new testimonial submission.
        
        Args:
            testimonial: Testimonial object
            
        Returns:
            bool: True if email was sent successfully
        """
        from auth_service.models import User
        
        subject = f'Nouveau témoignage soumis - {testimonial.author.get_full_name()}'
        
        context = {
            'testimonial': testimonial,
            'author': testimonial.author,
            'stage': testimonial.stage,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
        }
        
        # Get RH users
        rh_users = User.objects.filter(role='rh', is_active=True)
        rh_emails = [user.email for user in rh_users]
        
        if not rh_emails:
            logger.warning("No RH users found to send testimonial notification to")
            return False
        
        return MailService.send_email(
            subject=subject,
            recipient_list=rh_emails,
            template_name='emails/new_testimonial_rh.txt',
            context=context,
            html_template_name='emails/new_testimonial_rh.html'
        )
    
    @staticmethod
    def send_testimonial_approval_notification(testimonial) -> bool:
        """
        Send approval notification to testimonial author.
        
        Args:
            testimonial: Testimonial object
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = 'Votre témoignage a été approuvé'
        
        context = {
            'testimonial': testimonial,
            'author': testimonial.author,
            'moderator': testimonial.moderated_by,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
        }
        
        return MailService.send_email(
            subject=subject,
            recipient_list=[testimonial.author.email],
            template_name='emails/testimonial_approved.txt',
            context=context,
            html_template_name='emails/testimonial_approved.html'
        )
    
    @staticmethod
    def send_testimonial_rejection_notification(testimonial) -> bool:
        """
        Send rejection notification to testimonial author.
        
        Args:
            testimonial: Testimonial object
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = 'Votre témoignage nécessite des modifications'
        
        context = {
            'testimonial': testimonial,
            'author': testimonial.author,
            'moderator': testimonial.moderated_by,
            'moderation_comment': testimonial.moderation_comment,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000')
        }
        
        return MailService.send_email(
            subject=subject,
            recipient_list=[testimonial.author.email],
            template_name='emails/testimonial_rejected.txt',
            context=context,
            html_template_name='emails/testimonial_rejected.html'
        ) 