# Generated by Django 5.1.2 on 2024-10-26 04:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CollaBand_App', '0005_project_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprojectrole',
            name='role',
            field=models.CharField(choices=[('collaborator', 'Collaborator'), ('viewer', 'Viewer')], max_length=20),
        ),
    ]
