"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

#!/usr/bin/env python
"""
Security Improvements Test Suite

This script tests all the security improvements implemented in the StageBloom backend.
Run this script to verify that all security features are working correctly.
"""

import os
import sys
import django
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.conf import settings

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.security import SecurityValidator, rate_limiter
from shared.utils import FileUploadValidator, custom_exception_handler
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError


class SecurityValidatorTest(TestCase):
    """Test the SecurityValidator class functionality"""
    
    def test_email_validation(self):
        """Test email validation with various inputs"""
        # Valid emails
        valid_emails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@example.org'
        ]
        
        for email in valid_emails:
            result = SecurityValidator.validate_email(email)
            self.assertEqual(result, email.lower().strip())
        
        # Invalid emails
        invalid_emails = [
            'invalid-email',
            'test@',
            '@example.com',
            'test@.com',
            '<script>alert("xss")</script>@example.com'
        ]
        
        for email in invalid_emails:
            with self.assertRaises(ValidationError):
                SecurityValidator.validate_email(email)
    
    def test_phone_validation(self):
        """Test phone number validation"""
        # Valid phone numbers
        valid_phones = [
            '+216 12345678',
            '21612345678',
            '(216) 123-4567',
            '12345678'
        ]
        
        for phone in valid_phones:
            result = SecurityValidator.validate_phone(phone)
            self.assertIsInstance(result, str)
        
        # Invalid phone numbers
        invalid_phones = [
            '123',  # Too short
            'abcdefghij',  # No digits
            '<script>alert("xss")</script>'
        ]
        
        for phone in invalid_phones:
            with self.assertRaises(ValidationError):
                SecurityValidator.validate_phone(phone)
    
    def test_name_validation(self):
        """Test name validation"""
        # Valid names
        valid_names = [
            'John',
            'Jean-Pierre',
            'Maria José',
            'O\'Connor'
        ]
        
        for name in valid_names:
            result = SecurityValidator.validate_name(name)
            self.assertIsInstance(result, str)
        
        # Invalid names
        invalid_names = [
            'A',  # Too short
            'A' * 51,  # Too long
            '<script>alert("xss")</script>',
            'John123'  # Contains numbers
        ]
        
        for name in invalid_names:
            with self.assertRaises(ValidationError):
                SecurityValidator.validate_name(name)
    
    def test_text_validation(self):
        """Test text content validation"""
        # Valid text
        valid_text = "This is a valid text content."
        result = SecurityValidator.validate_text(valid_text, max_length=100)
        self.assertEqual(result, valid_text.strip())
        
        # Text with HTML (should be stripped)
        html_text = "<p>This is <strong>HTML</strong> content.</p>"
        result = SecurityValidator.validate_text(html_text, max_length=100, allow_html=False)
        self.assertEqual(result, "This is HTML content.")
        
        # Text too long
        long_text = "A" * 1001
        with self.assertRaises(ValidationError):
            SecurityValidator.validate_text(long_text, max_length=1000)
        
        # Text with dangerous content
        dangerous_text = '<script>alert("xss")</script>'
        with self.assertRaises(ValidationError):
            SecurityValidator.validate_text(dangerous_text, max_length=100)
    
    def test_url_validation(self):
        """Test URL validation"""
        # Valid URLs
        valid_urls = [
            'https://example.com',
            'http://www.example.org/path',
            'https://api.example.com/v1/endpoint'
        ]
        
        for url in valid_urls:
            result = SecurityValidator.validate_url(url)
            self.assertEqual(result, url.strip())
        
        # Invalid URLs
        invalid_urls = [
            'not-a-url',
            'ftp://example.com',
            '<script>alert("xss")</script>',
            'javascript:alert("xss")'
        ]
        
        for url in invalid_urls:
            with self.assertRaises(ValidationError):
                SecurityValidator.validate_url(url)
    
    def test_sql_injection_detection(self):
        """Test SQL injection pattern detection"""
        dangerous_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "1 UNION SELECT * FROM users",
            "1 AND 1=1"
        ]
        
        for dangerous_input in dangerous_inputs:
            self.assertTrue(SecurityValidator._contains_dangerous_content(dangerous_input))
        
        # Safe inputs
        safe_inputs = [
            "normal text",
            "user@example.com",
            "John Doe",
            "12345678"
        ]
        
        for safe_input in safe_inputs:
            self.assertFalse(SecurityValidator._contains_dangerous_content(safe_input))
    
    def test_xss_detection(self):
        """Test XSS pattern detection"""
        dangerous_inputs = [
            '<script>alert("xss")</script>',
            '<iframe src="javascript:alert(1)"></iframe>',
            '<img src="x" onerror="alert(1)">',
            'javascript:alert("xss")',
            '<object data="javascript:alert(1)"></object>'
        ]
        
        for dangerous_input in dangerous_inputs:
            self.assertTrue(SecurityValidator._contains_dangerous_content(dangerous_input))
        
        # Safe inputs
        safe_inputs = [
            "normal text",
            "<p>Safe HTML</p>",
            "<strong>Bold text</strong>",
            "<em>Italic text</em>"
        ]
        
        for safe_input in safe_inputs:
            self.assertFalse(SecurityValidator._contains_dangerous_content(safe_input))


