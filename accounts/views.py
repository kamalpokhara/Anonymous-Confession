import random

from django.shortcuts import render
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AnonymousUser
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required


def register_page(request):
    return render(request, "accounts/register.html")


def get_registration_info(request):
    temp_user = AnonymousUser()
    preview_username = temp_user.generate_unique_username()

    challenge = str(uuid.uuid4())[:4]
    request.session['pow_challenge'] = challenge

    return JsonResponse({
        'username':preview_username, 
        'challenge': challenge, 
        'difficulty': 4,
    })

def register_user(request):
    if request.method == 'POST':
        password = request.POST.get('password')
        username = request.POST.get("username")

        if AnonymousUser.objects.filter(username=username).exists():
            return JsonResponse(
                {
                    "success": False,
                    "error": "This ID was just taken. Refresh and try again!",
                }
            )
        user = AnonymousUser.objects.create_user(username=username, password=password)
        user.set_password(password)
        user.save()

    return JsonResponse({'message': 'User registered successfully', 'username': user.username})


# @login_required
def home(request):
    return render(request, "accounts/home.html")
