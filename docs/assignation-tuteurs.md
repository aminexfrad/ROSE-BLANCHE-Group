# Fonctionnalité d'Assignation de Tuteurs

## Vue d'ensemble

Cette fonctionnalité permet aux responsables RH d'assigner des tuteurs aux stagiaires acceptés via une interface simple et intuitive. Une fois qu'un candidat est accepté et devient un stagiaire, le RH peut lui assigner un tuteur disponible dans une liste.

## Fonctionnalités

### Backend

#### API Endpoints

1. **GET /api/rh/tuteurs-disponibles/**
   - Récupère la liste des tuteurs disponibles
   - Retourne les informations de chaque tuteur avec leur charge actuelle
   - Limite de 5 stagiaires par tuteur

2. **POST /api/rh/stagiaires/{stagiaire_id}/assigner-tuteur/**
   - Assigner un tuteur à un stagiaire
   - Vérifie la disponibilité du tuteur
   - Met à jour le stage du stagiaire
   - Crée des notifications pour le tuteur et le stagiaire

#### Modèles

- **Stage** : Contient une relation `tuteur` (ForeignKey vers User)
- **User** : Modèle utilisateur avec rôle 'tuteur' ou 'stagiaire'
- **Notification** : Notifications automatiques lors de l'assignation

#### Logique métier

- Vérification de la charge des tuteurs (max 5 stagiaires)
- Validation des permissions (RH ou admin uniquement)
- Notifications automatiques
- Gestion des erreurs et validation

### Frontend

#### Pages

1. **/rh/assignation-tuteurs** : Page dédiée à l'assignation
   - Vue d'ensemble des stagiaires avec/sans tuteur
   - Statistiques en temps réel
   - Interface intuitive pour l'assignation

2. **/rh/stagiaires** : Page des stagiaires avec bouton d'assignation
   - Menu déroulant avec option "Assigner un tuteur"
   - Intégration du modal d'assignation

#### Composants

1. **AssignTuteurModal** : Modal d'assignation
   - Sélection de tuteur avec indicateurs de disponibilité
   - Détails du tuteur sélectionné
   - Validation et gestion d'erreurs
   - Interface responsive et moderne

#### API Client

- `getRHTuteursDisponibles()` : Récupère les tuteurs
- `assignerTuteur(stagiaireId, tuteurId)` : Assigne un tuteur

## Workflow

### Processus d'assignation

1. **Accès** : Le RH accède à la page d'assignation via la sidebar
2. **Sélection** : Choisit un stagiaire sans tuteur
3. **Recherche** : Consulte la liste des tuteurs disponibles
4. **Assignation** : Sélectionne un tuteur et confirme
5. **Validation** : Le système vérifie la disponibilité
6. **Confirmation** : Notification de succès et mise à jour

### Notifications

- **Tuteur** : Notification d'un nouveau stagiaire assigné
- **Stagiaire** : Notification d'un tuteur assigné
- **RH** : Confirmation de l'assignation

## Sécurité

### Permissions

- Seuls les utilisateurs avec rôle 'rh' ou 'admin' peuvent assigner des tuteurs
- Validation côté serveur et client
- Logs d'audit pour les assignations

### Validation

- Vérification de la charge des tuteurs (max 5)
- Validation de l'existence des utilisateurs
- Vérification des stages actifs

## Interface utilisateur

### Design

- Interface moderne avec Tailwind CSS
- Indicateurs visuels de disponibilité
- Badges colorés pour les statuts
- Animations et transitions fluides

### Responsive

- Compatible mobile et desktop
- Adaptation automatique des layouts
- Navigation intuitive

## Tests

### Script de test

Le fichier `backend/test_tuteur_assignment.py` permet de :

1. Créer des données de test (tuteurs et stagiaires)
2. Simuler des assignations
3. Vérifier la logique métier
4. Valider les contraintes

### Utilisation

```bash
cd backend
python test_tuteur_assignment.py
```

## Configuration

### Limites

- Maximum 5 stagiaires par tuteur
- Seuls les stages actifs peuvent recevoir un tuteur
- Validation des permissions strictes

### Personnalisation

Les limites et règles peuvent être modifiées dans :
- `backend/rh_service/views.py` : Logique d'assignation
- `backend/shared/models.py` : Modèles de données
- `frontend/components/assign-tuteur-modal.tsx` : Interface

## Déploiement

### Backend

1. Appliquer les migrations si nécessaire
2. Vérifier les permissions des utilisateurs RH
3. Tester les endpoints API

### Frontend

1. Vérifier les imports des composants
2. Tester la navigation et les modals
3. Valider la responsivité

## Maintenance

### Monitoring

- Surveiller les assignations via les logs
- Vérifier la charge des tuteurs régulièrement
- Analyser les patterns d'assignation

### Évolutions possibles

- Système de recommandation automatique
- Historique des assignations
- Gestion des réassignations
- Intégration avec un calendrier
- Notifications par email

## Support

Pour toute question ou problème :

1. Vérifier les logs d'erreur
2. Tester avec le script de test
3. Consulter la documentation API
4. Contacter l'équipe de développement 