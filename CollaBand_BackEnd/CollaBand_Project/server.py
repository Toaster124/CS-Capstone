import uvicorn

if __name__ == "__main__":
    uvicorn.run("CollaBand_Project.asgi:application", reload=True)
