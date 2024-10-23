"""
ASGI config for CollaBand_Project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CollaBand_Project.settings')
django_asgi_app = get_asgi_application()

#application = get_asgi_application()

# Make all other imports below here

import socketio
from CollaBand_App.sockets import sio

application = socketio.ASGIApp(sio, django_asgi_app)
