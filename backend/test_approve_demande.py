#!/usr/bin/env python3
"""
Test de l'approbation d'une demande et création du stage
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from shared.models import Stage
from auth_service.models import User
from demande_service.views import approve_demande
from django.test import RequestFactory
from rest_framework.test import force_authenticate

def test_approve_demande():
    """Test de l'approbation d'une demande"""
    
    print("🧪 Test de l'approbation d'une demande")
    print("=" * 60)
    
    # 1. Vérifier l'état initial
    print("\n📋 État initial:")
    
    total_demandes = Demande.objects.count()
    print(f"   - Total des demandes: {total_demandes}")
    
    demandes_pending = Demande.objects.filter(status='pending').count()
    print(f"   - Demandes en attente: {demandes_pending}")
    
    total_stages = Stage.objects.count()
    print(f"   - Total des stages: {total_stages}")
    
    # 2. Trouver une demande en attente
    demande_pending = Demande.objects.filter(status='pending').first()
    
    if not demande_pending:
        print(f"   ❌ Aucune demande en attente trouvée")
        return False
    
    print(f"\n🔍 Demande à approuver:")
    print(f"   - ID: {demande_pending.id}")
    print(f"   - Candidat: {demande_pending.prenom} {demande_pending.nom}")
    print(f"   - Email: {demande_pending.email}")
    print(f"   - Statut: {demande_pending.status}")
    print(f"   - Entreprise: {demande_pending.entreprise.nom if demande_pending.entreprise else 'None'}")
    
    # 3. Trouver un utilisateur RH pour tester
    rh_user = User.objects.filter(role='rh').first()
    
    if not rh_user:
        print(f"   ❌ Aucun utilisateur RH trouvé")
        return False
    
    print(f"\n👤 Utilisateur RH de test:")
    print(f"   - Email: {rh_user.email}")
    print(f"   - Entreprise: {rh_user.entreprise.nom if rh_user.entreprise else 'None'}")
    
    # 4. Tester l'approbation de la demande
    print(f"\n🚀 Test de l'approbation...")
    
    try:
        # Créer une requête authentifiée
        factory = RequestFactory()
        request = factory.post(f'/demandes/{demande_pending.id}/approve/')
        force_authenticate(request, user=rh_user)
        
        # Appeler la vue
        response = approve_demande(request, demande_pending.id)
        
        if response.status_code == 200:
            print(f"   ✅ Demande approuvée avec succès!")
            print(f"   📝 Réponse: {response.data}")
            
            # Vérifier que le stage a été créé
            stage_created = Stage.objects.filter(demande=demande_pending).first()
            if stage_created:
                print(f"\n🎯 Stage créé avec succès:")
                print(f"   - ID: {stage_created.id}")
                print(f"   - Titre: {stage_created.title}")
                print(f"   - Statut: {stage_created.status}")
                print(f"   - Stagiaire: {stage_created.stagiaire.email}")
                print(f"   - Entreprise: {stage_created.company_entreprise.nom if stage_created.company_entreprise else 'None'}")
                print(f"   - Nom entreprise: {stage_created.company_name}")
                print(f"   - Date début: {stage_created.start_date}")
                print(f"   - Date fin: {stage_created.end_date}")
                
                # Vérifier que la demande a été approuvée
                demande_pending.refresh_from_db()
                print(f"\n📋 Demande mise à jour:")
                print(f"   - Nouveau statut: {demande_pending.status}")
                print(f"   - Utilisateur créé: {demande_pending.user_created.email if demande_pending.user_created else 'None'}")
                
                return True
            else:
                print(f"   ❌ Aucun stage créé")
                return False
                
        else:
            print(f"   ❌ Erreur lors de l'approbation: {response.status_code}")
            if hasattr(response, 'data'):
                print(f"   📝 Erreur: {response.data}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception lors du test: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 5. Vérifier l'état final
    print(f"\n📊 État final:")
    
    demandes_approved = Demande.objects.filter(status='approved').count()
    print(f"   - Demandes approuvées: {demandes_approved}")
    
    total_stages_final = Stage.objects.count()
    print(f"   - Total des stages: {total_stages_final}")
    
    return True

if __name__ == '__main__':
    success = test_approve_demande()
    if success:
        print(f"\n🎉 Test réussi! L'approbation fonctionne correctement")
    else:
        print(f"\n❌ Test échoué - Vérifiez les erreurs")
