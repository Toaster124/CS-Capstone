# Generated by Django 5.1.2 on 2024-10-23 22:04

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CollaBand_App', '0002_alter_chat_acceptor'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='creationdate',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
