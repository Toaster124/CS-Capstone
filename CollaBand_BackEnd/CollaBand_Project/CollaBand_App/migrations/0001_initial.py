# Generated by Django 5.1.2 on 2024-10-22 03:39

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Instrument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_id', models.CharField(default=uuid.uuid4, max_length=255, unique=True)),
                ('acceptor', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='acceptor_name', to=settings.AUTH_USER_MODEL)),
                ('initiator', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='initiator_chat', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ChatMsg',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='CollaBand_App.chat')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('projectName', models.CharField(max_length=50)),
                ('description', models.CharField(default='', max_length=250)),
                ('userID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MidiInput',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deviceName', models.CharField(max_length=50)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('midiInput', models.FileField(upload_to='')),
                ('projectID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CollaBand_App.project')),
            ],
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('content', models.CharField(max_length=200)),
                ('senderID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('projectID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CollaBand_App.project')),
            ],
        ),
        migrations.CreateModel(
            name='AudioTrack',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='audioTrack', max_length=50)),
                ('audioData', models.FileField(upload_to='')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('format', models.CharField(choices=[('mp3', '.MP3'), ('wav', '.WAV')], max_length=20)),
                ('sampleRate', models.IntegerField()),
                ('projectID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CollaBand_App.project')),
            ],
        ),
        migrations.CreateModel(
            name='SoundFont',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('samples', models.CharField(max_length=50)),
                ('instrumentID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CollaBand_App.instrument')),
            ],
        ),
        migrations.CreateModel(
            name='UserProjectRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('host', 'Host'), ('collaborator', 'Collaborator'), ('viewer', 'Viewer')], max_length=20)),
                ('permissions', models.CharField(max_length=50)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='VersionControl',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('projectData', models.JSONField()),
                ('projectID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CollaBand_App.project')),
            ],
        ),
    ]
