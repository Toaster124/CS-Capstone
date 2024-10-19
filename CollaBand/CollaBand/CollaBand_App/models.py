from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

# Create your models here.


class Project(models.Model):
    projectName = models.CharField(max_length=50)
    creationdate = models.DateTimeField
    description = models.CharField(max_length=250)
    
    def __str(self):
        return self.projectName
    
#class to show relationships in a project-user relation with permissions
class UserProjectRole(models.Model):
    projectRoles = [
        ('host', 'Host'),
        ('collaborator', 'Collaborator'),
        ('viewer', 'Viewer')
    ]
    
    role = models.CharField(max_length=20, choices=projectRoles)
    permissions = models.CharField(max_length=50)#save for later
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    #cut status
    
    def __str(self):
        return self.role
    

#chat message that links to a Project instance
class ChatMessage(models.Model):
    senderID = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=now)
    content = models.CharField(max_length=200)
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    
    def __str(self):
        return self.timestamp

#MidiInput stores MIDI data as a file, links to a project
class MidiInput(models.Model):
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    deviceName = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=now)
    midiInput = models.FileField() #left as a file of the raw input for now. Might have to change that later to be JSON
    
    def __str(self):
        return self.deviceName

class Instrument(models.Model):
    name = models.CharField(max_length=50)
    #soundfont - use with Web Audio API
    
    def __str(self):
        return self.name
    
class SoundFont(models.Model):
    timestamp = models.DateTimeField(default=now)
    samples = models.CharField(max_length=50)#actual sound processing here This is a PLACEHOLDER
    instrumentID = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    
    def __str(self):
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
    
    def __str(self):
        return self.name

# follow this to get audio stored as a file:
#https://stackoverflow.com/questions/46242355/saving-audio-files-in-django-tablemodel



class VersionControl(models.Model):
    projectID = models.ForeignKey(Project, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=now)
    projectData = models.JSONField()

    def __str(self):
        return self.timestamp