from django.contrib import admin


from .models import Project, UserProjectRole, ChatMessage, MidiInput, Instrument, SoundFont, AudioTrack, VersionControl
# Register your models here.

admin.site.register(Project)
admin.site.register(UserProjectRole)
admin.site.register(ChatMessage)
admin.site.register(MidiInput)
admin.site.register(Instrument)
admin.site.register(SoundFont)
admin.site.register(AudioTrack)
admin.site.register(VersionControl)
