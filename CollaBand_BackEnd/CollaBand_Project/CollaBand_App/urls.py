from django.urls import path
from . import views  # Import views from the app

urlpatterns = [
    path('home/', views.homepage.as_view(), name='homepage'),  # Example view
    path('dashboard/', views.dashboard, name='dashboard'),  # Another view
    path('project-<int:projectID>/', views.projectDAW, name='projectDAW'),
    path('user-settings/', views.userSettings, name='userSettings'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login, name='login'),
    path("all/", views.GetChat.as_view(), name="get-chats"),
]