from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rh_service.models import InternKpiEvaluation
from shared.models import Stage, Entreprise
from decimal import Decimal
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Test KPI evaluations system'

    def handle(self, *args, **options):
        self.stdout.write('Testing KPI evaluations system...')
        
        # Check if we have any KPI evaluations
        evaluations_count = InternKpiEvaluation.objects.count()
        self.stdout.write(f'Current KPI evaluations count: {evaluations_count}')
        
        # Check if we have any RH users
        rh_users = User.objects.filter(role='rh')
        self.stdout.write(f'RH users count: {rh_users.count()}')
        
        # Check if we have any stagiaires
        stagiaires = User.objects.filter(role='stagiaire')
        self.stdout.write(f'Stagiaires count: {stagiaires.count()}')
        
        # Check if we have any stages
        stages = Stage.objects.all()
        self.stdout.write(f'Stages count: {stages.count()}')
        
        # Check if we have any entreprises
        entreprises = Entreprise.objects.all()
        self.stdout.write(f'Entreprises count: {entreprises.count()}')
        
        # Show some sample data
        if rh_users.exists():
            rh_user = rh_users.first()
            self.stdout.write(f'Sample RH user: {rh_user.email} - Entreprise: {rh_user.entreprise}')
        
        if stagiaires.exists():
            stagiaire = stagiaires.first()
            self.stdout.write(f'Sample stagiaire: {stagiaire.email} - Entreprise: {stagiaire.entreprise}')
        
        if stages.exists():
            stage = stages.first()
            self.stdout.write(f'Sample stage: {stage.title} - Company: {stage.company_entreprise}')
        
        # Try to create a test KPI evaluation if we have the necessary data
        if rh_users.exists() and stagiaires.exists() and stages.exists():
            try:
                rh_user = rh_users.first()
                stagiaire = stagiaires.first()
                stage = stages.first()
                
                # Create a test KPI evaluation
                evaluation = InternKpiEvaluation.objects.create(
                    intern=stagiaire,
                    evaluator=rh_user,
                    stage=stage,
                    evaluation_date=date.today(),
                    delivery_satisfaction_rate=Decimal('4.0'),
                    deadline_respect_rate=Decimal('3.5'),
                    learning_capacity=Decimal('4.5'),
                    initiative_taking=Decimal('3.0'),
                    professional_behavior=Decimal('4.0'),
                    adaptability=Decimal('3.5'),
                    comments="Test evaluation"
                )
                
                self.stdout.write(f'Successfully created test KPI evaluation: {evaluation.id}')
                self.stdout.write(f'Total score: {evaluation.total_score}')
                self.stdout.write(f'Interpretation: {evaluation.interpretation}')
                
            except Exception as e:
                self.stdout.write(f'Error creating test KPI evaluation: {e}')
        
        self.stdout.write('KPI evaluations system test completed.')
