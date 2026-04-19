import json

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Confession, Comment
from django.contrib import messages
from django.http import JsonResponse


@login_required
def create_confession(request):
    if request.method == "POST":
        # Get the content from the textarea (name="content" in HTML)
        content = request.POST.get("content")   
        # validation: ensure it's not empty
        if content and content.strip():
            # Create the object and link it to the logged-in user
            Confession.objects.create(user=request.user, content=content)
            messages.success(request, "Your secret has been cast into the void.")
            return redirect("home")
        else:
            messages.error(request, "A secret message cannot be empty!")

    return render(request, "user_confession/create.html")


@login_required
def toggle_like(request, confession_id):
    if request.method == "POST":
        confession = get_object_or_404(Confession, id=confession_id)
        if request.user in confession.likes.all():
            confession.likes.remove(request.user)
            liked = False
        else:
            confession.likes.add(request.user)
            liked = True

        return JsonResponse({"liked": liked, "count": confession.likes.count()})
    return JsonResponse({"error": "Invalid request"}, status=400)


@login_required
def add_comment(request, confession_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            content = data.get("content", "").strip()

            if not content:
                return JsonResponse({"error": "Empty content"}, status=400)

            confession = get_object_or_404(Confession, id=confession_id)
            comment = Comment.objects.create(
                confession=confession, user=request.user, content=content)

            return JsonResponse(
                {
                    "content": comment.content,
                    "username": request.user.username,
                    "created_at": "Just now",
                }
            )
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

from django.http import JsonResponse
from .models import Comment, Confession  # Make sure your models are imported


def get_comments(request, confession_id):
    # Use "content" instead of "text"
    comments = list(Comment.objects.filter(confession_id=confession_id).values("content", "created_at"))
    return JsonResponse(comments, safe=False)
