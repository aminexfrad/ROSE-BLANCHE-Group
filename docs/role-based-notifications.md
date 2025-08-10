# Role-Based Notification System Documentation

## Overview

The StageBloom application now features a comprehensive role-based notification system that ensures each actor (role) receives their appropriate notifications. This system has been completely refactored to address the previous limitations and provide proper role-based notification targeting.

## What Was Fixed

### ❌ Previous Issues
1. **Missing role-based notification targeting** - The system didn't properly filter notifications by user roles
2. **Incomplete WebSocket group management** - Role-based groups were created but not properly utilized
3. **Limited notification service methods** - Missing methods to send notifications to specific roles
4. **Inconsistent notification delivery** - Users didn't receive notifications appropriate to their role

### ✅ What's Now Working
1. **Proper role-based notification targeting** - Each role receives notifications relevant to them
2. **Complete WebSocket group management** - Users join both personal and role-based groups
3. **Comprehensive notification service** - Full methods for role-based, bulk, and broadcast notifications
4. **Consistent notification delivery** - Each actor receives notifications appropriate to their role

## System Architecture

### 1. Core Components

#### NotificationService (`backend/notification_service/services.py`)
- **`send_role_notifications()`** - Send notifications to users with specific roles
- **`send_bulk_notifications()`** - Send notifications to multiple specific users
- **`send_broadcast()`** - Send notifications to all users
- **`send_stage_notification()`** - Send notifications to stage participants
- **`create_event()`** - Create notification events with role-based targeting
- **`process_event()`** - Process events and create notifications

#### RoleNotificationHelper (`backend/notification_service/role_notifications.py`)
- **`notify_stagiaires()`** - Send notifications to all stagiaires
- **`notify_tuteurs()`** - Send notifications to all tuteurs
- **`notify_rh_team()`** - Send notifications to RH team
- **`notify_admin_team()`** - Send notifications to admin team
- **`notify_management_team()`** - Send notifications to management (admin + RH)
- **`notify_stage_participants()`** - Send notifications to stage participants
- **`notify_survey_participants()`** - Send notifications to survey participants
- **`create_stage_event()`** - Create stage-related notification events
- **`create_survey_event()`** - Create survey-related notification events
- **`create_evaluation_event()`** - Create evaluation-related notification events

#### WebSocket Consumer (`backend/notification_service/consumers.py`)
- **Personal groups**: `user_{user_id}` for individual notifications
- **Role groups**: `role_{role}` for role-based notifications
- **Stage groups**: `stage_{stage_id}` for stage-specific notifications
- **Connection management**: Track active WebSocket connections
- **Real-time delivery**: Instant notification delivery via WebSocket

#### Models (`backend/notification_service/models.py`)
- **`NotificationEvent`** - Track notification events for real-time processing
- **`NotificationTemplate`** - Predefined notification message templates
- **`WebSocketConnection`** - Track active WebSocket connections

### 2. Notification Types

#### By Role
- **Stagiaire**: Stage updates, document approvals, KPI surveys, evaluations, testimonial requests
- **Tuteur**: Stage updates, document uploads, evaluation completions, KPI alerts, student progress
- **RH**: New stage requests, PFE reports, testimonials, survey completions, KPI reports
- **Admin**: System-wide events, user management, maintenance notifications, system statistics

#### By Event Type
- **`info`**: General information, updates, announcements
- **`success`**: Completed actions, approvals, achievements
- **`warning`**: KPI alerts, pending actions, reminders
- **`error`**: System errors, critical issues, failures

#### Event Categories
- **`SYSTEM`**: System-wide events and maintenance
- **`USER_ACTION`**: User-initiated actions
- **`STAGE_UPDATE`**: Stage status and progress changes
- **`DOCUMENT_UPLOAD`**: Document-related events
- **`EVALUATION`**: Evaluation and assessment events
- **`SURVEY`**: Survey and feedback events
- **`TESTIMONIAL`**: Testimonial submissions
- **`DEMANDE`**: Request and application events
- **`KPI_ALERT`**: Performance and KPI alerts

## How It Works

### 1. User Registration
When a user connects via WebSocket:
```python
# User joins personal group
await self.channel_layer.group_add(f"user_{user.id}", self.channel_name)

# User joins role group
await self.channel_layer.group_add(f"role_{user.role}", self.channel_name)

# User joins stage group if applicable
if user.stage:
    await self.channel_layer.group_add(f"stage_{user.stage.id}", self.channel_name)
```

### 2. Role-Based Notification Sending
```python
# Send to specific roles
helper = RoleNotificationHelper()
notifications = helper.notify_stagiaires(
    title="Nouveau sondage disponible",
    message="Un nouveau sondage KPI est disponible",
    notification_type='info'
)
```

