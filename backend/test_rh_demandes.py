#!/usr/bin/env python3
"""
Test pour vérifier si les demandes sont maintenant visibles pour les utilisateurs RH
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from auth_service.models import User
from demande_service.views import DemandeListView
from django.test import RequestFactory
from rest_framework.test import force_authenticate

def test_rh_demandes():
    """Test de visibilité des demandes pour les RH"""
    
    print("🧪 Test de visibilité des demandes pour les RH")
    print("=" * 60)
    
    # 1. Vérifier l'état des demandes
    print("\n📋 État des demandes:")
    
    total_demandes = Demande.objects.count()
    print(f"   - Total des demandes: {total_demandes}")
    
    demandes_avec_entreprise = Demande.objects.filter(entreprise__isnull=False).count()
    print(f"   - Demandes avec entreprise: {demandes_avec_entreprise}")
    
    demandes_sans_entreprise = Demande.objects.filter(entreprise__isnull=True).count()
    print(f"   - Demandes sans entreprise: {demandes_sans_entreprise}")
    
    # 2. Vérifier les utilisateurs RH
    print(f"\n👥 Utilisateurs RH:")
    
    rh_users = User.objects.filter(role='rh')
    rh_count = rh_users.count()
    print(f"   - Nombre d'utilisateurs RH: {rh_count}")
    
    if rh_count > 0:
        for user in rh_users:
            entreprise_nom = user.entreprise.nom if user.entreprise else "Aucune"
            print(f"     * {user.email} - Entreprise: {entreprise_nom}")
    else:
        print(f"   ⚠️ Aucun utilisateur RH trouvé")
        return False
    
    # 3. Tester la vue DemandeListView pour chaque RH
    print(f"\n🔍 Test de la vue DemandeListView:")
    
    factory = RequestFactory()
    
    for rh_user in rh_users:
        print(f"\n   👤 Test pour {rh_user.email}:")
        
        if not rh_user.entreprise:
            print(f"     ❌ Pas d'entreprise assignée - aucune demande visible")
            continue
        
        # Créer une requête authentifiée
        request = factory.get('/demandes/')
        force_authenticate(request, user=rh_user)
        
        # Appeler la vue
        view = DemandeListView.as_view()
        response = view(request)
        
        if response.status_code == 200:
            demandes_visibles = len(response.data.get('results', []))
            print(f"     ✅ Vue accessible - {demandes_visibles} demandes visibles")
            
            if demandes_visibles > 0:
                print(f"     📝 Demandes visibles:")
                for demande in response.data['results'][:3]:  # Afficher les 3 premières
                    print(f"       - {demande.get('prenom', '')} {demande.get('nom', '')} ({demande.get('email', '')})")
            else:
                print(f"     ⚠️ Aucune demande visible malgré l'entreprise")
                
        else:
            print(f"     ❌ Erreur de la vue: {response.status_code}")
            if hasattr(response, 'data'):
                print(f"       Erreur: {response.data}")
    
    # 4. Vérifier la logique de filtrage
    print(f"\n🔍 Analyse de la logique de filtrage:")
    
    for rh_user in rh_users:
        if rh_user.entreprise:
            demandes_entreprise = Demande.objects.filter(entreprise=rh_user.entreprise)
            print(f"   👤 {rh_user.email} ({rh_user.entreprise.nom}):")
            print(f"     - Demandes de l'entreprise: {demandes_entreprise.count()}")
            
            if demandes_entreprise.exists():
                for demande in demandes_entreprise[:2]:  # Afficher les 2 premières
                    print(f"       * {demande.prenom} {demande.nom} - {demande.email}")
            else:
                print(f"       ⚠️ Aucune demande trouvée pour cette entreprise")
    
    # 5. Résumé
    print(f"\n📊 Résumé du test:")
    
    if demandes_avec_entreprise == total_demandes:
        print(f"   ✅ Toutes les demandes ont une entreprise assignée")
    else:
        print(f"   ❌ {demandes_sans_entreprise} demandes n'ont pas d'entreprise")
    
    if rh_count > 0:
        rh_avec_entreprise = rh_users.filter(entreprise__isnull=False).count()
        print(f"   - RH avec entreprise: {rh_avec_entreprise}/{rh_count}")
        
        if rh_avec_entreprise > 0:
            print(f"   🎯 Les demandes devraient maintenant être visibles pour les RH")
        else:
            print(f"   ⚠️ Aucun RH n'a d'entreprise assignée")
    
    return demandes_avec_entreprise == total_demandes and rh_count > 0

if __name__ == '__main__':
    success = test_rh_demandes()
    if success:
        print(f"\n🎉 Test réussi! Les demandes devraient être visibles")
    else:
        print(f"\n❌ Test échoué - Vérifiez la configuration")
