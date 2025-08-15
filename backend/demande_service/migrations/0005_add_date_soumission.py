# Generated manually to fix the date_soumission field issue

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('demande_service', '0004_remove_cin_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='demande',
            name='date_soumission',
            field=models.DateField(
                default=django.utils.timezone.now,
                help_text='Date automatique de soumission de la demande',
                verbose_name='date de soumission'
            ),
            preserve_default=False,
        ),
    ]
