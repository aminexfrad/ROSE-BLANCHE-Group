"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .services import NotificationService
from .role_notifications import (
    notify_new_stage_created,
    notify_document_uploaded,
    notify_survey_available,
    notify_kpi_alert,
    notify_testimonial_submitted,
    notify_evaluation_completed
)

User = get_user_model()


@receiver(post_save, sender='shared.Stage')
def stage_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for stage-related events
    """
    try:
        if created:
            # New stage created
            notify_new_stage_created(
                stage_id=instance.id,
                source_user=instance.created_by if hasattr(instance, 'created_by') else None
            )
        else:
            # Stage updated
            if hasattr(instance, 'status') and instance.status:
                # Notify stage participants about status change
                notification_service = NotificationService()
                notification_service.send_stage_notification(
                    stage=instance,
                    title="Mise à jour du stage",
                    message=f"Le statut du stage a été mis à jour: {instance.status}",
                    notification_type='info'
                )
    except Exception as e:
        print(f"Error in stage notification handler: {e}")


@receiver(post_save, sender='shared.Document')
def document_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for document-related events
    """
    try:
        if created and hasattr(instance, 'stage'):
            # New document uploaded
            notify_document_uploaded(
                stage_id=instance.stage.id,
                document_title=instance.title or instance.filename,
                source_user=instance.uploaded_by if hasattr(instance, 'uploaded_by') else None
            )
    except Exception as e:
        print(f"Error in document notification handler: {e}")


@receiver(post_save, sender='shared.Survey')
def survey_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for survey-related events
    """
    try:
        if created:
            # New survey available
            notify_survey_available(
                survey_id=instance.id,
                survey_title=instance.title,
                source_user=instance.created_by if hasattr(instance, 'created_by') else None
            )
    except Exception as e:
        print(f"Error in survey notification handler: {e}")


@receiver(post_save, sender='shared.Testimonial')
def testimonial_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for testimonial-related events
    """
    try:
        if created and hasattr(instance, 'stage'):
            # New testimonial submitted
            notify_testimonial_submitted(
                stage_id=instance.stage.id,
                testimonial_title=instance.title or "Nouveau témoignage",
                source_user=instance.author if hasattr(instance, 'author') else None
            )
    except Exception as e:
        print(f"Error in testimonial notification handler: {e}")


@receiver(post_save, sender='demande_service.Demande')
def demande_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for demande-related events
    """
    try:
        if created:
            # New demande created - notify RH users
            notification_service = NotificationService()
            
            # Get RH users from the same company as the demande
            rh_users = User.objects.filter(role='rh')
            
            if instance.entreprise:
                # Filter RH users by company
                rh_users = rh_users.filter(entreprise=instance.entreprise)
            elif instance.offres.exists():
                # Get company from first offer
                first_offer = instance.offres.first()
                if first_offer.entreprise:
                    rh_users = rh_users.filter(entreprise=first_offer.entreprise)
            
            # Create notification event for each RH user
            for rh_user in rh_users:
                notification_service.create_event(
                    event_type='demande',
                    event_data={
                        'demande_id': instance.id,
                        'candidate_name': f"{instance.prenom} {instance.nom}",
                        'candidate_email': instance.email,
                        'specialite': instance.specialite,
                        'type_stage': instance.type_stage,
                        'institut': instance.institut,
                        'status': instance.status
                    },
                    source_user=None,  # System generated
                    target_users=[rh_user]
                )
                
                print(f"✅ Notification de demande créée pour RH: {rh_user.email}")
                
        elif not created and hasattr(instance, 'status'):
            # Demande status updated
            notification_service = NotificationService()
            
            # Notify the candidate about status change
            if instance.user_created:
                notification_service.create_event(
                    event_type='demande_update',
                    event_data={
                        'demande_id': instance.id,
                        'status': instance.status,
                        'message': f"Votre demande de stage a été {instance.status}"
                    },
                    source_user=None,
                    target_users=[instance.user_created]
                )
                
                print(f"✅ Notification de mise à jour créée pour candidat: {instance.user_created.email}")
                
    except Exception as e:
        print(f"Error in demande notification handler: {e}")
        import traceback
        traceback.print_exc()


@receiver(post_save, sender='shared.Evaluation')
def evaluation_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for evaluation-related events
    """
    try:
        if created and hasattr(instance, 'stage'):
            # New evaluation completed
            notify_evaluation_completed(
                stage_id=instance.stage.id,
                evaluator_id=instance.evaluator.id if hasattr(instance, 'evaluator') else None,
                evaluated_id=instance.evaluated.id if hasattr(instance, 'evaluated') else None,
                evaluation_type=instance.evaluation_type or "évaluation",
                source_user=instance.evaluator if hasattr(instance, 'evaluator') else None
            )
    except Exception as e:
        print(f"Error in evaluation notification handler: {e}")


