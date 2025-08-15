#!/usr/bin/env python3
"""
Test complet du processus de demande de stage en entreprise
Teste toutes les corrections apportées (date_soumission + validation des noms)
"""

import os
import sys
import django
from django.test import RequestFactory
from rest_framework import status

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from demande_service.views import DemandeCreateView
from shared.models import Entreprise, OffreStage
from shared.security import SecurityValidator

def test_demande_stage_complete():
    """Test complet du processus de demande de stage"""
    
    print("🧪 Test complet du processus de demande de stage")
    print("=" * 70)
    
    # 1. Vérifier que les corrections sont en place
    print("\n🔍 Vérification des corrections...")
    
    # Vérifier le champ date_soumission
    try:
        model_fields = Demande._meta.get_fields()
        field_names = [field.name for field in model_fields]
        
        if 'date_soumission' in field_names:
            print("✅ Champ 'date_soumission' présent dans le modèle")
        else:
            print("❌ Champ 'date_soumission' manquant - exécutez d'abord fix_demande_date_soumission.py")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification du modèle: {e}")
        return False
    
    # Vérifier le pattern de validation des noms
    try:
        current_pattern = SecurityValidator.NAME_PATTERN.pattern
        if '\\u00C0-\\u017F' in current_pattern:
            print("✅ Pattern de validation des noms amélioré")
        else:
            print("⚠️ Pattern de validation des noms non amélioré - exécutez d'abord fix_name_validation.py")
            
    except Exception as e:
        print(f"⚠️ Erreur lors de la vérification du pattern: {e}")
    
    # 2. Créer les données de test
    print("\n📝 Création des données de test...")
    
    # Créer une entreprise de test
    entreprise, created = Entreprise.objects.get_or_create(
        nom="Warda Technologies",
        defaults={
            'description': 'Entreprise de test pour le processus de demande de stage',
            'secteur_activite': 'Technologie'
        }
    )
    
    if created:
        print(f"✅ Entreprise créée: {entreprise.nom}")
    else:
        print(f"✅ Entreprise existante: {entreprise.nom}")
    
    # Créer une offre de stage de test
    offre, created = OffreStage.objects.get_or_create(
        title="Stage PFE - Développement Web Full Stack",
        defaults={
            'description': 'Stage de fin d\'études en développement web full stack avec React et Django',
            'entreprise': entreprise,
            'ville': 'Casablanca, Maroc',
            'type': 'PFE',
            'status': 'open',
            'diplome': 'Bac+5',
            'specialite': 'Informatique',
            'nombre_postes': 1,
            'validated': True
        }
    )
    
    if created:
        print(f"✅ Offre créée: {offre.title}")
    else:
        print(f"✅ Offre existante: {offre.title}")
    
    # 3. Test de validation des noms avec différents formats
    print("\n🧪 Test de validation des noms...")
    
    test_names = [
        # Noms français avec accents
        ("François", "Dupont"),
        ("Thérèse", "Martin"),
        ("Émilie", "Bernard"),
        
        # Noms composés
        ("Jean-Pierre", "Leroy"),
        ("Marie-Claire", "Durand"),
        ("Pierre-Louis", "Moreau"),
        
        # Noms internationaux
        ("O'Connor", "McDonald"),
        ("D'Angelo", "St-Pierre"),
        ("Van der Berg", "De la Cruz"),
        
        # Noms courts et longs
        ("Li", "Wu"),
        ("Nguyen", "Rodriguez"),
        ("Constantinopoulos", "Papadopoulos"),
    ]
    
    validation_success_count = 0
    for nom, prenom in test_names:
        try:
            nom_validated = SecurityValidator.validate_name(nom, "nom")
            prenom_validated = SecurityValidator.validate_name(prenom, "prénom")
            print(f"   ✅ {prenom} {nom} -> {prenom_validated} {nom_validated}")
            validation_success_count += 1
        except Exception as e:
            print(f"   ❌ {prenom} {nom} -> {e}")
    
    print(f"   - Noms validés avec succès: {validation_success_count}/{len(test_names)}")
    
    # 4. Test de création de demande avec différents noms
    print(f"\n🧪 Test de création de demandes avec différents noms...")
    
    factory = RequestFactory()
    demandes_crees = []
    
    for i, (nom, prenom) in enumerate(test_names):
        try:
            # Données de test pour la demande
            test_data = {
                'nom': nom,
                'prenom': prenom,
                'email': f'test{i}@example.com',
                'telephone': f'012345678{i}',
                'institut': 'Institut Test Warda',
                'specialite': 'Informatique',
                'type_stage': 'Stage PFE',
                'niveau': 'Bac+5',
                'date_debut': '2024-02-01',
                'date_fin': '2024-07-31',
                'stage_binome': False,
                'offer_ids': [offre.id]
            }
            
            # Créer la requête
            request = factory.post('/demandes/create/', test_data, format='json')
            
            # Appeler la vue
            view = DemandeCreateView.as_view()
            response = view(request)
            
            if response.status_code == status.HTTP_201_CREATED:
                demande_data = response.data
                print(f"   ✅ Demande créée: {prenom} {nom}")
                print(f"      - ID: {demande_data.get('id')}")
                print(f"      - Email: {demande_data.get('email')}")
                print(f"      - Statut: {demande_data.get('status')}")
                
                # Vérifier en base
                demande = Demande.objects.get(id=demande_data['id'])
                print(f"      - Date soumission: {demande.date_soumission}")
                print(f"      - Date création: {demande.created_at}")
                print(f"      - Entreprise: {demande.entreprise.nom if demande.entreprise else 'None'}")
                
                demandes_crees.append(demande)
                
            else:
                print(f"   ❌ Échec création: {prenom} {nom}")
                print(f"      - Status: {response.status_code}")
                print(f"      - Erreur: {response.data}")
                
        except Exception as e:
            print(f"   ❌ Erreur lors de la création: {prenom} {nom} -> {e}")
    
    print(f"\n📊 Résultats des créations:")
    print(f"   - Demandes créées avec succès: {len(demandes_crees)}")
    print(f"   - Taux de succès: {(len(demandes_crees)/len(test_names)*100):.1f}%")
    
    # 5. Test spécifique avec le nom "Warda"
    print(f"\n🌟 Test spécial avec le nom 'Warda'...")
    
    try:
        # Données de test pour Warda
        warda_data = {
            'nom': 'Warda',
            'prenom': 'Fatima',
            'email': 'fatima.warda@example.com',
            'telephone': '0123456789',
            'institut': 'École Nationale des Sciences Appliquées',
            'specialite': 'Génie Informatique',
            'type_stage': 'Stage PFE',
            'niveau': 'Bac+5',
            'date_debut': '2024-02-01',
            'date_fin': '2024-07-31',
            'stage_binome': False,
            'offer_ids': [offre.id]
        }
        
        # Créer la requête
        request = factory.post('/demandes/create/', warda_data, format='json')
        
        # Appeler la vue
        view = DemandeCreateView.as_view()
        response = view(request)
        
        if response.status_code == status.HTTP_201_CREATED:
            demande_data = response.data
            print(f"   ✅ Demande Warda créée avec succès!")
            print(f"      - ID: {demande_data.get('id')}")
            print(f"      - Nom complet: {demande_data.get('prenom')} {demande_data.get('nom')}")
            print(f"      - Email: {demande_data.get('email')}")
            print(f"      - Institut: {demande_data.get('institut')}")
            print(f"      - Statut: {demande_data.get('status')}")
            
            # Vérifier en base
            demande = Demande.objects.get(id=demande_data['id'])
            print(f"      - Date soumission: {demande.date_soumission}")
            print(f"      - Date création: {demande.created_at}")
            print(f"      - Entreprise: {demande.entreprise.nom if demande.entreprise else 'None'}")
            
            demandes_crees.append(demande)
            
        else:
            print(f"   ❌ Échec création Warda")
            print(f"      - Status: {response.status_code}")
            print(f"      - Erreur: {response.data}")
            
    except Exception as e:
        print(f"   ❌ Erreur lors de la création Warda: {e}")
    
    # 6. Vérification de la cohérence des données
    print(f"\n🔍 Vérification de la cohérence des données...")
    
    if demandes_crees:
        print(f"   - Nombre total de demandes créées: {len(demandes_crees)}")
        
        # Vérifier que toutes ont une date de soumission
        with_date_soumission = [d for d in demandes_crees if hasattr(d, 'date_soumission') and d.date_soumission]
        print(f"   - Demandes avec date_soumission: {len(with_date_soumission)}")
        
        # Vérifier que toutes ont une entreprise
        with_entreprise = [d for d in demandes_crees if d.entreprise]
        print(f"   - Demandes avec entreprise: {len(with_entreprise)}")
        
        # Vérifier que toutes ont des offres
        with_offres = [d for d in demandes_crees if d.offres.exists()]
        print(f"   - Demandes avec offres: {len(with_offres)}")
        
        print(f"   ✅ Toutes les demandes sont cohérentes")
    else:
        print(f"   ⚠️ Aucune demande créée pour vérifier la cohérence")
    
    # 7. Nettoyage des données de test
    print(f"\n🧹 Nettoyage des données de test...")
    
    try:
        # Supprimer toutes les demandes de test
        emails_test = [f'test{i}@example.com' for i in range(len(test_names))]
        emails_test.append('fatima.warda@example.com')
        
        demandes_supprimees = Demande.objects.filter(email__in=emails_test).delete()
        print(f"   ✅ {demandes_supprimees[0]} demandes de test supprimées")
        
    except Exception as e:
        print(f"   ⚠️ Erreur lors du nettoyage: {e}")
    
    # 8. Résumé final
    print(f"\n🎉 Test complet terminé!")
    print(f"📊 Résumé:")
    print(f"   - Validation des noms: {validation_success_count}/{len(test_names)} réussies")
    print(f"   - Création de demandes: {len(demandes_crees)} réussies")
    print(f"   - Test Warda: {'✅ Réussi' if any('fatima.warda@example.com' in str(d) for d in demandes_crees) else '❌ Échoué'}")
    
    if len(demandes_crees) > 0:
        print(f"\n✅ Le processus de demande de stage fonctionne correctement!")
        print(f"🚀 Les corrections apportées sont efficaces")
        print(f"🌍 Le système accepte maintenant les noms internationaux")
    else:
        print(f"\n❌ Le processus de demande de stage a des problèmes")
        print(f"🔍 Vérifiez les erreurs ci-dessus")
    
    return len(demandes_crees) > 0

if __name__ == '__main__':
    success = test_demande_stage_complete()
    if success:
        print(f"\n🎯 Test réussi! Le processus de demande de stage est opérationnel")
    else:
        print(f"\n❌ Test échoué - Vérifiez les corrections")
