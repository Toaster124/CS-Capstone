from django.shortcuts import render

# Create your views here.
'''
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import APIView
from rest_framework import viewsets
#from .serializers import 
from rest_framework import generics
from .models import MenuItem, Cart, Order, OrderItem
from .serializers import MenuItemSerializer, UserSerializer, ManagerDelete, CartSerializer, OrderSerializer, OrderItemSerializer, DeliveryOrderSerializer, ManagerOrderSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User, Group, AnonymousUser
from django.db.models import Exists
from rest_framework.decorators import permission_classes, throttle_classes
from django.contrib.auth.mixins import UserPassesTestMixin
from datetime import date
from django.shortcuts import get_list_or_404, get_object_or_404
'''

from django.shortcuts import render
# Create your views here.

from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponsePermanentRedirect, JsonResponse, Http404 
from django.urls import reverse
from django.shortcuts import get_object_or_404, render
from django.views import View
from django.views.generic.base import TemplateView
from rest_framework.response import Response
from CollaBand_App.models import Project, UserProjectRole, User
import json
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserSerializer, ChatSerializer
from .models import Project, Chat
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
<<<<<<< Updated upstream
=======
from .models import (
    Project, 
    UserProjectRole, 
    Chat, 
    ChatMsg
)
from .serializers import (
    UserSerializer,
    ProjectSerializer,
    UserProjectRoleSerializer,
    ChatSerializer,
    ChatMsgSerializer
)
import json
from django.db import IntegrityError
>>>>>>> Stashed changes


#for home
def home_view(request):
    return render(request, 'index_toros.html')

def homepage(request):
    return 200

'''def dashboard(request):
    return 200'''

#class view to display the homepage template
class homepage(TemplateView):
    template_name='index.html'
    

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

