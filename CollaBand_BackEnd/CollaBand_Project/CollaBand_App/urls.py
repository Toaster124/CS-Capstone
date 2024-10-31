from django.urls import path
from . import views  # Import views from the app

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('project-<int:projectID>/', views.projectDAW, name='projectDAW'),
    path('user-settings/', views.userSettings, name='userSettings'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.CustomAuthToken.as_view(), name='login'),  # Correct login view
    path('register/', views.RegisterView.as_view(), name='register'),
    # Uncomment and ensure the view exists if needed:
    # path("chat-ex/", views.GetChat.as_view(), name="get-chats"),
]
