from django.urls import path
from . import views  # Import views from the app

urlpatterns = [
    #path('home/', views.homepage.as_view(), name='homepage'),  # Example view
    path('dashboard/', views.dashboard, name='dashboard'),  # Another view
    path('project-<int:projectID>/', views.projectDAW, name='projectDAW'),
    path('user-settings/', views.userSettings, name='userSettings'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login, name='login'),
    #path("chat-ex/", views.GetChat.as_view(), name="get-chats"),
    path('home/', views.home_view, name='home'),
    path('login/', views.CustomAuthToken.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),

]