# Custom Login View (to obtain auth token)
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')

        # Try to authenticate with the provided credentials
        user = authenticate(username=email_or_username, password=password)
        if not user:
            # If no user found by username, try email
            try:
                user_obj = User.objects.get(email=email_or_username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

# Login View (Retained for completeness)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    return Response({'message': 'Login endpoint'}, status=status.HTTP_200_OK)

#Dashboard View
@api_view(['GET', 'PUT', 'POST', 'DELETE'])
def dashboard(request):
    if request.user.is_authenticated: #NP note: could change this to a decorator
        user = request.user
        if request.body:
            data = json.loads(request.body.decode('utf-8'))
        
        if request.method == 'GET':     #return user's projects  
            try:
                #pull all projects which given user is a member and their role information
                userProjects = UserProjectRole.objects.filter(userID=user).select_related('projectID')

                projectsWithRole = [ {
                    'project_id': project.projectID.id,
                    'project_name': project.projectID.projectName,
                    'description':project.projectID.description,
                    'role': project.role
                } 
                for project in userProjects ]

                toReturn = {
                    'message':'Projects returned',
                    'projects':projectsWithRole
                }
                return Response(toReturn, status=200)    
                #projects = Project.objects.filter(userID=user)
            
            except:
                return Response({'error':'No projects found'}, status=404)

        elif request.method == 'POST':  #create new project 
            try:
                newProjectName = data.get('projectName')
                newProjectDescription = data.get('description', "")
                
                if newProjectName:
                    #create new project
                    projectToCreate = Project.objects.create(projectName=newProjectName, description=newProjectDescription, userID=user)

                    #assign user to that project as the host
                    UserProjectRole.objects.create(role='host', userID=user, projectID=projectToCreate)
                return Response({'message':'New project created successfully'}, status=200)
        
            except:
                return Response({'error':'Project could not be created'}, status=400)
        
        elif request.method == 'PUT':   #modify a project field
            #try:
                projectID = data.get('projectID')
                projectToChange = Project.objects.get(id=projectID, userID=user)
                
                #changing project name
                newProjectName = data.get('projectName', projectToChange.projectName)       #second value is the default if no parameter is sent in the JSON
                newProjectDescription = data.get('description', projectToChange.description) 

                #set project changes
                projectToChange.projectName = newProjectName
                projectToChange.description = newProjectDescription

                # save project changes
                projectToChange.save() 

<<<<<<< Updated upstream
                #if the user has added a user as a specific role
                newUserRole = data.get('role')
                if newUserRole: 
                    userToAddID = data.get('userID')
                    newUserToAdd = User.objects.get(id=userToAddID)
                    #create instance to then add
                    userRoleToCreate = UserProjectRole()
                    userRoleToCreate.role = newUserRole
                    userRoleToCreate.userID = newUserToAdd
                    userRoleToCreate.projectID = projectToChange
                    #save new role relation
                    userRoleToCreate.save()


                return Response({'message':'Project modified successfully'}, status=200)
            #except:
                return Response({'error':'Project could not be modified'}, status=404)
           
        elif request.method == 'DELETE': #delete a project
            try:
                projectID = data.get('projectID')
                projectToDelete = Project.objects.get(id=projectID, userID=user)   

                #delete project
                projectToDelete.delete()
                return Response({'message':'Project deleted successfully'}, status=200)
            except:
                return Response({'error':'Project not found'}, status=404)
        
        else:
            return HttpResponseNotAllowed(['GET', 'POST', 'PUT', 'DELETE'])
    else: 
        return Response({'message':'Please log in'}) #placeholder
    
@api_view(['GET'])
def projectDAW(request, projectID):
=======
    else:
        return HttpResponseNotAllowed(['GET', 'POST', 'DELETE'])

# Project Details View
@api_view(['GET', 'DELETE', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def projectDAW(request, projectID):
    user = request.user
    if request.body:
        data = json.loads(request.body.decode('utf-8'))
    else:
        data = {}

    if request.method == 'GET':
        try:
            user_project_role = UserProjectRole.objects.get(userID=user, projectID=projectID)
            project = user_project_role.projectID

            project_data = {
                'project_id': project.id,
                'project_name': project.projectName,
                'description': project.description,
                'data': project.data,
            }

            response_data = {
                'message': 'Project returned',
                'project': project_data,
                'userRole': user_project_role.role,
            }

            return Response(response_data, status=200)

        except UserProjectRole.DoesNotExist:
            return Response({'error': 'You are not associated with this project.'}, status=403)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
    elif request.method == 'PUT':   #modify a project field
        try:
            #projectID = data.get('projectID')
            projectToChange = Project.objects.get(id=projectID, userID=user)
            
            if data.project:
                #change project info
                newProjectName = data.get('project_name', projectToChange.projectName)       #second value is the default if no parameter is sent in the JSON
                newProjectDescription = data.get('description', projectToChange.description) 

                #set project changes
                projectToChange.projectName = newProjectName
                projectToChange.description = newProjectDescription

                # save project changes
                projectToChange.save()
                return Response({'message':'Project modified successfully'}, status=200)
            elif data.user_project_role:
                #add a user
                newUserRole = data.user_project_role.get('role')
                newUsernameToAdd = data.user_project_role.get('username')
                
                if newUserRole and newUsernameToAdd:
                    if newUserRole in ('collaborator', 'viewer'):
                        #turn username into a User
                        newUserToAdd = User.objects.get(username=newUsernameToAdd)
                        
                        #create new userProjectRole object
                        userRoleToCreate = UserProjectRole()
                        
                        #assign fields
                        userRoleToCreate.role = newUserRole
                        userRoleToCreate.userID = newUserToAdd
                        userRoleToCreate.projectID = projectToChange
                        #save new role relation
                        userRoleToCreate.save()
                        return Response({'message':'User added successfully.'}, status=200)
        
        except Project.DoesNotExist:
            return Response({'error': 'You are not the owner of this project and cannot modify it.'}, status=403)
        except UserProjectRole.DoesNotExist:
            return Response({'error': 'You are not associated with this project.'}, status=403)
        
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    
    elif request.method == 'DELETE':
        try:
            user_project_role = UserProjectRole.objects.get(userID=user, projectID=projectID)
            if user_project_role.role != 'host':
                return Response({'error': 'You do not have permission to delete this project.'}, status=403)

            project_to_delete = user_project_role.projectID
            project_to_delete.delete()
            return Response({'message': 'Project deleted successfully'}, status=200)

        except Project.DoesNotExist:
            return Response({'error': 'You are not the owner of this project and cannot modify it.'}, status=403)
        except User.DoesNotExist:
            return Response({'error': 'The specified user does not exist.'}, status=404)
        except IntegrityError:
            return Response({'error': 'An error occurred while trying to add the user to the project.'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    else:
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def userSettings(request):
>>>>>>> Stashed changes
    if request.method == 'GET':
        user = request.user
        try:
            #pull all projects which given user is a member and match the requested projectID, and their role information
            userProject = UserProjectRole.objects.filter(userID=user, projectID=projectID).select_related('projectID')

            projectWithRole = [ {
                'project_id': project.projectID.id,
                'project_name': project.projectID.projectName,
                'description':project.projectID.description,
                'role': project.role,
                'data': project.projectID.data
            } 
            for project in userProject ]

            toReturn = {
                'message':'Project returned',
                'project':projectWithRole
            }
            return Response(toReturn, status=200)
        except:
            return Response({'error':'Project not found'}, status=404)


def login(request):
    return Response(status=200)

def contact(request):
    return Response(status=200)

def userSettings(request):
    return Response(status=200)


#socket.io Tutorial
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import ChatSerializer
from .models import Chat
from rest_framework import status

class GetChat(GenericAPIView):
    #permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get(self, request):
        #chat, created = Chat.objects.get_or_create(initiator__id=request.user.pk)
        chat, created = Chat.objects.get_or_create(initiator__id=1)
        serializer = self.serializer_class(instance=chat)
        return Response({"message": "Chat gotten", "data": serializer.data}, status=status.HTTP_200_OK)
