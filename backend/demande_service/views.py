from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.core.files.base import ContentFile
import secrets
import string
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

from .models import Demande
from .serializers import (
    DemandeSerializer, DemandeListSerializer, DemandeDetailSerializer,
    DemandeApprovalSerializer
)
from auth_service.models import User


class DemandeCreateView(generics.CreateAPIView):
    """Public endpoint for submitting demande de stage"""
    serializer_class = DemandeSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        demande = serializer.save()
        
        # Generate PDF summary
        pdf_content = self.generate_pdf_summary(demande)
        
        # Send email notification to RH with PDF and attachments
        self.send_rh_notification(demande, pdf_content)
    
    def generate_pdf_summary(self, demande):
        """Generate a formatted PDF summary of the demande in the modern layout"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=20,
            alignment=TA_LEFT,
            textColor=colors.black,
            fontName='Helvetica-Bold'
        )
        ref_style = ParagraphStyle(
            'RefStyle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.black,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        section_header = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#b71c3a'),
            alignment=TA_CENTER,
            fontName='Helvetica-BoldOblique',
            spaceAfter=8,
            spaceBefore=16
        )
        normal_style = styles['Normal']
        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            leftIndent=16,
            bulletIndent=8,
            spaceAfter=2
        )

        # Data mapping (use placeholders if missing)
        ref = demande.pfe_reference or demande.reference or 'REF / ...'
        title = getattr(demande, 'pfe_title', None) or getattr(demande, 'sujet', None) or 'Titre du projet'
        description = getattr(demande, 'description', None) or 'Description non fournie.'
        objectifs = getattr(demande, 'objectifs', None) or '- Objectif 1\n- Objectif 2'
        keywords = getattr(demande, 'keywords', None) or 'Mots clés non fournis.'
        diplome = getattr(demande, 'diplome', None) or "Diplôme d'Ingénieur"
        specialite = demande.specialite or 'Spécialité'
        nombre_postes = getattr(demande, 'nombre_postes', None) or '1'
        ville = getattr(demande, 'ville', None) or 'Sousse'

        # Left column (simulate with a table)
        left_data = [
            [Paragraph('<b>%s</b>' % diplome, normal_style)],
            [Paragraph('<b>%s</b>' % specialite, normal_style)],
            [Paragraph('<b>%s</b>' % nombre_postes, normal_style)],
            [Paragraph('<b>%s</b>' % ville, normal_style)],
        ]
        left_table = Table(left_data, colWidths=[1.8*inch], rowHeights=0.5*inch)
        left_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        # Main content
        story = []
        # Top: Reference and Title
        story.append(Paragraph(ref, ref_style))
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 10))

        # Two-column layout: left (table), right (content)
        # We'll use a table with two columns
        main_data = [
            [left_table, '']
        ]
        main_table = Table(main_data, colWidths=[2*inch, 4.5*inch])
        main_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(main_table)
        story.append(Spacer(1, 20))

        # Description section
        story.append(Paragraph('Description', section_header))
        story.append(Paragraph(description, normal_style))
        story.append(Spacer(1, 10))

        # Objectifs section
        story.append(Paragraph('Objectifs', section_header))
        # Support both string and list for objectifs
        if isinstance(objectifs, str):
            objectifs_list = [o.strip('- ') for o in objectifs.split('\n') if o.strip()]
        else:
            objectifs_list = objectifs
        for obj in objectifs_list:
            story.append(Paragraph(f'• {obj}', bullet_style))
        story.append(Spacer(1, 10))

        # Mots clés section
        story.append(Paragraph('Mots clés', section_header))
        story.append(Paragraph(keywords, normal_style))

        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"Généré le {demande.created_at.strftime('%d/%m/%Y à %H:%M')}", normal_style))

        # Build PDF
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        return pdf_content
    
    def send_rh_notification(self, demande, pdf_content):
        """Send email notification to RH with PDF summary and attachments"""
        try:
            subject = f'Nouvelle demande de stage - {demande.nom_complet}'
            
            context = {
                'demande': demande,
                'site_url': settings.SITE_URL if hasattr(settings, 'SITE_URL') else 'http://localhost:8000'
            }
            
            html_message = render_to_string('emails/new_demande_rh.html', context)
            plain_message = render_to_string('emails/new_demande_rh.txt', context)
            
            # Get RH users
            rh_users = User.objects.filter(role='rh', is_active=True)
            rh_emails = [user.email for user in rh_users]
            
            if rh_emails:
                # Create email with attachments
                email = EmailMessage(
                    subject=subject,
                    body=html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=rh_emails,
                )
                email.content_subtype = "html"
                
                # Attach PDF summary
                email.attach(
                    f'resume_demande_{demande.id}.pdf',
                    pdf_content,
                    'application/pdf'
                )
                
                # Attach candidate documents
                if demande.cv:
                    email.attach_file(demande.cv.path)
                if demande.lettre_motivation:
                    email.attach_file(demande.lettre_motivation.path)
                if demande.demande_stage:
                    email.attach_file(demande.demande_stage.path)
                
                # Attach binôme documents if applicable
                if demande.stage_binome:
                    if demande.cv_binome:
                        email.attach_file(demande.cv_binome.path)
                    if demande.lettre_motivation_binome:
                        email.attach_file(demande.lettre_motivation_binome.path)
                    if demande.demande_stage_binome:
                        email.attach_file(demande.demande_stage_binome.path)
                
                email.send()
                
        except Exception as e:
            print(f"Error sending RH notification: {e}")


class DemandeListView(generics.ListAPIView):
    """List demandes (RH view)"""
    serializer_class = DemandeListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type_stage', 'niveau', 'institut']
    search_fields = ['nom', 'prenom', 'email', 'institut', 'specialite', 'pfe_reference']
    ordering_fields = ['created_at', 'date_debut', 'date_fin']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only RH and admin can view all demandes
        if self.request.user.role in ['rh', 'admin']:
            return Demande.objects.all()
        return Demande.objects.none()


class DemandeDetailView(generics.RetrieveAPIView):
    """Get detailed demande information"""
    serializer_class = DemandeDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = Demande.objects.all()
    
    def get_queryset(self):
        # Only RH and admin can view demande details
        if self.request.user.role in ['rh', 'admin']:
            return Demande.objects.all()
        return Demande.objects.none()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_demande(request, pk):
    """Approve a demande and create user account"""
    if request.user.role not in ['rh', 'admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    demande = get_object_or_404(Demande, pk=pk)
    
    if demande.status != Demande.Status.PENDING:
        return Response(
            {'error': 'Cette demande a déjà été traitée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate password
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    try:
        # Create user account
        user = User.objects.create_user(
            email=demande.email,
            password=password,
            nom=demande.nom,
            prenom=demande.prenom,
            telephone=demande.telephone,
            institut=demande.institut,
            specialite=demande.specialite,
            role='stagiaire'
        )
        
        # Approve demande
        demande.approve(user_created=user)
        
        # Send acceptance email
        send_acceptance_email(demande, password)
        
        return Response({
            'message': 'Demande approuvée avec succès',
            'user_created': {
                'id': user.id,
                'email': user.email,
                'password': password
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de l\'approbation: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_demande(request, pk):
    """Reject a demande"""
    if request.user.role not in ['rh', 'admin']:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = DemandeApprovalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    demande = get_object_or_404(Demande, pk=pk)
    
    if demande.status != Demande.Status.PENDING:
        return Response(
            {'error': 'Cette demande a déjà été traitée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Reject demande
        demande.reject(raison=serializer.validated_data.get('raison'))
        
        # Send rejection email
        send_rejection_email(demande, serializer.validated_data.get('raison'))
        
        return Response({
            'message': 'Demande rejetée avec succès'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du rejet: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def send_acceptance_email(demande, password):
    """Send acceptance email to candidate"""
    try:
        subject = 'Félicitations ! Votre demande de stage a été acceptée'
        
        context = {
            'demande': demande,
            'password': password,
            'site_url': settings.SITE_URL if hasattr(settings, 'SITE_URL') else 'http://localhost:3000'
        }
        
        html_message = render_to_string('emails/demande_accepted.html', context)
        plain_message = render_to_string('emails/demande_accepted.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[demande.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending acceptance email: {e}")


def send_rejection_email(demande, raison):
    """Send rejection email to candidate"""
    try:
        subject = 'Réponse à votre demande de stage'
        
        context = {
            'demande': demande,
            'raison': raison,
            'site_url': settings.SITE_URL if hasattr(settings, 'SITE_URL') else 'http://localhost:3000'
        }
        
        html_message = render_to_string('emails/demande_rejected.html', context)
        plain_message = render_to_string('emails/demande_rejected.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[demande.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending rejection email: {e}")
