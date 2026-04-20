from django.contrib import admin
from .models import Confession


@admin.register(Confession)
class ConfessionAdmin(admin.ModelAdmin):
    # Show the ID, Title, and User in the list
    list_display = ("id", "title", "user", "created_at")

    # Filter by date or user
    list_filter = ("created_at", "user")

    # Search by title or content
    search_fields = ("title", "content")

    # Make the list clickable via the title
    list_display_links = ("id", "title")

    # Sort by newest first
    ordering = ("-created_at",)
