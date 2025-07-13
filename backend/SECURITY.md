# Security Documentation - StageBloom Backend

## Overview

This document outlines the security measures implemented in the StageBloom backend to protect against common web application vulnerabilities including SQL injection, XSS, CSRF, and other security threats.

## Security Features Implemented

### 1. Input Validation and Sanitization

#### SecurityValidator Class
- **Location**: `shared/security.py`
- **Purpose**: Comprehensive input validation and sanitization
- **Features**:
  - Email validation with regex patterns
  - Phone number validation and formatting
  - Name validation with character restrictions
  - Text content validation with length limits
  - URL validation with security checks
  - File upload validation with type and size restrictions

#### Validation Patterns
```python
# Email validation
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Phone validation
PHONE_PATTERN = re.compile(r'^[\+]?[0-9\s\-\(\)]{8,15}$')

# Name validation
NAME_PATTERN = re.compile(r'^[a-zA-ZÀ-ÿ\s\-\.]{2,50}$')
```

### 2. SQL Injection Prevention

#### Database Configuration
- **Strict SQL Mode**: Enabled in MySQL configuration
- **Parameterized Queries**: All database queries use Django ORM
- **Input Validation**: All user inputs are validated before database operations

#### Security Patterns
```python
# Dangerous SQL patterns are blocked
SQL_INJECTION_PATTERNS = [
    re.compile(r'(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)', re.IGNORECASE),
    re.compile(r'(\b(and|or)\b\s+\d+\s*=\s*\d+)', re.IGNORECASE),
    # ... more patterns
]
```

### 3. XSS (Cross-Site Scripting) Prevention

#### Content Security Policy
```python
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
```

#### HTML Sanitization
- **Dangerous Tags Blocked**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, etc.
- **Event Handlers Blocked**: `onclick`, `onload`, `onerror`, etc.
- **Sanitization Function**: `SecurityValidator.sanitize_html()`

### 4. CSRF (Cross-Site Request Forgery) Protection

#### Django CSRF Middleware
- **Enabled**: `django.middleware.csrf.CsrfViewMiddleware`
- **Secure Cookies**: `CSRF_COOKIE_SECURE = True` (in production)
- **SameSite Policy**: `CSRF_COOKIE_SAMESITE = 'Lax'`

### 5. File Upload Security

#### File Validation
```python
class FileUploadValidator:
    @staticmethod
    def validate_file(file_obj, allowed_types, max_size):
        # Size validation
        # Type validation
        # Filename safety check
        # Path traversal prevention
```

#### Security Measures
- **File Type Validation**: Only allowed MIME types accepted
- **File Size Limits**: Configurable maximum file sizes
- **Filename Safety**: Prevents path traversal attacks
- **Virus Scanning**: Recommended for production

### 6. Authentication and Authorization

#### JWT Token Security
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=1440),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}
```

#### Password Security
- **Minimum Length**: 8 characters
- **Complexity Requirements**: Django's built-in validators
- **Common Password Blocking**: Prevents weak passwords
- **Secure Hashing**: Django's `set_password()` method

### 7. Rate Limiting

#### Implementation
```python
class RateLimiter:
    def is_allowed(self, key, max_requests=100, window_seconds=3600):
        # IP-based rate limiting
        # Configurable limits
        # Time window enforcement
```

#### Configuration
```python
RATE_LIMIT_ENABLED = True
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW_SECONDS = 3600
```

### 8. Security Headers

#### HTTP Security Headers
```python
response['X-Content-Type-Options'] = 'nosniff'
response['X-Frame-Options'] = 'DENY'
response['X-XSS-Protection'] = '1; mode=block'
response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
```

### 9. Environment Variable Security

#### Sensitive Data Protection
- **Database Credentials**: Stored in environment variables
- **Secret Key**: Environment variable only
- **Email Credentials**: Environment variables
- **API Keys**: Environment variables

#### Example Configuration
```bash
# Never commit these to version control
SECRET_KEY=your-secret-key-here
DB_PASSWORD=your-database-password
EMAIL_HOST_PASSWORD=your-email-password
```

### 10. Logging and Monitoring

#### Security Logging
```python
LOGGING = {
    'loggers': {
        'shared.security': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
```

#### Logged Events
- SQL injection attempts
- XSS pattern detection
- Rate limit violations
- Authentication failures
- File upload violations

## Security Best Practices

### 1. Code Review Checklist
- [ ] All user inputs are validated
- [ ] No raw SQL queries
- [ ] File uploads are validated
- [ ] Authentication is required for sensitive endpoints
- [ ] CSRF protection is enabled
- [ ] Security headers are set

### 2. Production Deployment
- [ ] HTTPS is enabled
- [ ] Debug mode is disabled
- [ ] Secret key is changed
- [ ] Database credentials are secure
- [ ] File permissions are correct
- [ ] Logging is configured

### 3. Regular Security Audits
- [ ] Dependency updates
- [ ] Security scan reports
- [ ] Penetration testing
- [ ] Code security review
- [ ] Access control audit

## Security Testing

### Automated Testing
```bash
# Run security tests
python manage.py test --pattern="*security*"

# Run linting with security focus
flake8 --select=security

# Run dependency vulnerability scan
safety check
```

### Manual Testing Checklist
- [ ] SQL injection attempts
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] File upload security
- [ ] Authentication bypass attempts
- [ ] Rate limiting effectiveness

## Incident Response

### Security Incident Process
1. **Detection**: Automated monitoring and logging
2. **Assessment**: Evaluate impact and scope
3. **Containment**: Immediate security measures
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration
6. **Post-incident**: Lessons learned and improvements

### Contact Information
- **Security Team**: security@stagebloom.com
- **Emergency Contact**: +216 XX XXX XXX
- **Bug Bounty**: security@stagebloom.com

## Compliance

### Data Protection
- **GDPR Compliance**: User data handling
- **Data Encryption**: At rest and in transit
- **Data Retention**: Configurable policies
- **User Consent**: Explicit consent collection

### Audit Trail
- **User Actions**: Logged for audit
- **System Changes**: Version controlled
- **Access Logs**: Comprehensive logging
- **Error Tracking**: Sentry integration

## Updates and Maintenance

### Security Updates
- **Dependencies**: Regular updates
- **Django**: Security patches
- **Custom Code**: Security reviews
- **Configuration**: Regular audits

### Monitoring
- **Real-time Alerts**: Security incidents
- **Performance Monitoring**: System health
- **Error Tracking**: Application errors
- **User Activity**: Suspicious behavior

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintainer**: StageBloom Security Team 