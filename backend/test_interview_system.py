#!/usr/bin/env python3
"""
Test script for the interview scheduling system
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande, Interview
from auth_service.models import User
from shared.utils import MailService

def test_interview_system():
    """Test the interview scheduling system"""
    
    print("🧪 Test du système d'entretien")
    print("=" * 60)
    
    # 1. Check if there are any demandes
    print("\n📋 Vérification des demandes:")
    
    total_demandes = Demande.objects.count()
    print(f"   - Total des demandes: {total_demandes}")
    
    pending_demandes = Demande.objects.filter(status='pending').count()
    print(f"   - Demandes en attente: {pending_demandes}")
    
    interview_scheduled_demandes = Demande.objects.filter(status='interview_scheduled').count()
    print(f"   - Demandes avec entretien planifié: {interview_scheduled_demandes}")
    
    # 2. Check if there are any interviews
    print(f"\n📅 Vérification des entretiens:")
    
    total_interviews = Interview.objects.count()
    print(f"   - Total des entretiens: {total_interviews}")
    
    # 3. Test creating an interview for a pending demande
    if pending_demandes > 0:
        print(f"\n🔧 Test de création d'un entretien:")
        
        # Get the first pending demande
        demande = Demande.objects.filter(status='pending').first()
        print(f"   - Demande sélectionnée: {demande.nom_complet}")
        
        # Get an RH user
        rh_user = User.objects.filter(role='rh').first()
        if not rh_user:
            print(f"   ⚠️ Aucun utilisateur RH trouvé")
            return False
        
        print(f"   - RH utilisateur: {rh_user.get_full_name()}")
        
        # Create interview
        interview_date = datetime.now().date() + timedelta(days=7)
        interview_time = datetime.strptime('14:00', '%H:%M').time()
        
        try:
            interview = Interview.objects.create(
                demande=demande,
                scheduled_by=rh_user,
                date=interview_date,
                time=interview_time,
                location="Salle de réunion A - Siège social",
                notes="Veuillez apporter votre CV et lettre de motivation"
            )
            
            print(f"   ✅ Entretien créé avec succès")
            print(f"      - ID: {interview.id}")
            print(f"      - Date: {interview.date}")
            print(f"      - Heure: {interview.time}")
            print(f"      - Lieu: {interview.location}")
            
            # Update demande status
            demande.status = 'interview_scheduled'
            demande.save(update_fields=['status'])
            print(f"   ✅ Statut de la demande mis à jour: {demande.status}")
            
            # Test email sending
            print(f"\n📧 Test d'envoi d'email:")
            try:
                email_sent = MailService.send_interview_notification(interview)
                if email_sent:
                    print(f"   ✅ Email envoyé avec succès à {demande.email}")
                else:
                    print(f"   ❌ Échec de l'envoi d'email")
            except Exception as e:
                print(f"   ❌ Erreur lors de l'envoi d'email: {e}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Erreur lors de la création de l'entretien: {e}")
            return False
    else:
        print(f"   ⚠️ Aucune demande en attente trouvée")
        return False

if __name__ == "__main__":
    test_interview_system()
