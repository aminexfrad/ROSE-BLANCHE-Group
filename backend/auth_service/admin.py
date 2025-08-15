"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model"""
    
    list_display = ('email', 'nom', 'prenom', 'role', 'entreprise', 'is_active', 'date_joined')
    list_filter = ('role', 'entreprise', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'nom', 'prenom', 'entreprise__nom')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Informations personnelles'), {
            'fields': ('nom', 'prenom', 'telephone', 'avatar')
        }),
        (_('Rôle et permissions'), {
            'fields': ('role', 'entreprise', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Informations académiques/professionnelles'), {
            'fields': ('departement', 'institut', 'specialite', 'bio')
        }),
        (_('Dates importantes'), {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'nom', 'prenom', 'role', 'entreprise'),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined')