### 3. Automatic Event Notifications
The system automatically sends notifications for:
- **Stage events**: Creation, updates, completion, status changes
- **Document events**: Uploads, approvals, rejections, modifications
- **Survey events**: New surveys, completions, reminders
- **Evaluation events**: Completions, results, feedback
- **KPI events**: Alerts, threshold breaches, performance updates
- **Testimonial events**: Submissions, approvals, requests

### 4. Event Processing Pipeline
```python
# 1. Create event
event = notification_service.create_event(
    event_type='stage_update',
    event_data={'stage_id': 123, 'status': 'en_cours'},
    target_roles=['stagiaire', 'tuteur']
)

# 2. Process event
notifications = notification_service.process_event(event)

# 3. Send real-time notifications
# (automatically handled by process_event)
```

## API Endpoints

### User Notifications
- `GET /api/notifications/notifications/` - Get user's notifications
- `GET /api/notifications/notifications/unread-count/` - Get unread count
- `POST /api/notifications/notifications/{id}/read/` - Mark as read
- `POST /api/notifications/notifications/mark-all-read/` - Mark all as read
- `DELETE /api/notifications/notifications/{id}/delete/` - Delete notification
- `DELETE /api/notifications/notifications/clear-all/` - Clear all notifications
- `GET /api/notifications/notifications/statistics/` - Get user notification statistics
- `GET /api/notifications/notifications/search/` - Search user notifications

### Role-Based Notifications (Admin/RH Only)
- `POST /api/notifications/send-role-notification/` - Send to specific roles
- `POST /api/notifications/send-broadcast/` - Send to all users (Admin only)

### System Management (Admin Only)
- `GET /api/notifications/system-stats/` - System-wide statistics

## Usage Examples

### 1. Send Notification to All Stagiaires
```python
from notification_service.role_notifications import RoleNotificationHelper

helper = RoleNotificationHelper()
notifications = helper.notify_stagiaires(
    title="Nouvelle offre de stage",
    message="Une nouvelle offre de stage est disponible",
    notification_type='info'
)
```

### 2. Send Notification to Management Team
```python
helper = RoleNotificationHelper()
notifications = helper.notify_management_team(
    title="Rapport mensuel",
    message="Le rapport mensuel des stages est disponible",
    notification_type='info'
)
```

### 3. Send Stage-Specific Notification
```python
helper = RoleNotificationHelper()
notifications = helper.notify_stage_participants(
    stage_id=123,
    title="Document approuvé",
    message="Votre document a été approuvé",
    notification_type='success'
)
```

### 4. Create Custom Event
```python
event = helper.create_stage_event(
    event_type='stage_update',
    stage_id=123,
    event_data={
        'action': 'status_changed',
        'old_status': 'en_cours',
        'new_status': 'termine'
    }
)
```

### 5. Use Convenience Functions
```python
# Notify about new stage creation
notify_new_stage_created(stage_id=123, source_user=admin_user)

# Notify about document upload
notify_document_uploaded(stage_id=123, document_title="Rapport PFE", source_user=stagiaire_user)

# Notify about survey availability
notify_survey_available(survey_id=456, survey_title="Satisfaction Stage", source_user=rh_user)

# Notify about KPI alerts
notify_kpi_alert(stage_id=123, alert_message="KPI en dessous du seuil", alert_level='warning')

# Notify about testimonial submission
notify_testimonial_submitted(stage_id=123, testimonial_title="Témoignage Stage", source_user=stagiaire_user)

# Notify about evaluation completion
notify_evaluation_completed(stage_id=123, evaluator_id=789, evaluated_id=456, evaluation_type='mid_stage')
```

## Frontend Integration

### WebSocket Connection
```typescript
// Connect to WebSocket
const socket = new WebSocket('ws://localhost:8000/ws/notifications/');

// Listen for notifications
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notification') {
        // Handle new notification
        showNotification(data.notification);
    } else if (data.type === 'role_notification') {
        // Handle role-based notification
        showRoleNotification(data.notification);
    } else if (data.type === 'system_message') {
        // Handle system message
        showSystemMessage(data.message);
    }
};

// Send ping to keep connection alive
setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
    }
}, 30000);
```

### API Calls
```typescript
// Get user notifications
const response = await fetch('/api/notifications/notifications/');
const notifications = await response.json();

// Mark notification as read
await fetch(`/api/notifications/notifications/${id}/read/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
});

// Get unread count
const unreadResponse = await fetch('/api/notifications/notifications/unread-count/');
const unreadCount = await unreadResponse.json();

// Search notifications
const searchResponse = await fetch('/api/notifications/notifications/search/?q=stage');
const searchResults = await searchResponse.json();
```

### React Hook Example
```typescript
import { useNotifications } from '../hooks/use-notifications';

