
import socketio
from django.conf import settings
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Project, ChatMessage, Chat, ChatMsg
from asgiref.sync import sync_to_async

mgr = socketio.AsyncRedisManager(settings.REDIS_URL)
sio = socketio.AsyncServer(
    async_mode="asgi", 
    client_manager=mgr, 
    cors_allowed_origins="*", 
    ping_timeout=6000, 
    ping_interval=2500
)

# on sio connection:
#@sio.on("connect")
async def connect(sid, env):
    print("CONNECTED")
    #Manually set for testing
    #chat_id = auth["chat_id"]
    projectID = 1
    print("SocketIO connect")
    await sio.enter_room(sid, projectID)
    print("Room: ", sio.rooms(sid))
    await sio.emit("connect", f"Connected as {sid}")


def store_and_return_message(data):
    
    if data:
        data = json.loads(data) #turns json => dict
    #data = json.dumps(data) #turns dict => json
    else:
        data = {}

    #(using postman it's being processed as a dict)

    print(data)

    #parse data
    senderID = data["senderID"]
    projectID = data["projectID"]
    projectData = data["data"]
    sender = get_object_or_404(User, pk=senderID)
    #if the logged-in sender does not match the message's sender
    
    # else
    # get the project 
    project = get_object_or_404(Project, pk=projectID)

    #edit the project data and save the new project 
    project.data = projectData
    project.save()
    return project


#on reception of a 'message' event
@sio.on("message")
async def handle_message(sid, data):
    print("Socket ID", sid)
    
    # Deserialize data if necessary
    if isinstance(data, str):
        jsonData = json.loads(data)
    else:
        jsonData = data

    # Run the function to perform the back-end work
    project = await sync_to_async(store_and_return_message, thread_sensitive=True)(jsonData) 
    
    if project is None:
        print("Attempted spoofing detected. No changes made")
        return

    project_id_str = str(project.id)
    rooms = await sio.rooms(sid)

    # Ensure the user is in the correct room
    if project_id_str not in rooms:
        print(f"Adding sid to room: {project_id_str}")
        await sio.enter_room(sid, project_id_str)

    # Notify other clients in the project room
    print("Project.data: ", project.data)
    await sio.emit("new_message", jsonData, room=project_id_str)


# On reception of a 'join_room' event
@sio.on("join_room")
async def join_room(sid, data):
    print("Socket ID", sid)
    
    # Convert JSON string to python dict if necessary
    if isinstance(data, str):
        jsonData = json.loads(data)
    else:
        jsonData = data
    
    roomToJoin = str(jsonData["projectID"])
    
    # Leave all rooms except the default room
    rooms = await sio.rooms(sid)
    for room in rooms:
        if room != sid:
            await sio.leave_room(sid, room)
    
    # Join the new room
    await sio.enter_room(sid, roomToJoin)
    
    print(f"Joined room: {roomToJoin}")
    await sio.emit("new_join", jsonData, room=roomToJoin)



@sio.on("disconnect")
async def disconnect(sid):
    print("SocketIO disconnect")
