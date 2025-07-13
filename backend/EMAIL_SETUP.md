# 📧 Email Configuration & RH Decision Workflow

## 🧑‍💻 Tech Stack / Dependencies
- **Framework**: Django 4.2.7
- **Email**: Django Email Backend, Mailtrap (dev), SMTP (prod)
- **Environment**: python-decouple
- **Task Queue**: Celery 5.3+ with Redis 5+
- **File Storage**: Django Storages, Pillow
- **Security**: Environment variables, CSRF, XSS, password hashing
- **Testing**: Django Test, pytest (optional)

This document explains how to set up and test the email functionality for the RH decision workflow using Mailtrap.

## 🎯 Overview

The system automatically sends email notifications when RH makes decisions on internship requests:

- **Acceptance**: Sends congratulatory email with login credentials
- **Rejection**: Sends rejection email with optional feedback
- **New Request**: Notifies RH team about new applications

## ⚙️ Configuration

### 1. Mailtrap Setup

1. **Create Mailtrap Account**
   - Go to [mailtrap.io](https://mailtrap.io)
   - Sign up for a free account
   - Create a new inbox for testing

2. **Get SMTP Credentials**
   - In your Mailtrap inbox, go to "Settings" → "SMTP Settings"
   - Copy the SMTP credentials:
     - Host: `smtp.mailtrap.io`
     - Port: `2525`
     - Username: Your Mailtrap username
     - Password: Your Mailtrap password

### 2. Environment Configuration

Update your `.env` file with Mailtrap credentials:

```env
# Email Settings (Mailtrap SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-mailtrap-username
EMAIL_HOST_PASSWORD=your-mailtrap-password
```

### 3. Django Settings

The email configuration is already set up in `gateway/stagebloom/settings.py`:

```python
# Email settings
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.mailtrap.io')
EMAIL_PORT = config('EMAIL_PORT', default=2525, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
```

## 🧪 Testing

### 1. Test Email Configuration

Test basic email functionality:

```bash
cd backend/gateway
python manage.py test_email --recipient your-email@example.com
```

### 2. Test RH Decision Workflow

Test the complete RH decision workflow:

```bash
# Test acceptance workflow
python manage.py test_rh_workflow --test-acceptance --email test@example.com

# Test rejection workflow
python manage.py test_rh_workflow --test-rejection --email test@example.com

# Test both workflows
python manage.py test_rh_workflow --email test@example.com
```

### 3. Manual Testing

1. **Start the Django server**:
   ```bash
   cd backend/gateway
   python manage.py runserver
   ```

2. **Create a test demande** via the API or admin interface

3. **Login as RH user** and approve/reject the demande

4. **Check Mailtrap inbox** for the email notifications

## 📧 Email Templates

### Acceptance Email

**Subject**: "Félicitations ! Votre demande de stage a été acceptée"

**Content**:
- Congratulations message
- Login credentials (email + generated password)
- Security warning about password change
- Next steps instructions
- Login link

**Templates**:
- `gateway/templates/emails/demande_accepted.html`
- `gateway/templates/emails/demande_accepted.txt`

### Rejection Email

**Subject**: "Réponse à votre demande de stage"

**Content**:
- Professional rejection message
- Optional rejection reason
- Encouragement for future applications
- Contact information

**Templates**:
- `gateway/templates/emails/demande_rejected.html`
- `gateway/templates/emails/demande_rejected.txt`

### RH Notification Email

**Subject**: "Nouvelle demande de stage - [Candidate Name]"

**Content**:
- New application notification
- Candidate details
- Stage information
- Link to RH dashboard

**Templates**:
- `gateway/templates/emails/new_demande_rh.html`
- `gateway/templates/emails/new_demande_rh.txt`

## 🔧 Centralized Mail Service

The system uses a centralized `MailService` class in `shared/utils.py`:

### Key Methods

- `send_email()`: Generic email sending with attachments
- `send_acceptance_email()`: Send acceptance notification
- `send_rejection_email()`: Send rejection notification
- `send_rh_notification()`: Notify RH team about new applications
- `test_email_configuration()`: Test email setup

### Usage Example

```python
from shared.utils import MailService

# Send acceptance email
MailService.send_acceptance_email(demande, password)

# Send rejection email
MailService.send_rejection_email(demande, "Rejection reason")

# Send RH notification
MailService.send_rh_notification(demande, pdf_content, attachments)
```

## 🚀 Production Deployment

### 1. Update Email Settings

For production, update your `.env` file with real SMTP credentials:

```env
# Production Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com  # or your SMTP provider
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-production-email@domain.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 2. Update Site URL

Set the correct site URL in settings:

```python
SITE_URL = 'https://your-domain.com'
```

### 3. Test Production Setup

```bash
python manage.py test_email --recipient admin@your-domain.com
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify Mailtrap credentials
   - Check username/password in `.env`

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings

3. **Template Not Found**
   - Ensure email templates exist in `gateway/templates/emails/`
   - Check template file permissions

4. **Email Not Sent**
   - Check Django logs for errors
   - Verify `DEFAULT_FROM_EMAIL` is set
   - Test with `python manage.py test_email`

### Debug Commands

```bash
# Test basic email
python manage.py test_email

# Test RH workflow
python manage.py test_rh_workflow --email your-email@example.com

# Check Django logs
tail -f backend/gateway/logs/django.log
```

## 📋 Checklist

- [ ] Mailtrap account created
- [ ] SMTP credentials configured in `.env`
- [ ] Email configuration tested
- [ ] RH decision workflow tested
- [ ] Email templates reviewed
- [ ] Production email settings configured
- [ ] Site URL updated for production

## 🔗 Related Files

- `shared/utils.py` - Centralized mail service
- `demande_service/views.py` - RH decision endpoints
- `gateway/templates/emails/` - Email templates
- `gateway/stagebloom/settings.py` - Email configuration
- `shared/management/commands/` - Testing commands 