"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Import the Celery app
from .celery import app

# Configure periodic tasks
app.conf.beat_schedule = {
    # Deactivate inactive candidate accounts every Sunday at 2:00 AM
    'deactivate-inactive-candidates': {
        'task': 'candidat_service.tasks.deactivate_inactive_candidate_accounts',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Sunday at 2:00 AM
        'options': {'queue': 'default'}
    },
    
    # Check candidate activity every day at 6:00 AM
    'check-candidate-activity': {
        'task': 'candidat_service.tasks.check_candidate_activity',
        'schedule': crontab(hour=6, minute=0),  # Daily at 6:00 AM
        'options': {'queue': 'default'}
    },
    
    # Send warning emails to candidates approaching deactivation (11 months)
    'send-deactivation-warnings': {
        'task': 'candidat_service.tasks.send_deactivation_warnings',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),  # Monday at 9:00 AM
        'options': {'queue': 'default'}
    },
}

# Task routing
app.conf.task_routes = {
    'candidat_service.tasks.*': {'queue': 'default'},
}

# Task serialization
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
app.conf.accept_content = ['json']

# Task time limits
app.conf.task_soft_time_limit = 300  # 5 minutes
app.conf.task_time_limit = 600       # 10 minutes

# Worker settings
app.conf.worker_prefetch_multiplier = 1
app.conf.worker_max_tasks_per_child = 1000

# Result backend settings
app.conf.result_expires = 3600  # 1 hour

# Beat settings
app.conf.beat_max_loop_interval = 60  # Maximum time between beat checks
