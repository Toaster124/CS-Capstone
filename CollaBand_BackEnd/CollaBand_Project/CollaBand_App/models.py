from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
import uuid


class Project(models.Model):
    projectName = models.CharField(max_length=50)
    creationdate = models.DateTimeField(default=now)
    description = models.CharField(max_length=250, default="")
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.projectName
    
#class to show relationships in a project-user relation with permissions
class UserProjectRole(models.Model):
    projectRoles = [
        ('host', 'Host'),
        ('collaborator', 'Collaborator'),
        ('viewer', 'Viewer')
    ]
    
    role = models.CharField(max_length=20, choices=projectRoles)
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.userID} - {self.role} of project: {self.projectID}"
    

#chat message that links to a Project instance
class ChatMessage(models.Model):
    senderID = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=now)
    content = models.CharField(max_length=200)
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.timestamp

#MidiInput stores MIDI data as a file, links to a project
class MidiInput(models.Model):
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    deviceName = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=now)
    midiInput = models.FileField() #left as a file of the raw input for now. Might have to change that later to be JSON
    
    def __str__(self):
        return self.deviceName

class Instrument(models.Model):
    name = models.CharField(max_length=50)
    #soundfont - use with Web Audio API
    
    def __str__(self):
        return self.name
    
class SoundFont(models.Model):
    timestamp = models.DateTimeField(default=now)
    samples = models.CharField(max_length=50)#actual sound processing here This is a PLACEHOLDER
    instrumentID = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.samples

class AudioTrack(models.Model):
    formatTypes = [
        ('mp3', '.MP3'),
        ('wav', '.WAV'),
    ]
    
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, default="audioTrack")
    audioData = models.FileField()
    timestamp = models.DateTimeField(default=now)
    format = models.CharField(max_length=20, choices=formatTypes)
    sampleRate = models.IntegerField()
    
    def __str__(self):
        return self.name

# follow this to get audio stored as a file:
#https://stackoverflow.com/questions/46242355/saving-audio-files-in-django-tablemodel



class VersionControl(models.Model):
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=now)
    projectData = models.JSONField()

    def __str__(self):
        return self.timestamp
    

#Below - socket.io tutorial models

class Chat(models.Model):
    initiator = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, related_name="initiator_chat"
    )
    acceptor = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, related_name="acceptor_chat",
        null=True
    )
    short_id = models.CharField(max_length=255, default=uuid.uuid4, unique=True)

    def __str__(self):
        return f"Chat between {self.initiator} and {self.acceptor}"


class ChatMsg(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    text = models.TextField()
    created_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"Message from {self.sender} in chat {self.chat.short_id}"