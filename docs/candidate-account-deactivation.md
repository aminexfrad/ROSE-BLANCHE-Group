# Candidate Account Deactivation System

## Overview

The StageBloom platform automatically deactivates candidate accounts that have been inactive for more than 1 year. This system helps maintain platform security, data quality, and resource efficiency by removing dormant accounts.

## How It Works

### 1. Automatic Deactivation Process

- **Timeline**: Accounts are deactivated after 365 days of inactivity
- **Trigger**: Based on the `last_login` field in the User model
- **Scope**: Only affects users with role `candidat`
- **Action**: Sets both `User.is_active` and `Candidat.is_active` to `False`

### 2. Warning System

- **Warning Period**: 11 months (335 days) after last login
- **Action**: Sends warning emails to candidates approaching deactivation
- **Purpose**: Gives candidates time to reactivate their accounts

### 3. Notification System

- **Deactivation Notice**: Email sent when account is deactivated
- **Warning Notice**: Email sent 1 month before deactivation
- **Templates**: Both HTML and plain text versions available

## System Components

### Celery Tasks

#### `deactivate_inactive_candidate_accounts`
- **Purpose**: Main task for deactivating inactive accounts
- **Schedule**: Every 7 days at 2:00 AM
- **Function**: Finds and deactivates accounts inactive for 1+ year

#### `check_candidate_activity`
- **Purpose**: Monitor candidate activity and generate statistics
- **Schedule**: Daily at 6:00 AM
- **Function**: Logs activity metrics and identifies accounts at risk

#### `send_deactivation_warnings`
- **Purpose**: Send warning emails to candidates approaching deactivation
- **Schedule**: Every Monday at 9:00 AM
- **Function**: Notifies candidates 1 month before deactivation

### Management Commands

#### `deactivate_inactive_candidates`
```bash
# Dry run (show what would be deactivated)
python manage.py deactivate_inactive_candidates --dry-run

# Deactivate with custom inactivity period (e.g., 30 days)
python manage.py deactivate_inactive_candidates --days 30

# Force deactivation without confirmation
python manage.py deactivate_inactive_candidates --force
```

### Email Templates

#### Warning Email (`candidat_deactivation_warning.html/.txt`)
- Sent 1 month before deactivation
- Includes countdown to deactivation
- Provides clear action steps to prevent deactivation

#### Deactivation Notice (`candidat_account_deactivated.html/.txt`)
- Sent immediately after deactivation
- Explains why the account was deactivated
- Provides instructions for reactivation

## Configuration

### Django Settings

```python
# Celery Beat Schedule (Periodic Tasks)
CELERY_BEAT_SCHEDULE = {
    'deactivate-inactive-candidates': {
        'task': 'candidat_service.tasks.deactivate_inactive_candidate_accounts',
        'schedule': 60 * 60 * 24 * 7,  # Every 7 days
    },
    'check-candidate-activity': {
        'task': 'candidat_service.tasks.check_candidate_activity',
        'schedule': 60 * 60 * 24,  # Every day
    },
    'send-deactivation-warnings': {
        'task': 'candidat_service.tasks.send_deactivation_warnings',
        'schedule': 60 * 60 * 24 * 7,  # Every 7 days
    },
}
```

### Celery Configuration

- **Broker**: Redis
- **Result Backend**: Redis
- **Task Serialization**: JSON
- **Timezone**: UTC
- **Worker Settings**: Configurable time limits and concurrency

## Installation and Setup

### 1. Prerequisites

- Redis server running
- Python 3.8+
- Django 4.0+
- Celery 5.3+

### 2. Start Services

```bash
# Start Redis (if not already running)
redis-server

# Start Celery services
cd backend
.\start_celery.ps1
```

### 3. Verify Installation

```bash
# Test the system
python test_candidate_deactivation.py

# Test management command
python manage.py deactivate_inactive_candidates --dry-run
```

## Monitoring and Maintenance

### Celery Monitor (Flower)