function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    
    return (
        <div className="notification-bell">
            <span className="badge">{unreadCount}</span>
            <div className="notifications-dropdown">
                {notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notification.id)}
                    >
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## Testing

### Run the Test Script
```bash
cd backend
python test_role_notifications.py
```

This script will:
1. Test all role-based notification methods
2. Verify notification filtering by role
3. Test WebSocket functionality
4. Clean up test notifications
5. Test notification statistics and search
6. Verify event creation and processing

### Manual Testing
1. **Create users with different roles**
2. **Send role-specific notifications**
3. **Verify WebSocket delivery**
4. **Check database storage**
5. **Test notification filtering**
6. **Verify notification statistics**
7. **Test search functionality**

### Test Scenarios
```python
# Test role-based targeting
def test_role_targeting():
    helper = RoleNotificationHelper()
    
    # Test stagiaire notifications
    stagiaire_notifications = helper.notify_stagiaires(
        title="Test Stagiaire",
        message="Test message",
        notification_type='info'
    )
    
    # Verify only stagiaires received notifications
    for notification in stagiaire_notifications:
        assert notification.recipient.role == 'stagiaire'

# Test event processing
def test_event_processing():
    service = NotificationService()
    
    # Create event
    event = service.create_event(
        event_type='stage_update',
        event_data={'stage_id': 1},
        target_roles=['stagiaire', 'tuteur']
    )
    
    # Process event
    notifications = service.process_event(event)
    
    # Verify notifications created
    assert len(notifications) > 0
    assert event.processed == True
```

## Configuration

### Environment Variables
```bash
# WebSocket settings
CHANNEL_LAYERS=redis://localhost:6379/0

# Notification settings
NOTIFICATION_QUEUE_SIZE=1000
NOTIFICATION_RETENTION_DAYS=30
NOTIFICATION_BATCH_SIZE=100
```

### Django Settings
```python
# Add to settings.py
INSTALLED_APPS = [
    # ... other apps
    'notification_service',
]

# Channel layers configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Notification settings
NOTIFICATION_SETTINGS = {
    'QUEUE_SIZE': 1000,
    'RETENTION_DAYS': 30,
    'BATCH_SIZE': 100,
    'WEBHOOK_URL': None,  # For external integrations
    'EMAIL_FALLBACK': True,  # Send email if WebSocket fails
}
```

### Redis Configuration
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis connection
redis-cli ping
```

## Monitoring and Debugging

### Logs
The system logs all notification activities:
- Notification creation and processing
- WebSocket connection and delivery
- Role-based targeting and filtering
- Error handling and recovery
- Performance metrics

### Statistics
Monitor notification system health:
- Total notifications sent and received
- Notifications by role and type
- WebSocket connection status and count
- Delivery success rates and failures
- System performance metrics

### Health Check Endpoints
```python
# System statistics
GET /api/notifications/system-stats/

# User statistics
GET /api/notifications/notifications/statistics/

# Connection status
GET /api/notifications/connections/status/
```

## Performance Optimization

### 1. Database Optimization
- Use database indexes on frequently queried fields
- Implement notification archiving for old notifications
- Use bulk operations for multiple notifications

### 2. WebSocket Optimization
- Implement connection pooling
- Use message batching for multiple notifications
- Implement heartbeat mechanisms

### 3. Caching Strategy
- Cache user notification preferences
- Cache frequently accessed notification data
- Implement Redis caching for WebSocket groups

### 4. Batch Processing
```python
# Process notifications in batches
def process_notifications_batch(notifications, batch_size=100):
    for i in range(0, len(notifications), batch_size):
        batch = notifications[i:i + batch_size]
        process_batch(batch)
        time.sleep(0.1)  # Prevent overwhelming the system
```

## Security Considerations

### 1. Authentication
- All WebSocket connections require authentication
- API endpoints use Django's authentication system
- Role-based access control for admin functions

### 2. Data Validation
- Input validation for notification content
- SQL injection prevention
- XSS protection for notification messages

### 3. Rate Limiting
- Implement rate limiting for notification sending
- Prevent spam notifications
- Monitor for abuse patterns

### 4. Privacy
- Notifications only visible to intended recipients
- Secure WebSocket connections
- Audit logging for sensitive operations

## Best Practices

### 1. Role Targeting
- Always specify target roles when sending notifications
- Use appropriate notification types for different scenarios
- Avoid sending unnecessary notifications to all users
- Group related notifications when possible

### 2. Performance
- Use bulk notifications for multiple recipients
- Implement proper pagination for notification lists
- Clean up old notifications regularly
- Monitor system performance metrics

### 3. User Experience
- Provide clear, actionable notification messages
- Use appropriate notification types (info, success, warning, error)
- Allow users to control notification preferences
- Implement notification grouping and threading

### 4. Error Handling
- Graceful degradation when WebSocket fails
- Fallback to email notifications for critical messages
- Comprehensive error logging and monitoring
- Automatic retry mechanisms for failed deliveries

## Troubleshooting

### Common Issues

#### 1. Notifications Not Delivered
- Check WebSocket connection status
- Verify user role assignments
- Check notification service logs
- Verify Redis is running and accessible

#### 2. Role-Based Filtering Not Working
- Ensure users have correct role assignments
- Verify role names match exactly (case-sensitive)
- Check notification service configuration
- Verify target_roles parameter is correctly set

#### 3. WebSocket Connection Issues
- Verify Redis is running and accessible
- Check channel layer configuration
- Monitor WebSocket connection logs
- Verify authentication middleware is working

#### 4. Performance Issues
- Check database query performance
- Monitor Redis memory usage
- Verify notification batching is working
- Check for notification loops or duplicates

### Debug Commands
```python
# Check user roles
User.objects.filter(is_active=True).values('id', 'username', 'role')

