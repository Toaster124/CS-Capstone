
import socketio
from django.conf import settings
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from CollaBand_App.models import Project, ChatMessage, Chat, ChatMsg
from asgiref.sync import sync_to_async



mgr = socketio.AsyncRedisManager(settings.REDIS_URL)
sio = socketio.AsyncServer(
    async_mode="asgi", 
    client_manager=mgr, 
    cors_allowed_origins="*", 
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


def processChanges(data):
    #print(data)

    #parse data
    senderUsername = data["senderID"]
    projectID = data["projectID"]
    projectData = data["data"]
    sender = get_object_or_404(User, username=senderUsername)
    
    # get the project 
    project = get_object_or_404(Project, pk=projectID)

    #edit the project data and save the new project 
    project.data = projectData
    project.save()
    return project


#on reception of a 'message' event
@sio.on("message")
async def handle_message(sid, data):
    print("New Message")
    #print("Socket ID", sid)
    print("Data: ", data, "\nend data\n")
    #print("Type", type(data))
    

    #run the function to perform the back-end work
    project = await sync_to_async(processChanges, thread_sensitive=True)(data) 
    
    '''
    currentRoom = sio.rooms(sid)
    if currentRoom != project.id:
        print(f"Leaving room: {currentRoom} and joining room: {project.id}")
        await sio.leave_room(sid, currentRoom) 
        await sio.enter_room(sid, str(project.id))
    '''    

    #if sender info did not match
    if project == None:
        print("Attempted spoofing detected. No changes made")
    else:
        #notify other clients in a project of a change in project data
        #print("Project.data: ", project.data)
        #print("Room: ", sio.rooms(sid))
        await sio.emit("new_message", data, room=str(project.id))
        print("new_message echoed.")
        #print("Room: ", sio.rooms(sid))
        #await sio.(project.id).emit("new_message", data)

        return


# On reception of a 'join_room' event
@sio.on("join_room")
async def join_room(sid, data):
    print("Socket ID", sid)
    print("sid type", type(sid))
    
    # Convert JSON string to python dict if necessary
    if isinstance(data, str):
        jsonData = json.loads(data)
    else:
        jsonData = data
    
    roomToJoin = str(jsonData["projectID"])
    
    # Leave all rooms except the default room
    rooms = sio.rooms(sid)
    for room in rooms:
        if room != sid:
            await sio.leave_room(sid, room)
    
    # Join the new room
    await sio.enter_room(sid, roomToJoin)
    
    print(f"Joined room: {roomToJoin}")
    await sio.emit("new_join", jsonData, room=roomToJoin)



def backspaceFunct(data):
    try:
        projectID = data["projectID"]
        
        #get the project to edit
        projectToBackspace = Project.objects.get(id=projectID)
        
        #pull the notes from the project
        notes = projectToBackspace.data.get("notes",[])
        #print("\nNotes before deletion: ", notes)
        
        #slice the notes to exclude the last note
        notes = notes[:-1]
        projectToBackspace.data["notes"] = notes
        
        #print("\nNotes after deletion", projectToBackspace.data["notes"])
        projectToBackspace.save()
        print("Backspace")
        return projectID
    except: 
        return False
    
    

@sio.on("backspace")
async def handle_message(sid, data):
    projectId = await sync_to_async(backspaceFunct, thread_sensitive=True)(data) 
    if projectId:
        await sio.emit("new_backspace", data, room=str(projectId))
    
    


@sio.on("disconnect")
async def disconnect(sid):
    print("SocketIO disconnect")
