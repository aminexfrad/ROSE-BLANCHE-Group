"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from shared.models import User, Stage, Document, Evaluation, Testimonial

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get real data from database
            total_users = User.objects.count()
            total_stages = Stage.objects.count()
            active_stages = Stage.objects.filter(status='active').count()
            completed_stages = Stage.objects.filter(status='completed').count()
            
            # Calculate average progression
            avg_progression = Stage.objects.aggregate(avg=Avg('progress'))['avg'] or 0
            
            # Recent activity (last 7 days)
            seven_days_ago = timezone.now() - timedelta(days=7)
            recent_stages = Stage.objects.filter(created_at__gte=seven_days_ago).count()
            
            # Status distribution
            status_stats = []
            for status_choice in Stage.Status.choices:
                count = Stage.objects.filter(status=status_choice[0]).count()
                if count > 0:
                    status_stats.append({
                        "status": status_choice[0],
                        "count": count
                    })
            
            # Role distribution
            role_stats = []
            for role_choice in User.Role.choices:
                count = User.objects.filter(role=role_choice[0]).count()
                if count > 0:
                    role_stats.append({
                        "role": role_choice[0],
                        "count": count
                    })
            
            return Response({
                "total_users": total_users,
                "total_stages": total_stages,
                "recent_stages": recent_stages,
                "active_stages": active_stages,
                "completed_stages": completed_stages,
                "avg_progression": round(avg_progression, 1),
                "status_stats": status_stats,
                "role_stats": role_stats
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching dashboard data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminDatabaseStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Calculate database statistics
            total_users = User.objects.count()
            total_stages = Stage.objects.count()
            total_documents = Document.objects.count()
            total_evaluations = Evaluation.objects.count()
            total_testimonials = Testimonial.objects.count()
            
            # Calculate sizes (mock data for now)
            db_stats = {
                "taille_totale": "2.4 GB",
                "croissance_mensuelle": "+156 MB ce mois",
                "connexions_actives": 23,
                "connexions_max": 100,
                "derniere_sauvegarde": "2h",
                "statut_sauvegarde": "Succès",
                "performance": "Optimal",
                "temps_reponse": "45ms",
                "tables": [
                    {
                        "nom": "Utilisateurs",
                        "entrees": total_users,
                        "taille": "45 MB",
                        "croissance": "+2.3%",
                        "pourcentage_utilisation": 75
                    },
                    {
                        "nom": "Stages",
                        "entrees": total_stages,
                        "taille": "23 MB",
                        "croissance": "+5.1%",
                        "pourcentage_utilisation": 60
                    },
                    {
                        "nom": "Documents",
                        "entrees": total_documents,
                        "taille": "1.2 GB",
                        "croissance": "+8.7%",
                        "pourcentage_utilisation": 85
                    },
                    {
                        "nom": "Évaluations",
                        "entrees": total_evaluations,
                        "taille": "12 MB",
                        "croissance": "+3.2%",
                        "pourcentage_utilisation": 45
                    },
                    {
                        "nom": "Témoignages",
                        "entrees": total_testimonials,
                        "taille": "8 MB",
                        "croissance": "+1.8%",
                        "pourcentage_utilisation": 30
                    }
                ],
                "sauvegardes": [
                    {
                        "date": "2024-01-15 14:30",
                        "type": "Automatique",
                        "taille": "2.4 GB",
                        "statut": "succès",
                        "duree": "12 min"
                    },
                    {
                        "date": "2024-01-14 14:30",
                        "type": "Automatique",
                        "taille": "2.3 GB",
                        "statut": "succès",
                        "duree": "11 min"
                    },
                    {
                        "date": "2024-01-13 14:30",
                        "type": "Automatique",
                        "taille": "2.3 GB",
                        "statut": "succès",
                        "duree": "13 min"
                    },
                    {
                        "date": "2024-01-12 09:15",
                        "type": "Manuel",
                        "taille": "2.2 GB",
                        "statut": "succès",
                        "duree": "15 min"
                    }
                ],
                "metriques": {
                    "requetes_par_seconde": 45.2,
                    "temps_reponse_moyen": "45ms",
                    "cache_hit_ratio": 98.5,
                    "connexions_utilisees": 23,
                    "connexions_max": 100,
                    "espace_libre": "7.6 GB"
                }
            }
            
            return Response(db_stats)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching database stats: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminPFEBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Mock PFE books data for now
            pfe_books = [
                {
                    "id": 1,
                    "titre": "Développement d'une application mobile de gestion des stages",
                    "entreprise": "TechCorp Solutions",
                    "specialite": "Informatique",
                    "niveau": "Licence",
                    "date_ajout": "2024-01-15",
                    "statut": "publié",
                    "telechargements": 45,
                    "fichier": "pfe_mobile_app.pdf",
                    "description": "Application mobile pour la gestion des stages étudiants"
                },
                {
                    "id": 2,
                    "titre": "Étude et conception d'un système de surveillance IoT",
                    "entreprise": "InnovateTech",
                    "specialite": "Électronique",
                    "niveau": "Master",
                    "date_ajout": "2024-01-10",
                    "statut": "publié",
                    "telechargements": 32,
                    "fichier": "pfe_iot_system.pdf",
                    "description": "Système IoT pour la surveillance industrielle"
                },
                {
                    "id": 3,
                    "titre": "Optimisation des processus de production industrielle",
                    "entreprise": "ManufacturingPro",
                    "specialite": "Génie Industriel",
                    "niveau": "Licence",
                    "date_ajout": "2024-01-08",
                    "statut": "en_attente",
                    "telechargements": 0,
                    "fichier": "pfe_production.pdf",
                    "description": "Optimisation des processus de production"
                }
            ]
            
            return Response(pfe_books)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching PFE books: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminPFEBooksStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Mock PFE books statistics
            stats = {
                "total_pfe": 127,
                "publies": 98,
                "en_attente": 15,
                "telechargements_mois": 1234,
                "croissance_mensuelle": 8
            }
            
            return Response(stats)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching PFE books stats: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminPFEBookDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pfe_id):
        try:
            # Mock PFE book detail
            pfe_book = {
                "id": pfe_id,
                "titre": "Développement d'une application mobile de gestion des stages",
                "entreprise": "TechCorp Solutions",
                "specialite": "Informatique",
                "niveau": "Licence",
                "date_ajout": "2024-01-15",
                "statut": "publié",
                "telechargements": 45,
                "fichier": "pfe_mobile_app.pdf",
                "description": "Application mobile pour la gestion des stages étudiants"
            }
            
            return Response(pfe_book)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching PFE book: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pfe_id):
        try:
            # Mock deletion
            return Response({"message": "PFE book deleted successfully"})
            
        except Exception as e:
            return Response(
                {'error': f'Error deleting PFE book: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminDatabaseBackupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Mock backup creation
            return Response({"message": "Backup created successfully"})
            
        except Exception as e:
            return Response(
                {'error': f'Error creating backup: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 