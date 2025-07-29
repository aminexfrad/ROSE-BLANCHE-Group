#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.

Test script for PFE Digital Hub module
"""

import os
import sys
import django
from django.utils import timezone
from datetime import date

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from auth_service.models import User
from demande_service.models import Demande
from shared.models import Stage, PFEReport, Notification

def create_test_data():
    """Create test data for PFE Digital Hub"""
    print("🔧 Creating test data for PFE Digital Hub...")
    
    # Create test users
    stagiaire, created = User.objects.get_or_create(
        email='stagiaire.pfe@test.com',
        defaults={
            'nom': 'Dupont',
            'prenom': 'Jean',
            'role': 'stagiaire',
            'institut': 'École Test',
            'specialite': 'Informatique',
            'telephone': '0123456789',
            'cin': 'AB123456',
            'is_active': True
        }
    )
    
    tuteur, created = User.objects.get_or_create(
        email='tuteur.pfe@test.com',
        defaults={
            'nom': 'Martin',
            'prenom': 'Pierre',
            'role': 'tuteur',
            'departement': 'Informatique',
            'telephone': '0987654321',
            'cin': 'CD789012',
            'is_active': True
        }
    )
    
    # Create test demande
    demande, created = Demande.objects.get_or_create(
        email='stagiaire.pfe@test.com',
        defaults={
            'nom': 'Dupont',
            'prenom': 'Jean',
            'telephone': '0123456789',
            'cin': 'AB123456',
            'institut': 'École Test',
            'specialite': 'Informatique',
            'type_stage': 'Stage PFE',
            'niveau': 'Master',
            'date_debut': date(2024, 9, 1),
            'date_fin': date(2025, 6, 30),
            'status': 'approved'
        }
    )
    
    # Create test stage
    stage, created = Stage.objects.get_or_create(
        demande=demande,
        defaults={
            'stagiaire': stagiaire,
            'tuteur': tuteur,
            'title': 'Développement d\'une application web moderne',
            'description': 'Projet de fin d\'études en développement web',
            'company': 'Entreprise Test',
            'location': 'Paris',
            'start_date': date(2024, 9, 1),
            'end_date': date(2025, 6, 30),
            'status': 'active',
            'progress': 75
        }
    )
    
    print(f"✅ Created test stage: {stage.title}")
    print(f"   Stagiaire: {stagiaire.get_full_name()}")
    print(f"   Tuteur: {tuteur.get_full_name()}")
    
    return stagiaire, tuteur, stage

def test_pfe_report_workflow():
    """Test the complete PFE report workflow"""
    print("\n🧪 Testing PFE report workflow...")
    
    stagiaire, tuteur, stage = create_test_data()
    
    # Create a PFE report
    report = PFEReport.objects.create(
        stage=stage,
        stagiaire=stagiaire,
        tuteur=tuteur,
        title="Développement d'une application web moderne avec React et Django",
        abstract="Ce projet présente le développement d'une application web complète utilisant React pour le frontend et Django pour le backend. L'application inclut des fonctionnalités d'authentification, de gestion de données et d'interface utilisateur moderne.",
        keywords="React, Django, Web Development, Full-Stack, JavaScript, Python",
        speciality="Informatique",
        year=2025,
        status='draft',
        version=1
    )
    
    print(f"✅ Created PFE report: {report.title}")
    print(f"   Status: {report.status}")
    print(f"   Version: {report.version}")
    
    # Test submission
    print("\n📤 Testing report submission...")
    report.submit()
    print(f"✅ Report submitted at: {report.submitted_at}")
    print(f"   New status: {report.status}")
    
    # Check if notification was created
    notifications = Notification.objects.filter(
        recipient=tuteur,
        title__icontains="Nouveau rapport PFE"
    )
    print(f"✅ Notifications created: {notifications.count()}")
    
    # Test approval
    print("\n✅ Testing report approval...")
    feedback = "Excellent travail ! Le rapport est bien structuré et présente clairement les objectifs et réalisations du projet. La documentation est complète et le code est bien organisé."
    report.approve(feedback)
    print(f"✅ Report approved at: {report.approved_at}")
    print(f"   New status: {report.status}")
    print(f"   Feedback: {report.tuteur_feedback}")
    
    # Check if approval notification was created
    approval_notifications = Notification.objects.filter(
        recipient=stagiaire,
        title__icontains="Rapport PFE approuvé"
    )
    print(f"✅ Approval notifications created: {approval_notifications.count()}")
    
    # Test archiving
    print("\n📦 Testing report archiving...")
    report.archive()
    print(f"✅ Report archived at: {report.archived_at}")
    print(f"   Final status: {report.status}")
    
    # Test statistics
    print("\n📊 Testing statistics...")
    report.increment_view_count()
    report.increment_download_count()
    print(f"✅ View count: {report.view_count}")
    print(f"✅ Download count: {report.download_count}")
    
    return report

def test_rejection_workflow():
    """Test the rejection workflow"""
    print("\n❌ Testing rejection workflow...")
    
    stagiaire, tuteur, stage = create_test_data()
    
    # Create another report for rejection test
    report = PFEReport.objects.create(
        stage=stage,
        stagiaire=stagiaire,
        tuteur=tuteur,
        title="Projet PFE à corriger",
        abstract="Ce rapport nécessite des corrections importantes.",
        keywords="Test, Correction, Amélioration",
        speciality="Informatique",
        year=2025,
        status='submitted',
        version=1
    )
    
    print(f"✅ Created test report for rejection: {report.title}")
    
    # Test rejection
    rejection_reason = "Le rapport nécessite plusieurs corrections : 1) La méthodologie n'est pas assez détaillée, 2) Les résultats ne sont pas suffisamment analysés, 3) La bibliographie est incomplète. Veuillez corriger ces points et resoumettre."
    report.reject(rejection_reason)
    
    print(f"✅ Report rejected at: {report.reviewed_at}")
    print(f"   New status: {report.status}")
    print(f"   Rejection reason: {report.rejection_reason}")
    
    # Check if rejection notification was created
    rejection_notifications = Notification.objects.filter(
        recipient=stagiaire,
        title__icontains="Rapport PFE rejeté"
    )
    print(f"✅ Rejection notifications created: {rejection_notifications.count()}")
    
    return report

def test_permissions():
    """Test role-based permissions"""
    print("\n🔐 Testing role-based permissions...")
    
    # Test that stagiaire can only see their own reports
    stagiaire = User.objects.get(email='stagiaire.pfe@test.com')
    stagiaire_reports = PFEReport.objects.filter(stagiaire=stagiaire)
    print(f"✅ Stagiaire can see {stagiaire_reports.count()} of their own reports")
    
    # Test that tuteur can only see reports assigned to them
    tuteur = User.objects.get(email='tuteur.pfe@test.com')
    tuteur_reports = PFEReport.objects.filter(tuteur=tuteur)
    print(f"✅ Tuteur can see {tuteur_reports.count()} reports assigned to them")
    
    # Test that RH can see approved and archived reports
    rh_user, created = User.objects.get_or_create(
        email='rh.pfe@test.com',
        defaults={
            'nom': 'RH',
            'prenom': 'Test',
            'role': 'rh',
            'is_active': True
        }
    )
    
    # Create some approved reports for RH to see
    stage = Stage.objects.first()
    if stage:
        approved_report = PFEReport.objects.create(
            stage=stage,
            stagiaire=stage.stagiaire,
            tuteur=stage.tuteur,
            title="Rapport approuvé pour RH",
            abstract="Ce rapport est approuvé et visible par le RH",
            keywords="RH, Approuvé, Test",
            speciality="Informatique",
            year=2025,
            status='approved'
        )
        print(f"✅ Created approved report for RH testing: {approved_report.title}")
    
    print("✅ Permission tests completed")

def main():
    """Main test function"""
    print("🚀 Starting PFE Digital Hub tests...")
    print("=" * 50)
    
    try:
        # Test the main workflow
        approved_report = test_pfe_report_workflow()
        
        # Test rejection workflow
        rejected_report = test_rejection_workflow()
        
        # Test permissions
        test_permissions()
        
        print("\n" + "=" * 50)
        print("🎉 All PFE Digital Hub tests completed successfully!")
        print(f"✅ Created {PFEReport.objects.count()} PFE reports")
        print(f"✅ Created {Notification.objects.count()} notifications")
        
        # Summary
        print("\n📋 Test Summary:")
        print(f"   - Approved reports: {PFEReport.objects.filter(status='approved').count()}")
        print(f"   - Rejected reports: {PFEReport.objects.filter(status='rejected').count()}")
        print(f"   - Archived reports: {PFEReport.objects.filter(status='archived').count()}")
        print(f"   - Total notifications: {Notification.objects.count()}")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 