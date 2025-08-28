"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from .models import InternKpiEvaluation
from shared.models import Entreprise, Stage
from demande_service.models import Demande

User = get_user_model()

class InternKpiEvaluationModelTest(TestCase):
    """Tests pour le modèle InternKpiEvaluation"""
    
    def setUp(self):
        """Configuration initiale pour les tests"""
        # Créer une entreprise
        self.entreprise = Entreprise.objects.create(
            nom="Test Entreprise",
            description="Entreprise de test",
            secteur_activite="Technologie"
        )
        
        # Créer un utilisateur RH
        self.rh_user = User.objects.create_user(
            email="rh@test.com",
            password="testpass123",
            nom="RH",
            prenom="Test",
            role="rh",
            entreprise=self.entreprise
        )
        
        # Créer un utilisateur stagiaire
        self.stagiaire = User.objects.create_user(
            email="stagiaire@test.com",
            password="testpass123",
            nom="Stagiaire",
            prenom="Test",
            role="stagiaire",
            entreprise=self.entreprise
        )
        
        # Créer une demande de stage
        self.demande = Demande.objects.create(
            nom=self.stagiaire.nom,
            prenom=self.stagiaire.prenom,
            email=self.stagiaire.email,
            telephone="123456789",
            institut="Institut Test",
            specialite="Informatique",
            niveau="Bac+3",
            type_stage="Stage PFE",
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timezone.timedelta(days=30),
            stage_binome=False,
            status="approved",
            user_created=self.stagiaire,
            entreprise=self.entreprise
        )
        
        # Créer un stage
        self.stage = Stage.objects.create(
            demande=self.demande,
            stagiaire=self.stagiaire,
            title="Stage Test",
            description="Description du stage test",
            company_entreprise=self.entreprise,
            company_name="Test Entreprise",
            location="Paris",
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=30),
            status="active"
        )
    
    def test_create_evaluation(self):
        """Test de création d'une évaluation KPI"""
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date(),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.5,
            learning_capacity=3.5,
            initiative_taking=4.0,
            professional_behavior=4.5,
            adaptability=4.0,
            comments="Excellente performance globale"
        )
        
        self.assertEqual(evaluation.intern, self.stagiaire)
        self.assertEqual(evaluation.evaluator, self.rh_user)
        self.assertEqual(evaluation.stage, self.stage)
        self.assertEqual(evaluation.delivery_satisfaction_rate, Decimal('4.0'))
        self.assertEqual(evaluation.comments, "Excellente performance globale")
    
    def test_score_calculation(self):
        """Test du calcul automatique du score total"""
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date(),
            delivery_satisfaction_rate=4.0,  # 25% * 4.0 = 1.0
            deadline_respect_rate=4.5,       # 20% * 4.5 = 0.9
            learning_capacity=3.5,           # 15% * 3.5 = 0.525
            initiative_taking=4.0,           # 10% * 4.0 = 0.4
            professional_behavior=4.5,       # 15% * 4.5 = 0.675
            adaptability=4.0                 # 15% * 4.0 = 0.6
        )
        
        # Score total attendu : 1.0 + 0.9 + 0.525 + 0.4 + 0.675 + 0.6 = 4.1
        expected_score = Decimal('4.1')
        self.assertEqual(float(evaluation.total_score), float(expected_score))
    
    def test_interpretation_determination(self):
        """Test de la détermination automatique de l'interprétation"""
        # Test potentiel élevé (score >= 4.5)
        evaluation_high = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=1),
            delivery_satisfaction_rate=5.0,
            deadline_respect_rate=5.0,
            learning_capacity=5.0,
            initiative_taking=5.0,
            professional_behavior=5.0,
            adaptability=5.0
        )
        self.assertEqual(evaluation_high.interpretation, 'elevé')
        
        # Test bon potentiel (3.5 <= score < 4.5)
        evaluation_good = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=2),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        self.assertEqual(evaluation_good.interpretation, 'bon')
        
        # Test potentiel moyen (2.5 <= score < 3.5)
        evaluation_average = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=3),
            delivery_satisfaction_rate=3.0,
            deadline_respect_rate=3.0,
            learning_capacity=3.0,
            initiative_taking=3.0,
            professional_behavior=3.0,
            adaptability=3.0
        )
        self.assertEqual(evaluation_average.interpretation, 'moyen')
        
        # Test potentiel à renforcer (score < 2.5)
        evaluation_low = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=4),
            delivery_satisfaction_rate=2.0,
            deadline_respect_rate=2.0,
            learning_capacity=2.0,
            initiative_taking=2.0,
            professional_behavior=2.0,
            adaptability=2.0
        )
        self.assertEqual(evaluation_low.interpretation, 'à renforcer')
    
    def test_weights_summary(self):
        """Test du résumé des poids"""
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date(),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        
        weights = evaluation.get_weights_summary
        self.assertEqual(weights['delivery_satisfaction_rate']['percentage'], '25%')
        self.assertEqual(weights['deadline_respect_rate']['percentage'], '20%')
        self.assertEqual(weights['learning_capacity']['percentage'], '15%')
        self.assertEqual(weights['initiative_taking']['percentage'], '10%')
        self.assertEqual(weights['professional_behavior']['percentage'], '15%')
        self.assertEqual(weights['adaptability']['percentage'], '15%')
    
    def test_score_details(self):
        """Test des détails des scores"""
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date(),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        
        score_details = evaluation.get_score_details
        self.assertEqual(score_details['delivery_satisfaction_rate']['score'], Decimal('4.0'))
        self.assertEqual(score_details['delivery_satisfaction_rate']['weight'], 0.25)
        self.assertEqual(score_details['delivery_satisfaction_rate']['weighted_score'], 1.0)
    
    def test_string_representation(self):
        """Test de la représentation en chaîne"""
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date(),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        
        expected_string = f"Évaluation KPI de {self.stagiaire.get_full_name()} - {evaluation.evaluation_date}"
        self.assertEqual(str(evaluation), expected_string)
    
    def test_validation_constraints(self):
        """Test des contraintes de validation"""
        # Test que les scores sont entre 0 et 5
        # Django ne valide pas automatiquement les contraintes de base de données
        # Nous testons que le modèle accepte les valeurs dans la plage valide
        evaluation = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=5),
            delivery_satisfaction_rate=5.0,  # Score valide maximum
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        self.assertEqual(evaluation.delivery_satisfaction_rate, Decimal('5.0'))
        
        # Test avec score minimum valide
        evaluation_min = InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=6),
            delivery_satisfaction_rate=0.0,  # Score valide minimum
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        self.assertEqual(evaluation_min.delivery_satisfaction_rate, Decimal('0.0'))
    
    def test_unique_constraint(self):
        """Test de la contrainte d'unicité"""
        # Créer une première évaluation
        InternKpiEvaluation.objects.create(
            intern=self.stagiaire,
            evaluator=self.rh_user,
            stage=self.stage,
            evaluation_date=timezone.now().date() + timezone.timedelta(days=7),
            delivery_satisfaction_rate=4.0,
            deadline_respect_rate=4.0,
            learning_capacity=4.0,
            initiative_taking=4.0,
            professional_behavior=4.0,
            adaptability=4.0
        )
        
        # Tenter de créer une deuxième évaluation avec les mêmes valeurs (même date)
        # Cela devrait échouer à cause de la contrainte d'unicité
        with self.assertRaises(Exception):
            InternKpiEvaluation.objects.create(
                intern=self.stagiaire,
                evaluator=self.rh_user,
                stage=self.stage,
                evaluation_date=timezone.now().date() + timezone.timedelta(days=7),  # Même date
                delivery_satisfaction_rate=3.0,
                deadline_respect_rate=3.0,
                learning_capacity=3.0,
                initiative_taking=3.0,
                professional_behavior=3.0,
                adaptability=3.0
            )

