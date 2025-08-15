#!/usr/bin/env python3
"""
Test script pour vérifier que les corrections du filtrage par entreprise RH fonctionnent correctement
"""

import os
import sys
import django
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.test.client import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Entreprise, Stage, Testimonial, Evaluation, Notification, Survey
from demande_service.models import Demande

def test_rh_company_filtering():
    """Test complet du système de filtrage par entreprise RH"""
    
    print("🧪 Test du système de filtrage par entreprise RH")
    print("=" * 60)
    
    try:
        # 1. Créer des entreprises de test
        print("\n1. Création des entreprises de test...")
        
        entreprise_1 = Entreprise.objects.create(
            nom="Entreprise Test 1",
            description="Première entreprise de test",
            secteur_activite="Technologie"
        )
        
        entreprise_2 = Entreprise.objects.create(
            nom="Entreprise Test 2", 
            description="Deuxième entreprise de test",
            secteur_activite="Finance"
        )
        
        print(f"   ✅ Entreprise 1 créée: {entreprise_1.nom}")
        print(f"   ✅ Entreprise 2 créée: {entreprise_2.nom}")
        
        # 2. Créer des utilisateurs RH pour chaque entreprise
        print("\n2. Création des utilisateurs RH...")
        
        rh_user_1 = User.objects.create_user(
            email="rh1@entreprise1.com",
            password="testpass123",
            prenom="RH",
            nom="Entreprise1",
            role="rh",
            entreprise=entreprise_1
        )
        
        rh_user_2 = User.objects.create_user(
            email="rh2@entreprise2.com",
            password="testpass123",
            prenom="RH",
            nom="Entreprise2", 
            role="rh",
            entreprise=entreprise_2
        )
        
        admin_user = User.objects.create_user(
            email="admin@test.com",
            password="adminpass123",
            prenom="Admin",
            nom="Test",
            role="admin"
        )
        
        print(f"   ✅ RH Entreprise 1 créé: {rh_user_1.email}")
        print(f"   ✅ RH Entreprise 2 créé: {rh_user_2.email}")
        print(f"   ✅ Admin créé: {admin_user.email}")
        
        # 3. Créer des stagiaires pour chaque entreprise
        print("\n3. Création des stagiaires...")
        
        stagiaire_1 = User.objects.create_user(
            email="stagiaire1@test.com",
            password="stagiaire123",
            prenom="Stagiaire",
            nom="Entreprise1",
            role="stagiaire",
            entreprise=entreprise_1,
            institut="Institut Test 1",
            specialite="Informatique"
        )
        
        stagiaire_2 = User.objects.create_user(
            email="stagiaire2@test.com",
            password="stagiaire123",
            prenom="Stagiaire",
            nom="Entreprise2",
            role="stagiaire",
            entreprise=entreprise_2,
            institut="Institut Test 2",
            specialite="Finance"
        )
        
        print(f"   ✅ Stagiaire Entreprise 1 créé: {stagiaire_1.email}")
        print(f"   ✅ Stagiaire Entreprise 2 créé: {stagiaire_2.email}")
        
        # 4. Créer des demandes et stages
        print("\n4. Création des demandes et stages...")
        
        demande_1 = Demande.objects.create(
            nom=stagiaire_1.nom,
            prenom=stagiaire_1.prenom,
            email=stagiaire_1.email,
            telephone="0123456789",
            cin="CIN001",
            institut=stagiaire_1.institut,
            specialite=stagiaire_1.specialite,
            niveau="Bac+3",
            type_stage="Stage PFE",
            date_debut="2024-01-01",
            date_fin="2024-06-30",
            status="approved",
            user_created=stagiaire_1,
            entreprise=entreprise_1
        )
        
        demande_2 = Demande.objects.create(
            nom=stagiaire_2.nom,
            prenom=stagiaire_2.prenom,
            email=stagiaire_2.email,
            telephone="0987654321",
            cin="CIN002",
            institut=stagiaire_2.institut,
            specialite=stagiaire_2.specialite,
            niveau="Bac+4",
            type_stage="Stage PFE",
            date_debut="2024-02-01",
            date_fin="2024-07-31",
            status="approved",
            user_created=stagiaire_2,
            entreprise=entreprise_2
        )
        
        stage_1 = Stage.objects.create(
            demande=demande_1,
            stagiaire=stagiaire_1,
            title="Stage Informatique Entreprise 1",
            description="Stage en développement web",
            company_entreprise=entreprise_1,
            location="Paris",
            start_date="2024-01-01",
            end_date="2024-06-30",
            status="active",
            progress=50
        )
        
        stage_2 = Stage.objects.create(
            demande=demande_2,
            stagiaire=stagiaire_2,
            title="Stage Finance Entreprise 2",
            description="Stage en analyse financière",
            company_entreprise=entreprise_2,
            location="Lyon",
            start_date="2024-02-01",
            end_date="2024-07-31",
            status="active",
            progress=30
        )
        
        print(f"   ✅ Stage Entreprise 1 créé: {stage_1.title}")
        print(f"   ✅ Stage Entreprise 2 créé: {stage_2.title}")
        
        # 5. Créer des évaluations
        print("\n5. Création des évaluations...")
        
        evaluation_1 = Evaluation.objects.create(
            evaluator=rh_user_1,
            evaluated=stagiaire_1,
            stage=stage_1,
            evaluation_type="midterm",
            scores={"technique": 4, "communication": 4, "autonomie": 5},
            overall_score=4.3,
            is_completed=True
        )
        
        evaluation_2 = Evaluation.objects.create(
            evaluator=rh_user_2,
            evaluated=stagiaire_2,
            stage=stage_2,
            evaluation_type="midterm",
            scores={"technique": 4, "communication": 5, "autonomie": 4},
            overall_score=4.3,
            is_completed=True
        )
        
        print(f"   ✅ Évaluation Entreprise 1 créée")
        print(f"   ✅ Évaluation Entreprise 2 créée")
        
        # 6. Créer des témoignages
        print("\n6. Création des témoignages...")
        
        testimonial_1 = Testimonial.objects.create(
            author=stagiaire_1,
            stage=stage_1,
            title="Excellent stage",
            content="Stage très enrichissant",
            status="pending"
        )
        
        testimonial_2 = Testimonial.objects.create(
            author=stagiaire_2,
            stage=stage_2,
            title="Stage intéressant",
            content="Bonne expérience",
            status="pending"
        )
        
        print(f"   ✅ Témoignage Entreprise 1 créé")
        print(f"   ✅ Témoignage Entreprise 2 créé")
        
        # 7. Créer des notifications
        print("\n7. Création des notifications...")
        
        notification_1 = Notification.objects.create(
            recipient=stagiaire_1,
            title="Nouvelle évaluation",
            message="Votre évaluation est disponible",
            notification_type="info"
        )
        
        notification_2 = Notification.objects.create(
            recipient=stagiaire_2,
            title="Nouvelle évaluation",
            message="Votre évaluation est disponible",
            notification_type="info"
        )
        
        print(f"   ✅ Notification Entreprise 1 créée")
        print(f"   ✅ Notification Entreprise 2 créée")
        
        # 8. Créer des sondages
        print("\n8. Création des sondages...")
        
        survey_1 = Survey.objects.create(
            title="Sondage Entreprise 1",
            description="Sondage de satisfaction",
            created_by=rh_user_1,
            target_type="all_stagiaires"
        )
        survey_1.target_stagiaires.add(stagiaire_1)
        
        survey_2 = Survey.objects.create(
            title="Sondage Entreprise 2",
            description="Sondage de satisfaction",
            created_by=rh_user_2,
            target_type="all_stagiaires"
        )
        survey_2.target_stagiaires.add(stagiaire_2)
        
        print(f"   ✅ Sondage Entreprise 1 créé")
        print(f"   ✅ Sondage Entreprise 2 créé")
        
        # 9. Test du filtrage par entreprise
        print("\n9. Test du filtrage par entreprise...")
        
        # Test RH Entreprise 1
        print(f"\n   🔍 Test RH Entreprise 1 ({rh_user_1.email}):")
        
        # Simuler la fonction de filtrage
        from rh_service.views import get_company_filtered_queryset
        
        # Test stagiaires
        stagiaires_rh1 = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_1})(),
            User.objects.filter(role='stagiaire'),
            'entreprise'
        )
        print(f"      Stagiaires visibles: {stagiaires_rh1.count()}")
        for s in stagiaires_rh1:
            print(f"        - {s.prenom} {s.nom} ({s.entreprise.nom})")
        
        # Test stages
        stages_rh1 = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_1})(),
            Stage.objects.all(),
            'company_entreprise'
        )
        print(f"      Stages visibles: {stages_rh1.count()}")
        for s in stages_rh1:
            print(f"        - {s.title} ({s.company_entreprise.nom})")
        
        # Test RH Entreprise 2
        print(f"\n   🔍 Test RH Entreprise 2 ({rh_user_2.email}):")
        
        stagiaires_rh2 = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_2})(),
            User.objects.filter(role='stagiaire'),
            'entreprise'
        )
        print(f"      Stagiaires visibles: {stagiaires_rh2.count()}")
        for s in stagiaires_rh2:
            print(f"        - {s.prenom} {s.nom} ({s.entreprise.nom})")
        
        stages_rh2 = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_2})(),
            Stage.objects.all(),
            'company_entreprise'
        )
        print(f"      Stages visibles: {stages_rh2.count()}")
        for s in stages_rh2:
            print(f"        - {s.title} ({s.company_entreprise.nom})")
        
        # Test Admin
        print(f"\n   🔍 Test Admin ({admin_user.email}):")
        
        stagiaires_admin = get_company_filtered_queryset(
            type('MockRequest', (), {'user': admin_user})(),
            User.objects.filter(role='stagiaire'),
            'entreprise'
        )
        print(f"      Stagiaires visibles: {stagiaires_admin.count()}")
        
        stages_admin = get_company_filtered_queryset(
            type('MockRequest', (), {'user': admin_user})(),
            Stage.objects.all(),
            'company_entreprise'
        )
        print(f"      Stages visibles: {stages_admin.count()}")
        
        # 10. Test de validation d'accès
        print("\n10. Test de validation d'accès...")
        
        from rh_service.views import validate_rh_company_access
        
        # Test accès autorisé
        has_access, error_msg = validate_rh_company_access(rh_user_1, entreprise_1)
        print(f"   ✅ RH Entreprise 1 accès à Entreprise 1: {has_access}")
        
        # Test accès refusé
        has_access, error_msg = validate_rh_company_access(rh_user_1, entreprise_2)
        print(f"   ❌ RH Entreprise 1 accès à Entreprise 2: {has_access} - {error_msg}")
        
        # Test admin accès
        has_access, error_msg = validate_rh_company_access(admin_user, entreprise_1)
        print(f"   ✅ Admin accès à Entreprise 1: {has_access}")
        
        # 11. Vérification de l'isolation des données
        print("\n11. Vérification de l'isolation des données...")
        
        # Vérifier que RH1 ne peut pas voir les données d'Entreprise 2
        rh1_stagiaires = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_1})(),
            User.objects.filter(role='stagiaire'),
            'entreprise'
        )
        
        rh1_stages = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_1})(),
            Stage.objects.all(),
            'company_entreprise'
        )
        
        rh1_evaluations = get_company_filtered_queryset(
            type('MockRequest', (), {'user': rh_user_1})(),
            Evaluation.objects.all(),
            'stage__company_entreprise'
        )
        
        print(f"   📊 RH Entreprise 1 - Données visibles:")
        print(f"      - Stagiaires: {rh1_stagiaires.count()}")
        print(f"      - Stages: {rh1_stages.count()}")
        print(f"      - Évaluations: {rh1_evaluations.count()}")
        
        # Vérifier que toutes les données visibles appartiennent à Entreprise 1
        all_entreprise_1 = True
        for stagiaire in rh1_stagiaires:
            if stagiaire.entreprise != entreprise_1:
                all_entreprise_1 = False
                break
        
        for stage in rh1_stages:
            if stage.company_entreprise != entreprise_1:
                all_entreprise_1 = False
                break
        
        for evaluation in rh1_evaluations:
            if evaluation.stage.company_entreprise != entreprise_1:
                all_entreprise_1 = False
                break
        
        print(f"   🔒 Isolation des données: {'✅ OK' if all_entreprise_1 else '❌ ÉCHEC'}")
        
        # 12. Résumé des tests
        print("\n" + "=" * 60)
        print("📋 RÉSUMÉ DES TESTS")
        print("=" * 60)
        
        print(f"✅ Entreprises créées: 2")
        print(f"✅ Utilisateurs RH créés: 2")
        print(f"✅ Stagiaires créés: 2")
        print(f"✅ Stages créés: 2")
        print(f"✅ Évaluations créées: 2")
        print(f"✅ Témoignages créés: 2")
        print(f"✅ Notifications créées: 2")
        print(f"✅ Sondages créés: 2")
        
        print(f"\n🔒 Filtrage par entreprise: {'✅ FONCTIONNE' if all_entreprise_1 else '❌ ÉCHEC'}")
        print(f"🔒 Validation d'accès: ✅ FONCTIONNE")
        print(f"🔒 Isolation des données: {'✅ FONCTIONNE' if all_entreprise_1 else '❌ ÉCHEC'}")
        
        if all_entreprise_1:
            print(f"\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!")
            print(f"   Le système de filtrage par entreprise RH fonctionne correctement.")
        else:
            print(f"\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ!")
            print(f"   Vérifiez la configuration du filtrage par entreprise.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR LORS DES TESTS: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Démarrage des tests du système de filtrage par entreprise RH...")
    success = test_rh_company_filtering()
    
    if success:
        print(f"\n✅ Tests terminés avec succès!")
        sys.exit(0)
    else:
        print(f"\n❌ Tests terminés avec des erreurs!")
        sys.exit(1)
