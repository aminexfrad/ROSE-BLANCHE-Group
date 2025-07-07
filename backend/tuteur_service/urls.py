from django.urls import path
from . import views

urlpatterns = [
    # Stage management
    path('stages/', views.TuteurStagesView.as_view(), name='tuteur-stages'),
    path('stages/<int:pk>/', views.TuteurStageDetailView.as_view(), name='tuteur-stage-detail'),
    path('stages/<int:pk>/students/', views.TuteurStageStudentsView.as_view(), name='tuteur-stage-students'),
    
    # Step validation
    path('steps/<int:pk>/validate/', views.StepValidationView.as_view(), name='step-validation'),
    path('steps/<int:pk>/reject/', views.StepRejectionView.as_view(), name='step-rejection'),
    
    # Document approval
    path('documents/', views.TuteurDocumentsView.as_view(), name='tuteur-documents'),
    path('documents/<int:pk>/approve/', views.DocumentApprovalView.as_view(), name='document-approval'),
    path('documents/<int:pk>/reject/', views.DocumentRejectionView.as_view(), name='document-rejection'),
    
    # Evaluations
    path('evaluations/', views.TuteurEvaluationsView.as_view(), name='tuteur-evaluations'),
    path('evaluations/create/', views.TuteurEvaluationCreateView.as_view(), name='tuteur-evaluation-create'),
    path('evaluations/<int:pk>/', views.TuteurEvaluationDetailView.as_view(), name='tuteur-evaluation-detail'),
    
    # Notifications
    path('notifications/', views.TuteurNotificationsView.as_view(), name='tuteur-notifications'),
    path('notifications/<int:pk>/read/', views.TuteurNotificationReadView.as_view(), name='tuteur-notification-read'),
    
    # Planning and statistics
    path('planning/', views.TuteurPlanningView.as_view(), name='tuteur-planning'),
    path('statistics/', views.TuteurStatisticsView.as_view(), name='tuteur-statistics'),
] 