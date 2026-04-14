import random

from django.shortcuts import render
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AnonymousUser
from django.contrib.auth import login

def get_registration_info(request):
    temp_id = f"user-{''.join([str(random.randint(0,9)) for _ in range(16)])}"

    challenge = str(uuid.uuid4())[:4]
    request.session['pow_challenge'] = challenge

    return JsonResponse({
        'username':temp_id, 
        'challenge': challenge, 
        'difficulty': 2,
    })

def register_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

    if AnonymousUser.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    user = AnonymousUser.objects.create_user(username=username, password=password)
    login(request, user)

    return JsonResponse({'message': 'User registered successfully', 'username': user.username})


def register_page(request):
    return render(request, "accounts/register.html")
