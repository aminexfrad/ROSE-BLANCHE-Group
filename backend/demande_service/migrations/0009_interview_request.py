from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth_service', '0001_initial'),
        ('demande_service', '0008_alter_demande_entreprise_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='InterviewRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('proposed_date', models.DateField(verbose_name='date proposée')),
                ('proposed_time', models.TimeField(verbose_name='heure proposée')),
                ('location', models.CharField(max_length=500, verbose_name='lieu proposé')),
                ('status', models.CharField(choices=[('PENDING_TUTEUR', 'En attente du tuteur'), ('ACCEPTED', 'Accepté par le tuteur'), ('REJECTED', 'Refusé par le tuteur'), ('RESCHEDULE_REQUESTED', "Proposition d'un autre créneau")], default='PENDING_TUTEUR', max_length=30, verbose_name='statut')),
                ('tuteur_comment', models.TextField(blank=True, verbose_name='commentaire du tuteur')),
                ('alternative_date', models.DateField(blank=True, null=True, verbose_name="autre date proposée")),
                ('alternative_time', models.TimeField(blank=True, null=True, verbose_name="autre heure proposée")),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='date de création')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='date de modification')),
                ('demande', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interview_requests', to='demande_service.demande')),
                ('rh', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='interview_requests_created', to='auth_service.user')),
                ('tuteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interview_requests_assigned', to='auth_service.user')),
            ],
            options={
                'verbose_name': "demande d'entretien",
                'verbose_name_plural': "demandes d'entretien",
                'db_table': 'interview_request',
                'ordering': ['-created_at'],
            },
        ),
    ]


