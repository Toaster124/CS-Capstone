
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
    
    
    data = json.loads(data) #turns json => dict
    #data = json.dumps(data) #turns dict => json

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
async def print_message(sid, data):
    print("Socket ID", sid)
    

    #run the function to perform the back-end work
    project = await sync_to_async(store_and_return_message, thread_sensitive=True)(data) 
    
    currentRoom = sio.rooms(sid)[0]
    if currentRoom != project.id:
        print(f"Leaving room: {currentRoom} and joining room: {project.id}")
        await sio.leave_room(sid, currentRoom) 
        await sio.enter_room(sid, str(project.id))

    #if sender info did not match
    if project == None:
        print("Attempted spoofing detected. No changes made")
    else:
        #notify other clients in a project of a change in project data
        print("Project.data: ", project.data)
        print("Room: ", sio.rooms(sid))
        await sio.emit("new_message", data, room=str(project.id))

#on reception of a 'join_room' event
@sio.on("join_room")
async def print_join(sid, data):
    print("Socket ID", sid)
    
    #convert JSON string to python dict
    jsonData=json.loads(data)
    
    roomToJoin = jsonData["projectID"]
    
    currentRoom = sio.rooms(sid)[0]
    if currentRoom != roomToJoin:
        print(f"Leaving room: {currentRoom} and joining room: {roomToJoin}")
        await sio.leave_room(sid, currentRoom) 
        await sio.enter_room(sid, str(roomToJoin))
        
    print("Room: ", sio.rooms(sid))
    await sio.emit("new_join", data, room=str(roomToJoin))


@sio.on("disconnect")
async def disconnect(sid):
    print("SocketIO disconnect")
