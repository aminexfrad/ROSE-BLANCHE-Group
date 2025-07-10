import logging
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)


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
                    to=recipient_list,
                )
                
                if html_message:
                    email.content_subtype = "html"
                
                # Add attachments
                for attachment in attachments:
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
                    recipient_list=recipient_list,
                    html_message=html_message,
                    fail_silently=fail_silently,
                )
            
            logger.info(f"Email sent successfully to {recipient_list}")
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