# Real-Time Notification System

## Overview

The Stage-bloom application implements a comprehensive real-time notification system that enables instant communication between the backend and frontend. The system uses WebSockets for real-time updates and provides a robust architecture for handling various types of notifications.

## Architecture

### Components

1. **Backend (Django + Channels)**
   - Django Channels for WebSocket support
   - Redis as the channel layer backend
   - Celery for background task processing
   - Notification service for event handling

2. **Frontend (Next.js + Socket.IO)**
   - Socket.IO client for WebSocket communication
   - React hooks for state management
   - Real-time UI components

3. **Database**
   - Notification models for persistence
   - Event tracking for audit trails
   - Template system for dynamic content

## Backend Implementation

### Dependencies

Add the following to `backend/requirements.txt`:

```txt
# Real-time notifications
channels==4.0.0
channels-redis==4.1.0
daphne==4.0.0
redis==5.0.1
celery==5.3.4
```

### Configuration

#### Django Settings (`backend/gateway/stagebloom/settings.py`)

```python
INSTALLED_APPS = [
    # ... existing apps
    'channels',  # WebSocket support
    'notification_service',  # New notification service
]

# Channels Configuration
ASGI_APPLICATION = 'stagebloom.asgi.application'

# Channel Layers for WebSocket
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Redis Configuration
REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_DB = config('REDIS_DB', default=0, cast=int)

# Celery Configuration
CELERY_BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
CELERY_RESULT_BACKEND = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
```

#### ASGI Configuration (`backend/gateway/stagebloom/asgi.py`)

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from notification_service.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
```

### Models

#### NotificationEvent (`backend/notification_service/models.py`)

```python
class NotificationEvent(models.Model):
    class EventType(models.TextChoices):
        SYSTEM = 'system', _('System Event')
        USER_ACTION = 'user_action', _('User Action')
        STAGE_UPDATE = 'stage_update', _('Stage Update')
        DOCUMENT_UPLOAD = 'document_upload', _('Document Upload')
        EVALUATION = 'evaluation', _('Evaluation')
        SURVEY = 'survey', _('Survey')
        TESTIMONIAL = 'testimonial', _('Testimonial')
        DEMANDE = 'demande', _('Demande')
        KPI_ALERT = 'kpi_alert', _('KPI Alert')

    event_type = models.CharField(max_length=20, choices=EventType.choices)
    event_data = models.JSONField(default=dict)
    source_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    target_users = models.ManyToManyField(User, related_name='targeted_events', blank=True)
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
```

#### NotificationTemplate (`backend/notification_service/models.py`)

```python
class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    notification_type = models.CharField(max_length=10, choices=[
        ('info', _('Information')),
        ('success', _('Succès')),
        ('warning', _('Avertissement')),
        ('error', _('Erreur')),
    ], default='info')
    is_active = models.BooleanField(default=True)
```

#### WebSocketConnection (`backend/notification_service/models.py`)

```python
class WebSocketConnection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websocket_connections')
    connection_id = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### WebSocket Consumers

#### NotificationConsumer (`backend/notification_service/consumers.py`)

Handles real-time notifications for individual users:

```python
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate user
        # Join user-specific and role-based groups
        # Store connection in database

    async def disconnect(self, close_code):
        # Remove from groups
        # Mark connection as inactive

    async def receive(self, text_data):
        # Handle ping/pong
        # Mark notifications as read
        # Request notifications list

    async def notification_message(self, event):
        # Send notification to client

    async def system_message(self, event):
        # Send system message to client
```

#### BroadcastConsumer (`backend/notification_service/consumers.py`)

Handles broadcast messages for admin/RH users:

```python
class BroadcastConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Verify admin/RH permissions
        # Join broadcast group

    async def broadcast_message(self, event):
        # Send broadcast message to client
```

### Service Layer

#### NotificationService (`backend/notification_service/services.py`)

