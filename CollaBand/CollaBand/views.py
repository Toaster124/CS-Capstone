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

from django.http import HttpResponse, HttpResponsePermanentRedirect, Http404 
from django.urls import reverse
from django.shortcuts import get_object_or_404
from django.views import View


## Example
def drinks(request, drink_name):
    drink = {"mocha": "type of coffee",
             "tea": "type of beverage",
             "lemonade": "type of refreshment"}
    try: 
        choiceOfDrink = drink[drink_name]
    except:
        raise Http404("Drink not found")
    return HttpResponse(f"<h2> {drink_name} </h2>"+choiceOfDrink)