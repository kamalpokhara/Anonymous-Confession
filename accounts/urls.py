from django.urls import path
from . import views

urlpatterns = [
    path('',views.register_page, name = 'register_page'),
    path("get-info/", views.get_registration_info, name="get_registration_info"),
    path("register/", views.register_user, name = 'register'),
]
