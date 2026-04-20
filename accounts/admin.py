from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *  # or whatever your custom user model is named


@admin.register(AnonymousUser)
class CustomUserAdmin(UserAdmin):
    # What columns to show in the list view
    list_display = ("username", "is_staff", "date_joined")

    # Adding filters to the right sidebar
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")

    # Search box functionality
    search_fields = ("username",)

    # How to order the users
    ordering = ("-date_joined",)

    # If you want to see specific fields when you click into a user
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("bio",)}),  # Add your custom fields here
    )
