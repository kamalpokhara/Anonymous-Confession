import random

from django.shortcuts import get_object_or_404, redirect, render
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import AnonymousUser
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from user_confession.models import Confession

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


@login_required
def dashboard(request):
    # Fetching confessions and comments created by this user
    my_posts = Confession.objects.filter(user=request.user).order_by("-created_at")

    return render(
        request,
        "accounts/dashboard.html",
        {
            "confessions": my_posts,
            "total_posts": my_posts.count(),
        },
    )

from django.contrib import messages

@login_required
def delete_confession(request, pk):
    # Security: Only get the confession if it belongs to THIS user
    confession = get_object_or_404(Confession, pk=pk, user=request.user)

    if request.method == "POST":
        confession.delete()
        messages.success(request, "Confession deleted from the void.")
        return redirect("dashboard")  # Redirect back to the profile page


from django.db.models import Count


def landing_page(request):
    # Get the 2 most liked confessions
    popular_confessions = Confession.objects.annotate(
        like_count=Count("likes")
    ).order_by("-like_count")[:2]

    # Get the 2 most commented confessions
    trending_confessions = Confession.objects.annotate(
        comment_count=Count("comments")
    ).order_by("-comment_count")[:2]

    return render(
        request,
        "accounts/landing.html",
        {"popular": popular_confessions, "trending": trending_confessions},
    )