@receiver(post_save, sender='shared.OffreStage')
def offre_stage_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for stage offer events
    """
    try:
        if created:
            # New stage offer available - notify stagiaires
            notification_service = NotificationService()
            notification_service.send_role_notifications(
                target_roles=['stagiaire'],
                title="Nouvelle offre de stage disponible",
                message=f"Une nouvelle offre de stage est disponible: {instance.titre}",
                notification_type='info'
            )
    except Exception as e:
        print(f"Error in offre stage notification handler: {e}")


@receiver(post_save, sender='shared.PFEReport')
def pfe_report_notification_handler(sender, instance, created, **kwargs):
    """
    Handle notifications for PFE report events
    """
    try:
        if created and hasattr(instance, 'stage'):
            # New PFE report submitted - notify tuteur and RH
            notification_service = NotificationService()
            
            # Notify tuteur
            if instance.stage.tuteur:
                notification_service.send_notification(
                    recipient=instance.stage.tuteur,
                    title="Nouveau rapport PFE soumis",
                    message=f"Un nouveau rapport PFE a été soumis par {instance.stage.stagiaire.get_full_name() if instance.stage.stagiaire else 'le stagiaire'}",
                    notification_type='info'
                )
            
            # Notify RH team
            notification_service.send_role_notifications(
                target_roles=['rh'],
                title="Nouveau rapport PFE soumis",
                message=f"Un nouveau rapport PFE a été soumis pour le stage {instance.stage.titre if instance.stage.titre else 'Stage'}",
                notification_type='info'
            )
    except Exception as e:
        print(f"Error in PFE report notification handler: {e}")


# Custom notification triggers for specific business logic
def trigger_stage_completion_notification(stage):
    """
    Trigger notification when a stage is completed
    """
    try:
        notification_service = NotificationService()
        
        # Notify stagiaire
        if stage.stagiaire:
            notification_service.send_notification(
                recipient=stage.stagiaire,
                title="Stage terminé",
                message="Félicitations ! Votre stage a été marqué comme terminé.",
                notification_type='success'
            )
        
        # Notify tuteur
        if stage.tuteur:
            notification_service.send_notification(
                recipient=stage.tuteur,
                title="Stage terminé",
                message=f"Le stage de {stage.stagiaire.get_full_name() if stage.stagiaire else 'votre stagiaire'} a été marqué comme terminé.",
                notification_type='success'
            )
        
        # Notify RH team
        notification_service.send_role_notifications(
            target_roles=['rh'],
            title="Stage terminé",
            message=f"Le stage {stage.titre if stage.titre else 'Stage'} a été marqué comme terminé.",
            notification_type='success'
        )
        
    except Exception as e:
        print(f"Error triggering stage completion notification: {e}")


def trigger_document_approval_notification(document, approved_by):
    """
    Trigger notification when a document is approved
    """
    try:
        notification_service = NotificationService()
        
        # Notify document owner
        if hasattr(document, 'uploaded_by') and document.uploaded_by:
            notification_service.send_notification(
                recipient=document.uploaded_by,
                title="Document approuvé",
                message=f"Votre document '{document.title or document.filename}' a été approuvé par {approved_by.get_full_name()}.",
                notification_type='success'
            )
        
        # Notify stage participants
        if hasattr(document, 'stage') and document.stage:
            if document.stage.tuteur:
                notification_service.send_notification(
                    recipient=document.stage.tuteur,
                    title="Document approuvé",
                    message=f"Le document '{document.title or document.filename}' a été approuvé par {approved_by.get_full_name()}.",
                    notification_type='info'
                )
        
    except Exception as e:
        print(f"Error triggering document approval notification: {e}")


def trigger_survey_completion_notification(survey, completed_by):
    """
    Trigger notification when a survey is completed
    """
    try:
        notification_service = NotificationService()
        
        # Notify RH team about survey completion
        notification_service.send_role_notifications(
            target_roles=['rh'],
            title="Sondage complété",
            message=f"Le sondage '{survey.title}' a été complété par {completed_by.get_full_name()}.",
            notification_type='info'
        )
        
    except Exception as e:
        print(f"Error triggering survey completion notification: {e}")
