# CollaBand_App/views.py

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseNotAllowed, JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

# Custom Login View
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

# User Profile View
 
class UserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data) 

#  Dashboard View
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def dashboard(request):
    user = request.user
    if request.body:
        data = json.loads(request.body.decode('utf-8'))
    else:
        data = {}

    if request.method == 'GET':
        try:
            user_projects = UserProjectRole.objects.filter(userID=user).select_related('projectID')
            projects_with_role = [
                {
                    "project": {
                        'project_id': upr.projectID.id,
                        'project_name': upr.projectID.projectName,
                        'description': upr.projectID.description,
                    },
                    'userRole': upr.role
                }
                for upr in user_projects
            ]
            to_return = {
                'message': 'Projects returned',
                'projects': projects_with_role
            }
            return Response(to_return, status=200)
        except Exception as e:
            return Response({'error': f'No projects found: {str(e)}'}, status=404)

    elif request.method == 'POST':
        try:
            new_project_name = data.get('projectName')
            new_project_description = data.get('description', "")

            if new_project_name:
                project_to_create = Project.objects.create(
                    projectName=new_project_name,
                    description=new_project_description,
                    userID=user
                )
                UserProjectRole.objects.create(role='host', userID=user, projectID=project_to_create)
                return Response({'message': 'New project created successfully'}, status=200)
            else:
                return Response({'error': 'Project name is required'}, status=400)
        except Exception as e:
            return Response({'error': f'Project could not be created: {str(e)}'}, status=400)

    else:
        return HttpResponseNotAllowed(['GET', 'POST'])

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def project_notes(request, projectID):
    user = request.user
    try:
        project = Project.objects.get(id=projectID)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=404)

    # Check if the user is associated with the project
    if not UserProjectRole.objects.filter(userID=user, projectID=project).exists():
        return Response({'error': 'You are not associated with this project.'}, status=403)

    if request.method == 'GET':
        notes = project.data.get('notes', [])
        return Response({'notes': notes}, status=200)

    elif request.method == 'POST':
        notes = request.data.get('notes', [])
        project.data['notes'] = notes
        project.save()
        return Response({'message': 'Notes saved successfully.'}, status=200)

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
    if request.method == 'GET':
        user = request.user
        user_data = {
            'username': user.username,
            'email': user.email,
            # Include other user settings as needed
        }
        return Response({'userSettings': user_data}, status=200)
    elif request.method == 'POST':
        data = request.data
        user = request.user
        user.email = data.get('email', user.email)
        # Update other user settings as needed
        user.save()
        return Response({'message': 'User settings updated successfully'}, status=200)
    else:
        return HttpResponseNotAllowed(['GET', 'POST'])

@api_view(['GET', 'POST'])
def contact(request):
    if request.method == 'GET':
        # Return contact form or contact information
        return Response({'message': 'Contact page'}, status=200)
    elif request.method == 'POST':
        # Handle submitted contact form
        data = request.data
        # Process data as needed
        return Response({'message': 'Thank you for your message!'}, status=200)
    else:
        return HttpResponseNotAllowed(['GET', 'POST'])
