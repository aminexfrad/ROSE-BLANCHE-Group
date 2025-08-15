"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
import random

from auth_service.models import User
from demande_service.models import Demande
from shared.models import Stage, Step, Document, Evaluation, KPIQuestion, Testimonial, Notification, PFEDocument, OffreStage, PFEReport


class Command(BaseCommand):
    help = 'Populate database with sample data for dashboard testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create users if they don't exist
        self.create_users()
        
        # Create demandes and stages
        self.create_stages()
        
        # Create steps for each stage
        self.create_steps()
        
        # Create documents
        self.create_documents()
        
        # Create KPI questions
        self.create_kpi_questions()
        
        # Create evaluations
        self.create_evaluations()
        
        # Create testimonials
        self.create_testimonials()
        
        # Create notifications
        self.create_notifications()
        
        # Create PFE documents
        self.create_pfe_documents()
        
        # Create PFE reports
        self.create_pfe_reports()
        
        # Create internship offers
        self.create_internship_offers()
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))

    def create_users(self):
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@stagebloom.com',
            defaults={
                'nom': 'Admin',
                'prenom': 'System',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')

        # Create RH users
        rh_users_data = [
            {'email': 'rh1@stagebloom.com', 'nom': 'Dupont', 'prenom': 'Marie'},
            {'email': 'rh2@stagebloom.com', 'nom': 'Martin', 'prenom': 'Sophie'},
        ]
        
        for rh_data in rh_users_data:
            rh_user, created = User.objects.get_or_create(
                email=rh_data['email'],
                defaults={
                    'nom': rh_data['nom'],
                    'prenom': rh_data['prenom'],
                    'role': 'rh',
                }
            )
            if created:
                rh_user.set_password('rh123')
                rh_user.save()
                self.stdout.write(f'Created RH user: {rh_user.get_full_name()}')

        # Create tuteur users
        tuteur_users_data = [
            {'email': 'tuteur1@stagebloom.com', 'nom': 'Bernard', 'prenom': 'Jean'},
            {'email': 'tuteur2@stagebloom.com', 'nom': 'Petit', 'prenom': 'Pierre'},
            {'email': 'tuteur3@stagebloom.com', 'nom': 'Moreau', 'prenom': 'Claude'},
        ]
        
        for tuteur_data in tuteur_users_data:
            tuteur_user, created = User.objects.get_or_create(
                email=tuteur_data['email'],
                defaults={
                    'nom': tuteur_data['nom'],
                    'prenom': tuteur_data['prenom'],
                    'role': 'tuteur',
                }
            )
            if created:
                tuteur_user.set_password('tuteur123')
                tuteur_user.save()
                self.stdout.write(f'Created tuteur user: {tuteur_user.get_full_name()}')

        # Create stagiaire users
        stagiaire_users_data = [
            {'email': 'stagiaire1@stagebloom.com', 'nom': 'Dubois', 'prenom': 'Alice', 'institut': 'ESI', 'specialite': 'Informatique'},
            {'email': 'stagiaire2@stagebloom.com', 'nom': 'Leroy', 'prenom': 'Thomas', 'institut': 'ENSA', 'specialite': 'Génie Civil'},
            {'email': 'stagiaire3@stagebloom.com', 'nom': 'Garcia', 'prenom': 'Emma', 'institut': 'EMSI', 'specialite': 'Management'},
            {'email': 'stagiaire4@stagebloom.com', 'nom': 'Roux', 'prenom': 'Lucas', 'institut': 'ESI', 'specialite': 'Informatique'},
            {'email': 'stagiaire5@stagebloom.com', 'nom': 'Simon', 'prenom': 'Léa', 'institut': 'ENSA', 'specialite': 'Architecture'},
        ]
        
        for stagiaire_data in stagiaire_users_data:
            stagiaire_user, created = User.objects.get_or_create(
                email=stagiaire_data['email'],
                defaults={
                    'nom': stagiaire_data['nom'],
                    'prenom': stagiaire_data['prenom'],
                    'role': 'stagiaire',
                    'institut': stagiaire_data['institut'],
                    'specialite': stagiaire_data['specialite'],
                }
            )
            if created:
                stagiaire_user.set_password('stagiaire123')
                stagiaire_user.save()
                self.stdout.write(f'Created stagiaire user: {stagiaire_user.get_full_name()}')

    def create_stages(self):
        stagiaires = User.objects.filter(role='stagiaire')
        tuteurs = User.objects.filter(role='tuteur')
        
        companies = ['Rose Blanche Group']
        locations = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Hammamet', 'Nabeul']
        
        for i, stagiaire in enumerate(stagiaires):
            # Create demande first
            demande, created = Demande.objects.get_or_create(
                nom=stagiaire.nom,
                prenom=stagiaire.prenom,
                email=stagiaire.email,
                defaults={
                    'telephone': f'06{random.randint(10000000, 99999999)}',
                    'cin': f'AB{random.randint(100000, 999999)}',
                    'institut': stagiaire.institut,
                    'specialite': stagiaire.specialite,
                    'type_stage': random.choice(['PFE', 'Stage d\'été', 'Stage de fin d\'études']),
                    'niveau': random.choice(['Bac+3', 'Bac+4', 'Bac+5']),
                    'date_debut': date.today() - timedelta(days=random.randint(30, 180)),
                    'date_fin': date.today() + timedelta(days=random.randint(30, 180)),
                    'status': 'approved',
                }
            )
            
            # Create stage
            stage, created = Stage.objects.get_or_create(
                demande=demande,
                defaults={
                    'stagiaire': stagiaire,
                    'tuteur': random.choice(tuteurs) if tuteurs.exists() else None,
                    'title': f'Stage en {random.choice(["Développement", "Data Science", "DevOps", "UI/UX", "Marketing"])}',
                    'company': random.choice(companies),
                    'location': random.choice(locations),
                    'description': f'Stage de {stagiaire.specialite} chez {random.choice(companies)}',
                    'start_date': demande.date_debut,
                    'end_date': demande.date_fin,
                    'status': random.choice(['active', 'completed', 'active', 'active']),
                    'progress': random.randint(0, 100),
                }
            )
            
            if created:
                self.stdout.write(f'Created stage for {stagiaire.get_full_name()}')

    def create_steps(self):
        stages = Stage.objects.all()
        step_templates = [
            {'title': 'Analyse des besoins', 'description': 'Comprendre les besoins du projet'},
            {'title': 'Conception', 'description': 'Concevoir l\'architecture du système'},
            {'title': 'Développement', 'description': 'Implémenter les fonctionnalités'},
            {'title': 'Tests', 'description': 'Tester les fonctionnalités développées'},
            {'title': 'Déploiement', 'description': 'Mettre en production'},
            {'title': 'Documentation', 'description': 'Rédiger la documentation'},
        ]
        
        for stage in stages:
            for i, step_template in enumerate(step_templates):
                step, created = Step.objects.get_or_create(
                    stage=stage,
                    title=step_template['title'],
                    defaults={
                        'description': step_template['description'],
                        'order': i + 1,
                        'status': random.choice(['pending', 'in_progress', 'completed', 'validated']),
                        'due_date': stage.start_date + timedelta(days=random.randint(10, 50)),
                    }
                )
                
                if created and step.status in ['completed', 'validated']:
                    step.completed_date = stage.start_date + timedelta(days=random.randint(10, 50))
                    step.save()

    def create_documents(self):
        stages = Stage.objects.all()
        document_types = ['rapport', 'fiche_suivi', 'pfe', 'presentation', 'other']
        
        for stage in stages:
            for i in range(random.randint(1, 4)):
                doc, created = Document.objects.get_or_create(
                    stage=stage,
                    title=f'Document {i + 1} - {stage.title}',
                    defaults={
                        'description': f'Description du document {i + 1}',
                        'document_type': random.choice(document_types),
                        'uploaded_by': stage.stagiaire,
                        'is_approved': random.choice([True, False]),
                        'file_size': random.randint(100000, 5000000),
                    }
                )
                
                if created and doc.is_approved:
                    doc.approved_by = stage.tuteur
                    doc.approved_at = timezone.now()
                    doc.save()

    def create_kpi_questions(self):
        questions_data = [
            # Technical skills
            {'question': 'Maîtrise des technologies utilisées', 'category': 'technical'},
            {'question': 'Qualité du code produit', 'category': 'technical'},
            {'question': 'Résolution de problèmes techniques', 'category': 'technical'},
            
            # Soft skills
            {'question': 'Autonomie dans le travail', 'category': 'soft_skills'},
            {'question': 'Capacité d\'adaptation', 'category': 'soft_skills'},
            {'question': 'Gestion du stress', 'category': 'soft_skills'},
            
            # Communication
            {'question': 'Communication orale', 'category': 'communication'},
            {'question': 'Communication écrite', 'category': 'communication'},
            {'question': 'Présentation des résultats', 'category': 'communication'},
            
            # Teamwork
            {'question': 'Collaboration en équipe', 'category': 'teamwork'},
            {'question': 'Partage des connaissances', 'category': 'teamwork'},
            {'question': 'Respect des délais', 'category': 'teamwork'},
            
            # Leadership
            {'question': 'Prise d\'initiative', 'category': 'leadership'},
            {'question': 'Encadrement d\'équipe', 'category': 'leadership'},
            
            # Adaptability
            {'question': 'Adaptation aux nouvelles technologies', 'category': 'adaptability'},
            {'question': 'Flexibilité face aux changements', 'category': 'adaptability'},
        ]
        
        for i, q_data in enumerate(questions_data):
            question, created = KPIQuestion.objects.get_or_create(
                question_text=q_data['question'],
                defaults={
                    'category': q_data['category'],
                    'order': i + 1,
                    'is_active': True,
                }
            )
            
            if created:
                self.stdout.write(f'Created KPI question: {q_data["question"]}')

    def create_evaluations(self):
        stages = Stage.objects.all()
        evaluation_types = ['stagiaire_self', 'tuteur_stagiaire', 'stagiaire_tuteur', 'rh_global']
        
        for stage in stages:
            for eval_type in evaluation_types:
                if eval_type == 'stagiaire_self':
                    evaluator = stage.stagiaire
                    evaluated = stage.stagiaire
                elif eval_type == 'tuteur_stagiaire':
                    evaluator = stage.tuteur
                    evaluated = stage.stagiaire
                elif eval_type == 'stagiaire_tuteur':
                    evaluator = stage.stagiaire
                    evaluated = stage.tuteur
                else:  # rh_global
                    evaluator = User.objects.filter(role='rh').first()
                    evaluated = stage.stagiaire
                
                if evaluator and evaluated:
                    evaluation, created = Evaluation.objects.get_or_create(
                        stage=stage,
                        evaluator=evaluator,
                        evaluated=evaluated,
                        evaluation_type=eval_type,
                        defaults={
                            'scores': {'technical': random.randint(1, 5), 'soft_skills': random.randint(1, 5)},
                            'comments': f'Évaluation {eval_type} pour {stage.title}',
                            'overall_score': random.randint(1, 5),
                            'is_completed': random.choice([True, False]),
                        }
                    )
                    
                    if created and evaluation.is_completed:
                        evaluation.completed_at = timezone.now()
                        evaluation.save()

    def create_testimonials(self):
        stages = Stage.objects.filter(status='completed')
        
        testimonial_templates = [
            {
                'title': 'Excellente expérience de stage',
                'content': 'Ce stage m\'a permis d\'acquérir de nombreuses compétences techniques et de découvrir le monde professionnel. L\'équipe était très accueillante et j\'ai pu travailler sur des projets passionnants.',
                'testimonial_type': 'text'
            },
            {
                'title': 'Stage enrichissant',
                'content': 'Une expérience très enrichissante qui m\'a permis de mettre en pratique mes connaissances théoriques. Je recommande vivement cette entreprise pour un stage.',
                'testimonial_type': 'text'
            },
            {
                'title': 'Découverte du monde professionnel',
                'content': 'Ce stage a été une excellente introduction au monde professionnel. J\'ai pu développer mes compétences techniques et soft skills.',
                'testimonial_type': 'text'
            }
        ]
        
        for stage in stages:
            template = random.choice(testimonial_templates)
            testimonial, created = Testimonial.objects.get_or_create(
                stage=stage,
                author=stage.stagiaire,
                title=template['title'],
                defaults={
                    'content': template['content'],
                    'testimonial_type': template['testimonial_type'],
                    'status': random.choice(['pending', 'approved', 'approved', 'approved']),
                }
            )
            
            if created:
                self.stdout.write(f'Created testimonial: {testimonial.title}')

    def create_notifications(self):
        users = User.objects.all()
        notification_types = ['info', 'success', 'warning', 'error']
        
        for user in users:
            for i in range(random.randint(1, 3)):
                notification, created = Notification.objects.get_or_create(
                    recipient=user,
                    title=f'Notification {i + 1}',
                    message=f'Ceci est un message de notification {i + 1} pour {user.get_full_name()}',
                    defaults={
                        'notification_type': random.choice(notification_types),
                        'is_read': random.choice([True, False]),
                    }
                )
                
                if created:
                    self.stdout.write(f'Created notification for {user.get_full_name()}')

    def create_pfe_documents(self):
        specialities = ['Informatique', 'Génie Civil', 'Management', 'Architecture', 'Électrique']
        authors = ['Ahmed Alami', 'Fatima Zahra', 'Youssef Benjelloun', 'Amina Tazi', 'Karim El Fassi']
        
        for i in range(20):
            pfe_doc, created = PFEDocument.objects.get_or_create(
                title=f'PFE {i+1}: {random.choice(["Système de gestion", "Application mobile", "Site web", "IA et ML", "IoT"])}',
                defaults={
                    'description': f'Description détaillée du projet PFE {i+1}',
                    'authors': random.choice(authors),
                    'year': random.randint(2020, 2024),
                    'speciality': random.choice(specialities),
                    'supervisor': f'Dr. {random.choice(["Bernard", "Petit", "Moreau"])}',
                    'keywords': 'PFE, projet, recherche, innovation',
                    'abstract': f'Résumé du projet PFE {i+1}',
                    'status': random.choice(['published', 'published', 'published', 'draft']),
                    'download_count': random.randint(0, 150),
                    'view_count': random.randint(50, 500),
                }
            )
            
            if created:
                self.stdout.write(f'Created PFE document: {pfe_doc.title}')

    def create_pfe_reports(self):
        """Create sample PFE reports for testing"""
        stages = Stage.objects.all()
        specialities = ['Informatique', 'Génie Civil', 'Management', 'Architecture', 'Électrique']
        statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'archived']
        
        pfe_titles = [
            'Système de gestion des ressources humaines',
            'Application mobile de e-commerce',
            'Plateforme de gestion de projets',
            'Système de reconnaissance faciale',
            'Application web de réservation en ligne',
            'Système de monitoring IoT',
            'Plateforme de formation en ligne',
            'Application de gestion de stock',
            'Système de paiement électronique',
            'Plateforme de collaboration en équipe'
        ]
        
        for i, stage in enumerate(stages):
            if i < len(pfe_titles):  # Limit to available titles
                report, created = PFEReport.objects.get_or_create(
                    stage=stage,
                    defaults={
                        'stagiaire': stage.stagiaire,
                        'tuteur': stage.tuteur,
                        'title': pfe_titles[i],
                        'abstract': f'Ce projet PFE présente une solution innovante pour {pfe_titles[i].lower()}. Le projet a été développé en utilisant les technologies modernes et suit les meilleures pratiques de développement.',
                        'keywords': 'PFE, développement, innovation, technologie',
                        'speciality': random.choice(specialities),
                        'year': random.randint(2022, 2024),
                        'status': random.choice(statuses),
                        'version': random.randint(1, 3),
                        'download_count': random.randint(0, 50),
                        'view_count': random.randint(10, 200),
                        'tuteur_feedback': 'Excellent travail, bien structuré et documenté.' if random.choice([True, False]) else '',
                        'stagiaire_comment': 'Projet très enrichissant qui m\'a permis d\'acquérir de nouvelles compétences.' if random.choice([True, False]) else '',
                        'rejection_reason': '' if random.choice([True, False]) else 'Manque de documentation technique',
                    }
                )
                
                # Set dates based on status
                if report.status in ['submitted', 'under_review', 'approved', 'rejected']:
                    report.submitted_at = timezone.now() - timedelta(days=random.randint(10, 60))
                    if report.status in ['under_review', 'approved', 'rejected']:
                        report.reviewed_at = report.submitted_at + timedelta(days=random.randint(1, 10))
                        if report.status == 'approved':
                            report.approved_at = report.reviewed_at + timedelta(days=random.randint(1, 5))
                    report.save()
                
                if created:
                    self.stdout.write(f'Created PFE report: {report.title}')

    def create_internship_offers(self):
        companies = [
            'Rose Blanche Group'
        ]
        
        specialities = ['Informatique', 'Génie Civil', 'Management', 'Architecture', 'Électrique', 'Mécanique', 'Chimie', 'Biologie']
        locations = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Hammamet', 'Nabeul', 'Gabès', 'Gafsa']
        durations = ['3 mois', '6 mois', '4 mois', '5 mois', 'Stage d\'été']
        
        for i in range(25):
            offre, created = OffreStage.objects.get_or_create(
                reference=f'REF{i+1:03d}',
                defaults={
                    'title': f'Stage en {random.choice(["Développement", "Data Science", "DevOps", "UI/UX", "Marketing"])}',
                    'description': f'Description détaillée du stage {i+1}',
                    'objectifs': f'Objectifs du stage {i+1}',
                    'keywords': 'stage, développement, formation, expérience',
                    'diplome': random.choice(['Bac+3', 'Bac+4', 'Bac+5']),
                    'specialite': random.choice(specialities),
                    'nombre_postes': random.randint(1, 3),
                    'ville': random.choice(locations),
                    'status': random.choice(['open', 'open', 'open', 'closed']),
                    'type': 'PFE',
                    'validated': random.choice([True, True, True, False]),
                }
            )
            
            if created:
                self.stdout.write(f'Created internship offer: {offre.title}') 