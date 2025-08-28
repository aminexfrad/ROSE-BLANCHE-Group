# Système d'Évaluation KPI des Stagiaires

## Vue d'ensemble

Le système d'évaluation KPI (Key Performance Indicators) permet aux responsables RH d'évaluer le potentiel à long terme des stagiaires après leur stage (PFE) en utilisant des indicateurs standardisés et pondérés.

## Fonctionnalités

### 1. Backend (API + Base de données)

#### Modèle de données
- **Table**: `intern_kpi_evaluations`
- **Champs KPI**:
  - `delivery_satisfaction_rate` (25%) - Taux de satisfaction des livrables
  - `deadline_respect_rate` (20%) - Respect des délais
  - `learning_capacity` (15%) - Capacité d'apprentissage
  - `initiative_taking` (10%) - Prise d'initiatives
  - `professional_behavior` (15%) - Comportement professionnel
  - `adaptability` (15%) - Adaptabilité au changement

#### Calculs automatiques
- **Score total**: Calculé automatiquement selon la formule pondérée
- **Interprétation**: Déterminée automatiquement selon le score total
  - 4,5 à 5,0 → Potentiel élevé
  - 3,5 à 4,4 → Bon potentiel
  - 2,5 à 3,4 → Potentiel moyen
  - < 2,5 → Potentiel à renforcer

#### Endpoints API
- `POST /api/rh/kpi-evaluations/` - Créer une évaluation
- `GET /api/rh/kpi-evaluations/` - Lister les évaluations
- `GET /api/rh/kpi-evaluations/:id/` - Récupérer une évaluation
- `GET /api/rh/kpi-evaluations/statistics/` - Statistiques
- `GET /api/rh/kpi-evaluations/export_excel/` - Export Excel
- `GET /api/rh/kpi-evaluations/:id/export_intern_evaluation/` - Export d'une évaluation spécifique

### 2. Frontend (Interface RH)

#### Composants principaux
- **KpiEvaluationForm**: Formulaire d'évaluation avec sliders et calcul en temps réel
- **KpiEvaluationsList**: Liste des évaluations avec filtres et export
- **KpiStatistics**: Tableau de bord avec statistiques détaillées

#### Fonctionnalités utilisateur
- Sélection du stagiaire et du stage
- Évaluation des 6 KPIs sur une échelle de 0 à 5
- Calcul automatique du score total et de l'interprétation
- Filtrage et recherche des évaluations
- Export Excel des données
- Visualisation des statistiques

## Architecture technique

### Backend
```
rh_service/
├── models.py          # Modèle InternKpiEvaluation
├── serializers.py     # Sérialiseurs pour l'API
├── views.py          # ViewSet et vues API
├── urls.py           # Configuration des routes
├── admin.py          # Interface d'administration
├── permissions.py    # Gestion des permissions
└── apps.py           # Configuration de l'app
```

### Frontend
```
components/
├── kpi-evaluation-form.tsx      # Formulaire d'évaluation
├── kpi-evaluations-list.tsx     # Liste des évaluations
└── kpi-statistics.tsx           # Statistiques

app/rh/kpi-evaluations/
└── page.tsx                     # Page principale
```

## Installation et configuration

### 1. Backend
```bash
# Créer les migrations
python manage.py makemigrations rh_service

# Appliquer les migrations
python manage.py migrate rh_service

# Créer un superuser (optionnel)
python manage.py createsuperuser
```

### 2. Frontend
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Utilisation

### 1. Créer une évaluation
1. Accéder à la page `/rh/kpi-evaluations`
2. Cliquer sur "Nouvelle évaluation"
3. Sélectionner le stagiaire et le stage (optionnel)
4. Évaluer chaque KPI sur l'échelle de 0 à 5
5. Ajouter des commentaires si nécessaire
6. Soumettre l'évaluation

### 2. Consulter les évaluations
1. Naviguer vers l'onglet "Liste des évaluations"
2. Utiliser les filtres pour affiner les résultats
3. Exporter les données en Excel si nécessaire
4. Consulter les détails d'une évaluation spécifique

### 3. Analyser les statistiques
1. Consulter le tableau de bord des statistiques
2. Filtrer par période (7, 30, 90, 365 jours)
3. Analyser la distribution des potentiels
4. Identifier les meilleurs scores

## Permissions et sécurité

### Rôles autorisés
- **RH**: Peut créer, consulter et modifier ses propres évaluations
- **Admin**: Accès complet à toutes les fonctionnalités

### Restrictions
- Les RH ne peuvent accéder qu'aux données de leur entreprise
- Seuls les utilisateurs authentifiés peuvent accéder aux évaluations
- Les scores et interprétations sont calculés automatiquement

## Export Excel

### Format d'export
Le système génère des fichiers Excel conformes au modèle fourni avec :
- En-têtes formatés avec couleurs
- Définitions des KPIs et méthodes de mesure
- Poids et scores calculés
- Tableau d'interprétation des potentiels
- Informations détaillées de l'évaluation

### Types d'export
1. **Export global**: Toutes les évaluations filtrées
2. **Export individuel**: Une évaluation spécifique avec détails complets

## Maintenance et évolutions

### Ajout de nouveaux KPIs
1. Modifier le modèle `InternKpiEvaluation`
2. Mettre à jour les sérialiseurs
3. Adapter les composants frontend
4. Recalculer les poids pour maintenir 100%

### Personnalisation des seuils
Les seuils d'interprétation peuvent être modifiés dans le modèle :
```python
def determine_interpretation(self):
    if self.total_score >= 4.5:
        self.interpretation = self.PotentialCategory.HIGH
    # ... autres seuils
```

## Dépannage

### Problèmes courants
1. **Erreur de migration**: Vérifier les dépendances entre modèles
2. **Conflit de permissions**: Vérifier les rôles et entreprises
3. **Erreur d'export**: Vérifier l'installation d'openpyxl

### Logs et monitoring
- Les erreurs sont loggées dans `gateway/logs/`
- Utiliser l'interface d'administration Django pour le débogage
- Vérifier les permissions utilisateur dans l'admin

## Support et contact

Pour toute question ou problème :
- Consulter la documentation technique
- Vérifier les logs d'erreur
- Contacter l'équipe de développement

---

**Note**: Ce système est conçu pour être évolutif et peut être adapté aux besoins spécifiques de chaque organisation.
