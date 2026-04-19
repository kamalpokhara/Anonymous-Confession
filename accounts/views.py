import random

from django.shortcuts import render
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AnonymousUser
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.urls import reverse


# centralized function to determine PoW difficulty based on URL path
def get_pow_difficulty(path):
    if path == reverse("register_user"):
        return 4
    elif path == reverse("login"):
        return 4
    return 0  # No PoW required for likes, comments, etc.


def register_page(request):
    return render(request, "accounts/register.html")


def get_registration_info(request):
    temp_user = AnonymousUser()
    preview_username = temp_user.generate_unique_username()

    challenge = str(uuid.uuid4())[:4]
    request.session['pow_challenge'] = challenge

    return JsonResponse(
        {
            "username": preview_username,
            "challenge": challenge,
            "difficulty": get_pow_difficulty(reverse("register_user")),
        }
    )

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

        login(request, user)
    return JsonResponse({'message': 'User registered successfully', 'username': user.username})


from user_confession.models import Confession 

def home(request):
    confessions = Confession.objects.all().order_by("-created_at")
    context= {
        'confessions': confessions
    }
    return render(request, "accounts/home.html", context)
