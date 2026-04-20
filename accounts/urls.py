from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.landing_page, name='landing'),
    path("home/", views.home, name="home"),
    path("register/", views.register_page, name="register"),
    path("get-info/", views.get_registration_info, name="get_registration_info"),
    path('register_user/', views.register_user, name='register_user'),
    
    path('dashboard/', views.dashboard, name='dashboard'),
    path('delete/<int:pk>/', views.delete_confession, name='delete_confession'),
    
    #check for register_user 
    path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),

]
