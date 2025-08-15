#!/usr/bin/env python3
import os, sys, django
sys.path.append('..')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from shared.models import Stage

print("📊 État actuel du système:")
print("=" * 40)

print(f"\n📝 Demandes:")
demandes = Demande.objects.all()
for d in demandes:
    print(f"  - {d.prenom} {d.nom}: {d.status}")

print(f"\n🎯 Stages:")
stages = Stage.objects.all()
for s in stages:
    print(f"  - {s.title} ({s.status})")

print(f"\n📈 Résumé:")
print(f"  - Total demandes: {demandes.count()}")
print(f"  - Total stages: {stages.count()}")
print(f"  - Demandes approuvées: {demandes.filter(status='approved').count()}")
print(f"  - Stages actifs: {stages.filter(status='active').count()}")