- **URL**: http://localhost:5555
- **Purpose**: Monitor task execution, success rates, and performance
- **Features**: Real-time task monitoring, worker status, queue management

### Logs

The system logs all activities to Django's logging system:
- Task execution results
- Deactivation counts
- Email delivery status
- Error handling

### Statistics

Daily activity reports include:
- Total candidate count
- Active vs. inactive accounts
- Recently active accounts (30 days)
- Accounts approaching deactivation

## Security Considerations

### Data Protection

- **Soft Deletion**: Accounts are marked inactive, not deleted
- **Data Retention**: All candidate data is preserved
- **Reactivation**: Accounts can be reactivated by support team

### Access Control

- **Role-Based**: Only affects candidate accounts
- **Audit Trail**: All deactivations are logged
- **Manual Override**: Admins can manually reactivate accounts

## Troubleshooting

### Common Issues

#### Redis Connection Failed
```bash
# Check Redis status
redis-cli ping

# Start Redis if needed
redis-server
```

#### Celery Worker Not Starting
```bash
# Check Python path
python -c "import candidat_service.tasks"

# Verify Django settings
python manage.py check
```

#### Email Not Sending
- Check `EMAIL_HOST` in Django settings
- Verify SMTP credentials
- Check email templates exist

### Debug Commands

```bash
# Test Celery connection
python -m celery -A gateway.stagebloom inspect active

# Check scheduled tasks
python -m celery -A gateway.stagebloom inspect scheduled

# Test specific task
python -c "from candidat_service.tasks import check_candidate_activity; print(check_candidate_activity())"
```

## Customization

### Modify Deactivation Period

```python
# In candidat_service/tasks.py
@shared_task
def deactivate_inactive_candidate_accounts():
    # Change from 365 to custom days
    cutoff_date = timezone.now() - timedelta(days=YOUR_DAYS)
```

### Custom Email Templates

- Templates are located in `backend/gateway/templates/emails/`
- Modify HTML and text versions as needed
- Update context variables in tasks if template changes

### Schedule Changes

```python
# In settings.py, modify CELERY_BEAT_SCHEDULE
'deactivate-inactive-candidates': {
    'task': 'candidat_service.tasks.deactivate_inactive_candidate_accounts',
    'schedule': 60 * 60 * 24 * YOUR_DAYS,  # Custom interval
},
```

## Best Practices

### 1. Testing
- Always use `--dry-run` first in production
- Test with sample data before live deployment
- Monitor first few automatic executions

### 2. Monitoring
- Set up alerts for failed task executions
- Monitor email delivery rates
- Track deactivation statistics

### 3. Maintenance
- Review deactivation logs regularly
- Monitor Redis memory usage
- Update email templates as needed

### 4. Communication
- Inform candidates about the policy
- Provide clear reactivation instructions
- Maintain support contact information

## Support and Maintenance

### Reactivating Accounts

```python
# Manual reactivation
user = User.objects.get(email='candidate@example.com')
user.is_active = True
user.save()

if hasattr(user, 'candidat_profile'):
    candidat = user.candidat_profile
    candidat.is_active = True
    candidat.save()
```

### Data Recovery

- All candidate data is preserved
- Applications and documents remain intact
- Profile information is maintained

### Support Contact

- **Email**: support@stagebloom.com
- **Process**: Manual review and reactivation
- **Timeline**: Usually within 24-48 hours

## Future Enhancements

### Planned Features

1. **Gradual Deactivation**: Multiple warning levels
2. **Activity Scoring**: More sophisticated inactivity detection
3. **Automated Reactivation**: Self-service account recovery
4. **Analytics Dashboard**: Comprehensive activity reporting
5. **Integration**: Connect with other platform metrics

### Configuration Options

- Configurable deactivation periods per user type
- Custom warning schedules
- Integration with external activity tracking
- Advanced notification preferences

---

**Note**: This system is designed to be safe and reversible. All deactivations are logged and can be undone by support staff. The primary goal is to maintain platform quality while preserving user data and providing clear communication about account status.
