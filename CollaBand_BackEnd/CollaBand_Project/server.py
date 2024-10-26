import uvicorn
import socket

#get local IP address (not localhost)
localIP = socket.gethostbyname(socket.gethostname())
print(localIP)

if __name__ == "__main__":
    uvicorn.run("CollaBand_Project.asgi:application", host=localIP , port=8000, reload=True)