Central service for notification operations:

```python
class NotificationService:
    def create_event(self, event_type, event_data, source_user=None, target_users=None):
        # Create notification event

    def process_event(self, event):
        # Process event and create notifications
        # Send real-time updates

    def send_notification(self, recipient, title, message, notification_type='info'):
        # Send direct notification

    def send_bulk_notifications(self, recipients, title, message, notification_type='info'):
        # Send to multiple users

    def send_broadcast(self, message, level='info', target_roles=None):
        # Send broadcast message
```

### API Endpoints

#### Notification Management (`backend/notification_service/urls.py`)

```python
urlpatterns = [
    path('events/', views.NotificationEventListView.as_view(), name='events'),
    path('templates/', views.NotificationTemplateListView.as_view(), name='templates'),
    path('templates/<int:pk>/', views.NotificationTemplateDetailView.as_view(), name='template-detail'),
    path('connections/', views.WebSocketConnectionListView.as_view(), name='connections'),
    path('test/', views.send_test_notification, name='test-notification'),
    path('broadcast/', views.send_broadcast_message, name='broadcast'),
    path('stats/', views.notification_stats, name='stats'),
]
```

### Signals

#### Automatic Notifications (`backend/notification_service/signals.py`)

```python
@receiver(post_save, sender=Stage)
def stage_created_or_updated(sender, instance, created, **kwargs):
    # Create notifications for stage events

@receiver(post_save, sender=Document)
def document_uploaded(sender, instance, created, **kwargs):
    # Create notifications for document uploads

@receiver(post_save, sender=Testimonial)
def testimonial_submitted(sender, instance, created, **kwargs):
    # Create notifications for testimonial submissions
```

## Frontend Implementation

### Dependencies

Add to `frontend/package.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.4"
  }
}
```

### WebSocket Service (`frontend/lib/websocket.ts`)

```typescript
class WebSocketService {
  private socket: Socket | null = null
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected'

  async connect(token?: string): Promise<void> {
    // Establish WebSocket connection
    // Handle authentication
    // Setup event listeners
  }

  disconnect(): void {
    // Close connection
  }

  sendMessage(type: string, data?: any): void {
    // Send message to server
  }

  on<T extends keyof WebSocketEventMap>(
    event: T,
    handler: (data: WebSocketEventMap[T]) => void
  ): void {
    // Register event handler
  }

  off<T extends keyof WebSocketEventMap>(
    event: T,
    handler: (data: WebSocketEventMap[T]) => void
  ): void {
    // Remove event handler
  }
}
```

### React Hook (`frontend/hooks/use-notifications.ts`)

```typescript
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({...})
  const [loading, setLoading] = useState(false)
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // WebSocket connection management
  // Event handlers
  // API integration
  // Utility functions

  return {
    notifications,
    stats,
    loading,
    connectionState,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
    // ... other utilities
  }
}
```

### UI Components

#### Notification Bell (`frontend/components/notification-bell.tsx`)

```typescript
export function NotificationBell({ className }: NotificationBellProps) {
  const {
    notifications,
    stats,
    loading,
    connectionState,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    isConnected
  } = useNotifications()

  // Render notification bell with popover
  // Show unread count badge
  // Display connection status
}
```

## Usage Examples

### Backend: Creating Notifications

```python
from notification_service.services import notification_service

# Send direct notification
notification_service.send_notification(
    recipient=user,
    title="Nouveau stage assigné",
    message=f"Un stage a été assigné: {stage.title}",
    notification_type="info"
)

# Create event-based notification
event = notification_service.create_event(
    event_type="stage_update",
    event_data={
        "stage_id": stage.id,
        "stage_title": stage.title,
        "new_status": "en_cours"
    },
    source_user=request.user,
    target_users=[stage.stagiaire, stage.tuteur]
)
notification_service.process_event(event)

# Send broadcast
notification_service.send_broadcast(
    message="Maintenance prévue ce soir à 22h",
    level="warning",
    target_roles=["admin", "rh"]
)
```

