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
from shared.models import Stage, Step, Document, Evaluation, KPIQuestion, Testimonial, Notification, PFEDocument, OffreStage


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
        
        companies = ['Microsoft', 'Google', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'SpaceX']
        locations = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir']
        
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
        step_titles = [
            'Analyse des besoins',
            'Conception de l\'architecture',
            'Développement du prototype',
            'Tests unitaires',
            'Tests d\'intégration',
            'Documentation technique',
            'Présentation finale',
            'Déploiement en production'
        ]
        
        for stage in stages:
            for i in range(random.randint(4, 8)):
                step, created = Step.objects.get_or_create(
                    stage=stage,
                    order=i + 1,
                    defaults={
                        'title': step_titles[i],
                        'description': f'Description de l\'étape: {step_titles[i]}',
                        'status': random.choice(['pending', 'in_progress', 'completed', 'validated']),
                        'due_date': stage.start_date + timedelta(days=random.randint(10, 50)),
                    }
                )
                
                if created and step.status in ['completed', 'validated']:
                    step.completed_date = stage.start_date + timedelta(days=random.randint(10, 40))
                    if step.status == 'validated':
                        step.validated_date = step.completed_date + timedelta(days=random.randint(1, 5))
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

    def create_evaluations(self):
        stages = Stage.objects.all()
        evaluation_types = ['stagiaire_self', 'tuteur_stagiaire', 'stagiaire_tuteur', 'rh_global']
        
        for stage in stages:
            # Create self-evaluation
            if random.choice([True, False]):
                scores = {f'question_{i}': random.randint(3, 5) for i in range(1, 6)}
                eval_self, created = Evaluation.objects.get_or_create(
                    stage=stage,
                    evaluator=stage.stagiaire,
                    evaluated=stage.stagiaire,
                    evaluation_type='stagiaire_self',
                    defaults={
                        'scores': scores,
                        'comments': 'Auto-évaluation positive du stage',
                        'overall_score': sum(scores.values()) / len(scores),
                        'is_completed': True,
                        'completed_at': timezone.now(),
                    }
                )
            
            # Create tuteur evaluation of stagiaire
            if stage.tuteur and random.choice([True, False]):
                scores = {f'question_{i}': random.randint(3, 5) for i in range(1, 6)}
                eval_tuteur, created = Evaluation.objects.get_or_create(
                    stage=stage,
                    evaluator=stage.tuteur,
                    evaluated=stage.stagiaire,
                    evaluation_type='tuteur_stagiaire',
                    defaults={
                        'scores': scores,
                        'comments': 'Évaluation positive du stagiaire',
                        'overall_score': sum(scores.values()) / len(scores),
                        'is_completed': True,
                        'completed_at': timezone.now(),
                    }
                )

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
            if random.choice([True, False]):
                template = random.choice(testimonial_templates)
                testimonial, created = Testimonial.objects.get_or_create(
                    stage=stage,
                    author=stage.stagiaire,
                    defaults={
                        'title': template['title'],
                        'content': template['content'],
                        'testimonial_type': template['testimonial_type'],
                        'status': random.choice(['pending', 'approved', 'approved']),
                    }
                )
                
                if created and testimonial.status == 'approved':
                    testimonial.moderated_by = User.objects.filter(role='rh').first()
                    testimonial.moderated_at = timezone.now()
                    testimonial.save()

    def create_notifications(self):
        users = User.objects.all()
        notification_templates = [
            {
                'title': 'Nouveau document téléversé',
                'message': 'Un nouveau document a été téléversé pour votre stage.',
                'notification_type': 'info'
            },
            {
                'title': 'Étape validée',
                'message': 'Félicitations ! Une étape de votre stage a été validée.',
                'notification_type': 'success'
            },
            {
                'title': 'Évaluation en attente',
                'message': 'Vous avez une évaluation en attente de completion.',
                'notification_type': 'warning'
            },
            {
                'title': 'Stage terminé',
                'message': 'Votre stage a été marqué comme terminé.',
                'notification_type': 'success'
            }
        ]
        
        for user in users:
            for i in range(random.randint(0, 3)):
                template = random.choice(notification_templates)
                notification, created = Notification.objects.get_or_create(
                    recipient=user,
                    title=template['title'],
                    defaults={
                        'message': template['message'],
                        'notification_type': template['notification_type'],
                        'is_read': random.choice([True, False]),
                    }
                )

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

    def create_internship_offers(self):
        companies = [
            'Rose Blanche Group', 'Microsoft Maroc', 'Google Casablanca', 'Apple Store Maroc',
            'Amazon Web Services', 'Meta Africa', 'Netflix MENA', 'Tesla Morocco',
            'SpaceX Africa', 'Oracle Maroc', 'IBM Morocco', 'Intel Casablanca',
            'SAP Maroc', 'Adobe Morocco', 'Salesforce MENA', 'Shopify Africa'
        ]
        
        specialities = ['Informatique', 'Génie Civil', 'Management', 'Architecture', 'Électrique', 'Mécanique', 'Chimie', 'Biologie']
        locations = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda']
        durations = ['3 mois', '6 mois', '4 mois', '5 mois', 'Stage d\'été']
        
        for i in range(25):
            offre, created = OffreStage.objects.get_or_create(
                title=f'Stage {i+1}: {random.choice(["Développeur Full Stack", "Data Scientist", "DevOps Engineer", "UI/UX Designer", "Marketing Digital", "Ingénieur Civil", "Architecte", "Ingénieur Électrique"])}',
                defaults={
                    'description': f'Description détaillée du poste de stage {i+1}. Nous recherchons un(e) stagiaire motivé(e) pour rejoindre notre équipe dynamique.',
                    'speciality': random.choice(specialities),
                    'location': random.choice(locations),
                    'duration': random.choice(durations),
                    'salary': f'{random.randint(2000, 8000)} MAD/mois',
                    'requirements': f'Étudiant(e) en {random.choice(specialities)}, niveau Bac+3 minimum, maîtrise des outils informatiques, esprit d\'équipe.',
                    'benefits': 'Environnement de travail moderne, formation continue, possibilité d\'embauche, tickets restaurant.',
                    'company': random.choice(companies),
                    'contact_email': f'rh@{random.choice(companies).lower().replace(" ", "").replace("é", "e")}.com',
                    'contact_phone': f'+212 5{random.randint(20, 29)}{random.randint(1000000, 9999999)}',
                    'status': random.choice(['active', 'active', 'active', 'inactive']),
                    'view_count': random.randint(10, 200),
                    'application_count': random.randint(0, 15),
                }
            )
            
            if created:
                self.stdout.write(f'Created internship offer: {offre.title} at {offre.company}') 