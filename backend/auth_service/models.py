"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('role') != 'admin':
            raise ValueError('Superuser must have role="admin".')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model with role-based authentication.
    Only users created by RH/admin can log in (no registration).
    """
    
    class Role(models.TextChoices):
        STAGIAIRE = 'stagiaire', _('Stagiaire')
        RH = 'rh', _('RH')
        TUTEUR = 'tuteur', _('Tuteur')
        ADMIN = 'admin', _('Admin')
    
    # Override username to use email
    username = None
    email = models.EmailField(_('email address'), unique=True, max_length=191)
    
    # Personal information
    nom = models.CharField(_('nom'), max_length=100)
    prenom = models.CharField(_('prénom'), max_length=100)
    telephone = models.CharField(_('téléphone'), max_length=20, blank=True)
    
    # Role and permissions
    role = models.CharField(
        _('rôle'),
        max_length=20,
        choices=Role.choices,
        default=Role.STAGIAIRE
    )
    
    # Academic/Professional information
    departement = models.CharField(_('département'), max_length=100, blank=True)
    institut = models.CharField(_('institut'), max_length=200, blank=True)
    specialite = models.CharField(_('spécialité'), max_length=200, blank=True)
    bio = models.TextField(_('biographie'), blank=True)
    
    # Company association (for RH users)
    entreprise = models.ForeignKey('shared.Entreprise', on_delete=models.SET_NULL, null=True, blank=True, related_name='users', verbose_name=_('entreprise'))
    
    # Profile image
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', blank=True, null=True)
    
    # Timestamps
    date_joined = models.DateTimeField(_('date d\'inscription'), auto_now_add=True)
    last_login = models.DateTimeField(_('dernière connexion'), auto_now=True)
    
    # Email verification
    is_email_verified = models.BooleanField(_('email vérifié'), default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'role']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('utilisateur')
        verbose_name_plural = _('utilisateurs')
        db_table = 'custom_user'
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"
    
    def get_full_name(self):
        return f"{self.prenom} {self.nom}"
    
    def get_short_name(self):
        return self.prenom
    
    @property
    def is_stagiaire(self):
        return self.role == self.Role.STAGIAIRE
    
    @property
    def is_rh(self):
        return self.role == self.Role.RH
    
    @property
    def is_tuteur(self):
        return self.role == self.Role.TUTEUR
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    def clean(self):
        """Validate that RH users have an entreprise assigned"""
        from django.core.exceptions import ValidationError
        
        if self.role == self.Role.RH and not self.entreprise:
            raise ValidationError(_('Les utilisateurs RH doivent être associés à une entreprise.'))
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
