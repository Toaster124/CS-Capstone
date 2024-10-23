import socketio
from django.conf import settings
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Project, ChatMessage, Chat, ChatMsg
from .serializers import MessageSerializer
from asgiref.sync import sync_to_async

mgr = socketio.AsyncRedisManager(settings.REDIS_URL)
sio = socketio.AsyncServer(
    async_mode="asgi", 
    client_manager=mgr, 
    cors_allowed_origins="*", 
    ping_timeout=6000, 
    ping_interval=2500
)

#@sio.on("connect")
async def connect(sid, env, auth):
    if auth:
        #Manually set for testing
        #chat_id = auth["chat_id"]
        chat_id = "7ce6aa6a-208a-4c1e-8f96-ebeb8eb16996"
        print("SocketIO connect")
        sio.enter_room(sid, chat_id)
        await sio.emit("connect", f"Connected as {sid}")
    else:
        raise ConnectionRefusedError("No auth")
    

def store_and_return_message(data):
    #data = json.loads(data)
    #data = json.dumps(data)
    print(data)

    #parse data
    sender_id = data["sender_id"]
    chat_id = data["chat_id"]
    text = data["text"]
    sender = get_object_or_404(User, pk=sender_id)
    chat = get_object_or_404(Chat, short_id=chat_id)

    #create and save a chat message
    instance = ChatMsg.objects.create(sender=sender, chat=chat, text=text)
    instance.save()
    #serialize
    message = MessageSerializer(instance).data
    message["chat"] = chat_id
    message["sender"] = str(message["sender"])
    return message


#broadcast a message event
@sio.on("message")
async def print_message(sid, data):
    print("Socket ID", sid)
    message = await sync_to_async(store_and_return_message, thread_sensitive=True)(
        data
    )  # communicating with orm
    await sio.emit("new_message", message, room=message["chat"])


@sio.on("disconnect")
async def disconnect(sid):
    print("SocketIO disconnect")