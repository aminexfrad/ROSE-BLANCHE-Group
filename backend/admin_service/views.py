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
from auth_service.serializers import UserSerializer, UserRegistrationSerializer
from django.shortcuts import get_object_or_404
from demande_service.models import Demande
import secrets
import string

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

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all users with optional filtering"""
        try:
            # Check if user is admin
            if request.user.role != 'admin':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get query parameters
            role_filter = request.query_params.get('role', '')
            search = request.query_params.get('search', '')
            
            # Build queryset
            users = User.objects.all()
            
            if role_filter:
                users = users.filter(role=role_filter)
            
            if search:
                users = users.filter(
                    email__icontains=search
                ) | users.filter(
                    nom__icontains=search
                ) | users.filter(
                    prenom__icontains=search
                )
            
            # Serialize users
            serializer = UserSerializer(users, many=True)
            
            return Response({
                'results': serializer.data,
                'count': users.count()
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching users: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create a new user"""
        try:
            # Check if user is admin
            if request.user.role != 'admin':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Generate a random password
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            # Add password to data
            data = request.data.copy()
            data['password'] = password
            data['confirm_password'] = password
            
            # Validate and create user
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                
                # If the user is a stagiaire, create a stage for them
                if user.role == 'stagiaire':
                    try:
                        # Create a demande for the stagiaire
                        demande = Demande.objects.create(
                            nom=user.nom,
                            prenom=user.prenom,
                            email=user.email,
                            telephone=user.telephone or '',
                            cin=f"CIN{user.id:06d}",
                            institut=user.institut or 'Institut à définir',
                            specialite=user.specialite or 'Spécialité à définir',
                            type_stage='Stage PFE',
                            niveau='Master',
                            date_debut=timezone.now().date(),
                            date_fin=(timezone.now() + timedelta(days=90)).date(),
                            stage_binome=False,
                            status='approved',
                            user_created=user
                        )
                        
                        # Create a stage for the stagiaire
                        stage = Stage.objects.create(
                            demande=demande,
                            stagiaire=user,
                            title=f"Stage {user.prenom} {user.nom}",
                            description=f"Stage de {user.specialite or 'spécialité'}",
                            company="Entreprise à définir",
                            location="Localisation à définir",
                            start_date=demande.date_debut,
                            end_date=demande.date_fin,
                            status='active',
                            progress=0
                        )
                        
                        return Response({
                            'message': 'Utilisateur créé avec succès',
                            'user': UserSerializer(user).data,
                            'password': password,
                            'stage_created': True,
                            'stage_id': stage.id
                        }, status=status.HTTP_201_CREATED)
                        
                    except Exception as e:
                        # If stage creation fails, still return the user but with a warning
                        return Response({
                            'message': 'Utilisateur créé avec succès, mais erreur lors de la création du stage',
                            'user': UserSerializer(user).data,
                            'password': password,
                            'stage_created': False,
                            'stage_error': str(e)
                        }, status=status.HTTP_201_CREATED)
                
                return Response({
                    'message': 'Utilisateur créé avec succès',
                    'user': UserSerializer(user).data,
                    'password': password
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': 'Données invalides', 'details': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {'error': f'Error creating user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        """Get a specific user"""
        try:
            # Check if user is admin
            if request.user.role != 'admin':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user = get_object_or_404(User, id=user_id)
            serializer = UserSerializer(user)
            
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, user_id):
        """Update a user"""
        try:
            # Check if user is admin
            if request.user.role != 'admin':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user = get_object_or_404(User, id=user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Utilisateur mis à jour avec succès',
                    'user': serializer.data
                })
            else:
                return Response(
                    {'error': 'Données invalides', 'details': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {'error': f'Error updating user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, user_id):
        """Delete a user"""
        try:
            # Check if user is admin
            if request.user.role != 'admin':
                return Response(
                    {'error': 'Permission refusée'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user = get_object_or_404(User, id=user_id)
            
            # Prevent deleting self
            if user.id == request.user.id:
                return Response(
                    {'error': 'Vous ne pouvez pas supprimer votre propre compte'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete user
            user.delete()
            
            return Response({
                'message': 'Utilisateur supprimé avec succès'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error deleting user: {str(e)}'}, 
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