class FileUploadValidatorTest(TestCase):
    """Test the FileUploadValidator class"""
    
    def test_safe_filename(self):
        """Test filename safety validation"""
        # Safe filenames
        safe_filenames = [
            "document.pdf",
            "my_file.txt",
            "image.jpg",
            "report_2024.pdf"
        ]
        
        for filename in safe_filenames:
            self.assertTrue(FileUploadValidator.is_safe_filename(filename))
        
        # Dangerous filenames
        dangerous_filenames = [
            "../../../etc/passwd",
            "file<script>.pdf",
            "file\0null.pdf",
            "file" + "A" * 300 + ".pdf",  # Too long
            "",
            "   "  # Only whitespace
        ]
        
        for filename in dangerous_filenames:
            self.assertFalse(FileUploadValidator.is_safe_filename(filename))
    
    def test_file_extension(self):
        """Test file extension extraction"""
        test_cases = [
            ("document.pdf", "pdf"),
            ("image.jpg", "jpg"),
            ("file.txt", "txt"),
            ("no_extension", ""),
            ("multiple.dots.file.pdf", "pdf")
        ]
        
        for filename, expected_extension in test_cases:
            result = FileUploadValidator.get_file_extension(filename)
            self.assertEqual(result, expected_extension)


class RateLimiterTest(TestCase):
    """Test the RateLimiter class"""
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        # Reset rate limiter for testing
        rate_limiter.requests = {}
        
        # Test normal usage
        for i in range(10):
            self.assertTrue(rate_limiter.is_allowed("test_ip", max_requests=10, window_seconds=3600))
        
        # Test rate limit exceeded
        self.assertFalse(rate_limiter.is_allowed("test_ip", max_requests=10, window_seconds=3600))
        
        # Test different IP
        self.assertTrue(rate_limiter.is_allowed("different_ip", max_requests=10, window_seconds=3600))


class SecurityMiddlewareTest(APITestCase):
    """Test security middleware functionality"""
    
    def test_security_headers(self):
        """Test that security headers are set correctly"""
        # Make a request to any endpoint
        response = self.client.get('/api/auth/check-auth/')
        
        # Check security headers
        self.assertIn('X-Content-Type-Options', response)
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        
        self.assertIn('X-Frame-Options', response)
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        
        self.assertIn('X-XSS-Protection', response)
        self.assertEqual(response['X-XSS-Protection'], '1; mode=block')
        
        self.assertIn('Referrer-Policy', response)
        self.assertEqual(response['Referrer-Policy'], 'strict-origin-when-cross-origin')
        
        self.assertIn('Permissions-Policy', response)
        self.assertIn('geolocation=()', response['Permissions-Policy'])
        
        self.assertIn('Content-Security-Policy', response)


class SettingsTest(TestCase):
    """Test security-related settings"""
    
    def test_security_settings(self):
        """Test that security settings are properly configured"""
        # Test security settings
        self.assertTrue(hasattr(settings, 'SECURE_BROWSER_XSS_FILTER'))
        self.assertTrue(hasattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF'))
        self.assertTrue(hasattr(settings, 'X_FRAME_OPTIONS'))
        
        # Test rate limiting settings
        self.assertTrue(hasattr(settings, 'RATE_LIMIT_ENABLED'))
        self.assertTrue(hasattr(settings, 'RATE_LIMIT_MAX_REQUESTS'))
        self.assertTrue(hasattr(settings, 'RATE_LIMIT_WINDOW_SECONDS'))
        
        # Test file upload settings
        self.assertTrue(hasattr(settings, 'MAX_UPLOAD_SIZE'))
        self.assertTrue(hasattr(settings, 'ALLOWED_FILE_TYPES'))
        
        # Test logging configuration
        self.assertTrue(hasattr(settings, 'LOGGING'))
        self.assertIn('shared.security', settings.LOGGING['loggers'])
    
    def test_database_security(self):
        """Test database security configuration"""
        db_config = settings.DATABASES['default']
        self.assertIn('OPTIONS', db_config)
        self.assertIn('init_command', db_config['OPTIONS'])
        self.assertIn('STRICT_TRANS_TABLES', db_config['OPTIONS']['init_command'])


def run_security_tests():
    """Run all security tests and print results"""
    print("🔒 Running Security Improvements Test Suite")
    print("=" * 50)
    
    # Import test classes
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Create test suite
    test_runner = get_runner(settings)
    test_suite = test_runner()
    
    # Run tests
    test_results = test_suite.run_tests([
        'test_security_improvements.SecurityValidatorTest',
        'test_security_improvements.FileUploadValidatorTest',
        'test_security_improvements.RateLimiterTest',
        'test_security_improvements.SecurityMiddlewareTest',
        'test_security_improvements.SettingsTest'
    ])
    
    print("\n" + "=" * 50)
    if test_results:
        print("✅ All security tests passed!")
        print("🔒 Security improvements are working correctly.")
    else:
        print("❌ Some security tests failed.")
        print("🔧 Please review the security implementation.")
    
    return test_results


if __name__ == '__main__':
    # Run the security tests
    run_security_tests() 