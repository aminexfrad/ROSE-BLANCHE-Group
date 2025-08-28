"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import permissions

class IsRHUser(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier que l'utilisateur est un responsable RH
    """
    
    def has_permission(self, request, view):
        """Vérifier les permissions au niveau de la vue"""
        # L'utilisateur doit être authentifié
        if not request.user.is_authenticated:
            return False
        
        # L'utilisateur doit avoir le rôle 'rh' ou 'admin'
        return request.user.role in ['rh', 'admin']
    
    def has_object_permission(self, request, view, obj):
        """Vérifier les permissions au niveau de l'objet"""
        # Les admins ont accès à tout
        if request.user.role == 'admin':
            return True
        
        # Les RH ne peuvent accéder qu'aux données de leur entreprise
        if request.user.role == 'rh':
            # Vérifier si l'objet a une entreprise
            if hasattr(obj, 'intern') and obj.intern.entreprise:
                return obj.intern.entreprise == request.user.entreprise
            
            if hasattr(obj, 'stage') and obj.stage.company_entreprise:
                return obj.stage.company_entreprise == request.user.entreprise
            
            # Si pas d'entreprise associée, refuser l'accès
            return False
        
        return False

class IsRHEvaluator(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur RH est l'évaluateur de l'évaluation
    """
    
    def has_object_permission(self, request, view, obj):
        """Vérifier que l'utilisateur est l'évaluateur de l'évaluation"""
        # Les admins ont accès à tout
        if request.user.role == 'admin':
            return True
        
        # Les RH ne peuvent modifier que leurs propres évaluations
        if request.user.role == 'rh':
            return obj.evaluator == request.user
        
        return False

class CanCreateEvaluation(permissions.BasePermission):
    """
    Permission pour vérifier qu'un utilisateur RH peut créer une évaluation
    """
    
    def has_permission(self, request, view):
        """Vérifier les permissions pour la création"""
        if not request.user.is_authenticated:
            return False
        
        # Seuls les RH et admins peuvent créer des évaluations
        if request.user.role not in ['rh', 'admin']:
            return False
        
        # Pour les RH, vérifier qu'ils ont une entreprise assignée
        if request.user.role == 'rh' and not request.user.entreprise:
            return False
        
        return True
