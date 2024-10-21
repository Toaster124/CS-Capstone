from django.shortcuts import render
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
'''
from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponsePermanentRedirect, JsonResponse, Http404 
from django.urls import reverse
from django.shortcuts import get_object_or_404, render
from django.views import View
from django.views.generic.base import TemplateView
from rest_framework.response import Response
from CollaBand_App.models import Project
import json
'''

def homepage(request):
    return 200

def dashboard(request):
    return 200
'''
#class view to display the homepage template
class homepage(TemplateView):
    template_name='index.html'
    

#Dashboard View
def dashboard(request, projectID):
    if request.user.is_authenticated: #NP note: could change this to a decorator
        user = request.user
        data = json.loads(request.body.decode('utf-8'))
        
        if request.method == 'GET':     #return user's projects      
            projects = Project.objects.filter(userID=user)
            return render(request, 'dashboard.html', {'projects':projects}, status=200)

        elif request.method == 'POST':  #create new project 
            try:
                newProjectName = data.get('projectName')
                
                if newProjectName:
                    Project.objects.create(projectName=newProjectName)
                return Response({'message':'New project created successfully'}, status=200)
        
            except:
                return Response({'error':'Project could not be created'}, status=400)
        
        elif request.method == 'PUT':   #modify a project field
            try:
                projectToChange = Project.objects.get(id=projectID, userID=user)
                
                #changing project name
                newProjectName = data.get('projectName', projectToChange.projectName)       #second value is the default if no parameter is sent in the JSON
                newProjectDescription = data.get('description', projectToChange.description) 
                
                projectToChange.projectName = newProjectName
                projectToChange.description = newProjectDescription
'''
'''**Can add in stuff to change each field, especially when adding a collaborator/viewer**'''
'''
                
                projectToChange.save()    
                return Response({'message':'Project modified successfully'}, status=200)
            except:
                return Response({'error':'Project could not be deleted'}, status=404)
           
        elif request.method == 'DELETE': #delete a project
            try:
                projectToDelete = Project.objects.get(id=projectID, userID=user)   
                projectToDelete.delete()
                return Response({'message':'Project deleted successfully'}, status=200)
            except:
                return Response({'error':'Project not found'}, status=404)
        
        else:
            return HttpResponseNotAllowed(['GET', 'POST', 'PUT', 'DELETE'])
    else: 
        return Response({'message':'Please log in'}) #placeholder
    
    
'''