# Check notifications by role
Notification.objects.filter(recipient__role='stagiaire').count()

# Check WebSocket connections
WebSocketConnection.objects.filter(is_active=True).count()

# Check notification events
NotificationEvent.objects.filter(processed=False).count()

# Check Redis connections
import redis
r = redis.Redis()
r.info('clients')
```

### Debug Tools
```python
# Enable debug logging
import logging
logging.getLogger('notification_service').setLevel(logging.DEBUG)

# Test WebSocket connection
import websocket
ws = websocket.create_connection('ws://localhost:8000/ws/notifications/')
ws.send('{"type": "ping"}')
response = ws.recv()
print(response)
ws.close()
```

## Future Enhancements

### Planned Features
1. **Notification preferences** - User-configurable notification settings
2. **Email integration** - Send notifications via email for important events
3. **Push notifications** - Mobile push notification support
4. **Notification templates** - Predefined notification message templates
5. **Advanced filtering** - Date, type, and content-based filtering
6. **Notification scheduling** - Send notifications at specific times
7. **Multi-language support** - Localized notification messages
8. **Rich notifications** - Support for images, links, and actions

### Scalability Considerations
1. **Queue management** - Implement notification queuing for high-volume scenarios
2. **Batch processing** - Process notifications in batches for better performance
3. **Caching** - Cache frequently accessed notification data
4. **Load balancing** - Distribute WebSocket connections across multiple servers
5. **Microservices** - Split notification service into smaller, focused services
6. **Event streaming** - Use Apache Kafka or similar for high-throughput scenarios

### Integration Possibilities
1. **Slack integration** - Send notifications to Slack channels
2. **Microsoft Teams** - Integration with Teams for enterprise users
3. **SMS notifications** - Send critical notifications via SMS
4. **Webhook support** - Allow external systems to receive notifications
5. **Analytics integration** - Track notification engagement and effectiveness

## Migration Guide

### From Old System
If migrating from a previous notification system:

1. **Backup existing data**
2. **Run database migrations**
3. **Update frontend WebSocket connections**
4. **Test role-based functionality**
5. **Verify notification delivery**

### Database Migrations
```bash
# Run migrations
python manage.py makemigrations notification_service
python manage.py migrate

# Verify migration
python manage.py showmigrations notification_service
```

### Configuration Updates
1. Update Django settings with new notification configuration
2. Configure Redis for WebSocket support
3. Update frontend WebSocket connection URLs
4. Test all notification endpoints

## Conclusion

The role-based notification system is now fully functional and provides:

✅ **Proper role-based targeting** - Each actor receives relevant notifications  
✅ **Real-time delivery** - WebSocket-based instant notifications  
✅ **Comprehensive coverage** - All major system events are covered  
✅ **Scalable architecture** - Built for growth and performance  
✅ **Easy integration** - Simple API for frontend and backend use  
✅ **Robust error handling** - Graceful degradation and fallback mechanisms  
✅ **Performance optimization** - Efficient database queries and WebSocket management  
✅ **Security features** - Authentication, validation, and access control  
✅ **Monitoring capabilities** - Comprehensive logging and statistics  
✅ **Future-ready** - Designed for easy enhancement and scaling  

This system ensures that every user in the StageBloom application receives the notifications they need, when they need them, based on their role and involvement in the system. The architecture is designed to handle growth while maintaining performance and reliability.

## Support and Maintenance

### Getting Help
- Check the logs for error messages
- Review this documentation
- Test with the provided test scripts
- Contact the development team

### Regular Maintenance
- Monitor system performance metrics
- Clean up old notifications and events
- Update notification templates as needed
- Review and optimize database queries
- Monitor Redis memory usage and performance

### Updates and Upgrades
- Keep dependencies up to date
- Monitor for security updates
- Test new features in staging environment
- Plan maintenance windows for updates
