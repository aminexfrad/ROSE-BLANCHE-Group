"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

"""
Security utilities for input validation, sanitization, and security checks.
"""
import re
import html
import logging
from typing import Any, Dict, List, Optional, Union
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe
from django.core.validators import URLValidator
from django.conf import settings

logger = logging.getLogger(__name__)


class SecurityValidator:
    """
    Comprehensive input validation and sanitization utilities.
    """
    
    # Regex patterns for validation
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_PATTERN = re.compile(r'^[\+]?[0-9\s\-\(\)]{8,15}$')
    NAME_PATTERN = re.compile(r'^[a-zA-ZÀ-ÿ\s\-\.]{2,50}$')
    ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_\.]+$')
    URL_PATTERN = re.compile(r'^https?://[^\s/$.?#].[^\s]*$')
    
    # Dangerous patterns to block
    DANGEROUS_PATTERNS = [
        re.compile(r'<script', re.IGNORECASE),
        re.compile(r'javascript:', re.IGNORECASE),
        re.compile(r'on\w+\s*=', re.IGNORECASE),  # onclick, onload, etc.
        re.compile(r'<iframe', re.IGNORECASE),
        re.compile(r'<object', re.IGNORECASE),
        re.compile(r'<embed', re.IGNORECASE),
        re.compile(r'<form', re.IGNORECASE),
        re.compile(r'<input', re.IGNORECASE),
        re.compile(r'<textarea', re.IGNORECASE),
        re.compile(r'<select', re.IGNORECASE),
        re.compile(r'<button', re.IGNORECASE),
        re.compile(r'<link', re.IGNORECASE),
        re.compile(r'<meta', re.IGNORECASE),
        re.compile(r'<style', re.IGNORECASE),
        re.compile(r'<title', re.IGNORECASE),
        re.compile(r'<body', re.IGNORECASE),
        re.compile(r'<head', re.IGNORECASE),
        re.compile(r'<html', re.IGNORECASE),
    ]
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        re.compile(r'(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\'[^\']*\'\s*=\s*\'[^\']*\')', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\"[^\"]*\"\s*=\s*\"[^\"]*")', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+\s*--)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+\s*#)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+\s*/\*)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+\s*\*/)', re.IGNORECASE),
        re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+\s*;)', re.IGNORECASE),
    ]
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """
        Validate and sanitize email address.
        
        Args:
            email: Email address to validate
            
        Returns:
            str: Sanitized email address
            
        Raises:
            ValidationError: If email is invalid or contains dangerous content
        """
        if not email:
            raise ValidationError("L'adresse email est requise.")
        
        email = email.strip().lower()
        
        # Check for dangerous patterns
        if cls._contains_dangerous_content(email):
            raise ValidationError("L'adresse email contient du contenu dangereux.")
        
        # Validate email format
        if not cls.EMAIL_PATTERN.match(email):
            raise ValidationError("Format d'adresse email invalide.")
        
        return email
    
    @classmethod
    def validate_phone(cls, phone: str) -> str:
        """
        Validate and sanitize phone number.
        
        Args:
            phone: Phone number to validate
            
        Returns:
            str: Sanitized phone number
            
        Raises:
            ValidationError: If phone number is invalid
        """
        if not phone:
            return ""
        
        phone = phone.strip()
        
        # Remove all non-digit characters except +, -, (, ), and spaces
        cleaned_phone = re.sub(r'[^\d\+\-\(\)\s]', '', phone)
        
        if not cls.PHONE_PATTERN.match(cleaned_phone):
            raise ValidationError("Format de numéro de téléphone invalide.")
        
        return cleaned_phone
    
    @classmethod
    def validate_name(cls, name: str, field_name: str = "nom") -> str:
        """
        Validate and sanitize name fields.
        
        Args:
            name: Name to validate
            field_name: Field name for error messages
            
        Returns:
            str: Sanitized name
            
        Raises:
            ValidationError: If name is invalid
        """
        if not name:
            raise ValidationError(f"Le {field_name} est requis.")
        
        name = name.strip()
        
        # Check for dangerous content
        if cls._contains_dangerous_content(name):
            raise ValidationError(f"Le {field_name} contient du contenu dangereux.")
        
        # Validate name format
        if not cls.NAME_PATTERN.match(name):
            raise ValidationError(f"Format de {field_name} invalide.")
        
        return name.title()
    
    @classmethod
    def validate_text(cls, text: str, max_length: int = 1000, allow_html: bool = False) -> str:
        """
        Validate and sanitize text content.
        
        Args:
            text: Text to validate
            max_length: Maximum allowed length
            allow_html: Whether to allow HTML content
            
        Returns:
            str: Sanitized text
            
        Raises:
            ValidationError: If text is invalid
        """
        if not text:
            return ""
        
        text = text.strip()
        
        # Check length
        if len(text) > max_length:
            raise ValidationError(f"Le texte ne peut pas dépasser {max_length} caractères.")
        
        # Check for dangerous content
        if cls._contains_dangerous_content(text):
            raise ValidationError("Le texte contient du contenu dangereux.")
        
        # Sanitize HTML if not allowed
        if not allow_html:
            text = strip_tags(text)
        
        return text
    
    @classmethod
    def validate_url(cls, url: str) -> str:
        """
        Validate and sanitize URL.
        
        Args:
            url: URL to validate
            
        Returns:
            str: Sanitized URL
            
        Raises:
            ValidationError: If URL is invalid
        """
        if not url:
            return ""
        
        url = url.strip()
        
        # Check for dangerous content
        if cls._contains_dangerous_content(url):
            raise ValidationError("L'URL contient du contenu dangereux.")
        
        # Validate URL format
        if not cls.URL_PATTERN.match(url):
            raise ValidationError("Format d'URL invalide.")
        
        # Additional validation using Django's URLValidator
        validator = URLValidator()
        try:
            validator(url)
        except ValidationError:
            raise ValidationError("Format d'URL invalide.")
        
        return url
    
    @classmethod
    def validate_file_upload(cls, file_obj, allowed_types: List[str] = None, max_size: int = None) -> bool:
        """
        Validate file upload.
        
        Args:
            file_obj: File object to validate
            allowed_types: List of allowed MIME types
            max_size: Maximum file size in bytes
            
        Returns:
            bool: True if file is valid
            
        Raises:
            ValidationError: If file is invalid
        """
        if not file_obj:
            return True
        
        # Check file size
        if max_size and file_obj.size > max_size:
            raise ValidationError(f"Le fichier est trop volumineux. Taille maximale: {max_size} bytes.")
        
        # Check file type
        if allowed_types and hasattr(file_obj, 'content_type'):
            if file_obj.content_type not in allowed_types:
                raise ValidationError(f"Type de fichier non autorisé. Types autorisés: {', '.join(allowed_types)}")
        
        return True
    
    @classmethod
    def sanitize_html(cls, html_content: str, allowed_tags: List[str] = None) -> str:
        """
        Sanitize HTML content by removing dangerous tags and attributes.
        
        Args:
            html_content: HTML content to sanitize
            allowed_tags: List of allowed HTML tags
            
        Returns:
            str: Sanitized HTML content
        """
        if not html_content:
            return ""
        
        # Default allowed tags (safe for display)
        if allowed_tags is None:
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        
        # Remove dangerous tags
        for pattern in cls.DANGEROUS_PATTERNS:
            html_content = pattern.sub('', html_content)
        
        # Remove all tags except allowed ones
        import re
        pattern = re.compile(r'<(?!\/?(?:' + '|'.join(allowed_tags) + r')\b)[^>]+>', re.IGNORECASE)
        html_content = pattern.sub('', html_content)
        
        return mark_safe(html_content)
    
    @classmethod
    def _contains_dangerous_content(cls, content: str) -> bool:
        """
        Check if content contains dangerous patterns.
        
        Args:
            content: Content to check
            
        Returns:
            bool: True if dangerous content is found
        """
        # Check for SQL injection patterns
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if pattern.search(content):
                logger.warning(f"SQL injection pattern detected: {content}")
                return True
        
        # Check for XSS patterns
        for pattern in cls.DANGEROUS_PATTERNS:
            if pattern.search(content):
                logger.warning(f"XSS pattern detected: {content}")
                return True
        
        return False


class SecurityMiddleware:
    """
    Django middleware for additional security headers and checks.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Add security headers
        response = self.get_response(request)
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "media-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response['Content-Security-Policy'] = csp_policy
        
        return response


class RateLimiter:
    """
    Simple rate limiting utility.
    """
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, max_requests: int = 100, window_seconds: int = 3600) -> bool:
        """
        Check if request is allowed based on rate limiting.
        
        Args:
            key: Unique identifier for the request (e.g., IP address)
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            bool: True if request is allowed
        """
        import time
        current_time = time.time()
        
        # Clean old entries
        self.requests = {
            k: v for k, v in self.requests.items() 
            if current_time - v['timestamp'] < window_seconds
        }
        
        # Check if key exists and is within limits
        if key in self.requests:
            if self.requests[key]['count'] >= max_requests:
                return False
            self.requests[key]['count'] += 1
        else:
            self.requests[key] = {
                'count': 1,
                'timestamp': current_time
            }
        
        return True


# Global rate limiter instance
rate_limiter = RateLimiter() 