### Frontend: Using Notifications

```typescript
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationBell } from '@/components/notification-bell'

function App() {
  const { notifications, markAsRead, isConnected } = useNotifications()

  return (
    <div>
      <NotificationBell />
      {/* Rest of app */}
    </div>
  )
}
```

## Best Practices

### Scalability

1. **Redis Clustering**: Use Redis Cluster for high availability
2. **Load Balancing**: Implement WebSocket load balancing
3. **Connection Limits**: Set reasonable connection limits per user
4. **Message Queuing**: Use Celery for heavy processing

### Reliability

1. **Connection Recovery**: Automatic reconnection with exponential backoff
2. **Message Persistence**: Store notifications in database
3. **Error Handling**: Graceful degradation when WebSocket fails
4. **Health Checks**: Monitor WebSocket connection health

### Security

1. **Authentication**: Verify user identity on WebSocket connection
2. **Authorization**: Check permissions for broadcast messages
3. **Rate Limiting**: Prevent spam notifications
4. **Input Validation**: Validate all message content

### Performance

1. **Message Batching**: Batch notifications when possible
2. **Connection Pooling**: Reuse WebSocket connections
3. **Caching**: Cache frequently accessed notification data
4. **Compression**: Enable WebSocket compression

## Monitoring and Debugging

### Backend Monitoring

```python
# Log WebSocket connections
logger.info(f"WebSocket connected: {user.username}")

# Monitor notification delivery
logger.info(f"Sent notification to {recipient.username}: {title}")

# Track event processing
logger.info(f"Processed event {event.id}: {len(notifications)} notifications created")
```

### Frontend Monitoring

```typescript
// Monitor connection state
console.log('WebSocket connection state:', connectionState)

// Track notification events
websocketService.on('notification', (data) => {
  console.log('Received notification:', data)
  analytics.track('notification_received', data)
})
```

### Health Checks

```python
# Check Redis connection
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()
await channel_layer.group_send("health_check", {"type": "ping"})

# Check active connections
active_connections = WebSocketConnection.objects.filter(is_active=True).count()
```

## Deployment

### Environment Variables

```bash
# Backend
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_DB=0
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer

# Frontend
NEXT_PUBLIC_WS_URL=wss://api.stagebloom.com
```

### Docker Configuration

```dockerfile
# Install Redis
RUN apt-get update && apt-get install -y redis-server

# Start Redis and Daphne
CMD ["sh", "-c", "redis-server --daemonize yes && daphne -b 0.0.0.0 -p 8001 stagebloom.asgi:application"]
```

### Production Considerations

1. **SSL/TLS**: Use WSS (WebSocket Secure) in production
2. **Load Balancer**: Configure for WebSocket support
3. **Monitoring**: Set up alerts for connection issues
4. **Backup**: Regular Redis data backups
5. **Scaling**: Horizontal scaling with Redis Cluster

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check Redis server status
2. **Authentication Failed**: Verify JWT token format
3. **Messages Not Delivered**: Check channel layer configuration
4. **High Memory Usage**: Monitor Redis memory usage

### Debug Commands

```bash
# Check Redis status
redis-cli ping

# Monitor Redis commands
redis-cli monitor

# Check Django Channels
python manage.py shell
>>> from channels.layers import get_channel_layer
>>> channel_layer = get_channel_layer()
>>> await channel_layer.group_send("test", {"type": "test"})
```

## Conclusion

The real-time notification system provides a robust foundation for instant communication in the Stage-bloom application. It combines the reliability of database persistence with the speed of WebSocket communication, ensuring users receive timely updates about their stages, documents, and system events.

The system is designed to be scalable, secure, and maintainable, with comprehensive monitoring and debugging capabilities. It follows best practices for real-time applications and provides a smooth user experience across all devices and network conditions.