class InternKpiEvaluationAdminTest(TestCase):
    """Tests pour l'interface d'administration"""
    
    def setUp(self):
        """Configuration initiale pour les tests admin"""
        # Créer un superuser
        self.admin_user = User.objects.create_superuser(
            email="admin@test.com",
            password="adminpass123",
            nom="Admin",
            prenom="Test"
        )
        
        # Créer une entreprise
        self.entreprise = Entreprise.objects.create(
            nom="Test Entreprise",
            description="Entreprise de test"
        )
        
        # Créer un utilisateur RH
        self.rh_user = User.objects.create_user(
            email="rh@test.com",
            password="testpass123",
            nom="RH",
            prenom="Test",
            role="rh",
            entreprise=self.entreprise
        )
        
        # Créer un utilisateur stagiaire
        self.stagiaire = User.objects.create_user(
            email="stagiaire@test.com",
            password="testpass123",
            nom="Stagiaire",
            prenom="Test",
            role="stagiaire",
            entreprise=self.entreprise
        )
    
    def test_admin_list_display(self):
        """Test de l'affichage dans la liste admin"""
        from django.contrib.admin.sites import AdminSite
        from .admin import InternKpiEvaluationAdmin
        
        admin_site = AdminSite()
        admin = InternKpiEvaluationAdmin(InternKpiEvaluation, admin_site)
        
        # Vérifier que les champs d'affichage sont corrects
        self.assertIn('intern_name', admin.list_display)
        self.assertIn('evaluator_name', admin.list_display)
        self.assertIn('total_score_display', admin.list_display)
        self.assertIn('interpretation_display', admin.list_display)
    
    def test_admin_search_fields(self):
        """Test des champs de recherche admin"""
        from django.contrib.admin.sites import AdminSite
        from .admin import InternKpiEvaluationAdmin
        
        admin_site = AdminSite()
        admin = InternKpiEvaluationAdmin(InternKpiEvaluation, admin_site)
        
        # Vérifier que les champs de recherche sont corrects
        self.assertIn('intern__nom', admin.search_fields)
        self.assertIn('evaluator__nom', admin.search_fields)
        self.assertIn('stage__title', admin.search_fields)
    
    def test_admin_list_filter(self):
        """Test des filtres admin"""
        from django.contrib.admin.sites import AdminSite
        from .admin import InternKpiEvaluationAdmin
        
        admin_site = AdminSite()
        admin = InternKpiEvaluationAdmin(InternKpiEvaluation, admin_site)
        
        # Vérifier que les filtres sont corrects
        self.assertIn('interpretation', admin.list_filter)
        self.assertIn('evaluation_date', admin.list_filter)
        self.assertIn('created_at', admin.list_filter)
