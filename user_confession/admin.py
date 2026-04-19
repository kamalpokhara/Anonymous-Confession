# Register your models here.
from django.contrib import admin
from .models import Confession


# @admin.register(Confession)
# class ConfessionAdmin(admin.ModelAdmin):
#     list_display = ("user", "content_preview", "created_at", "total_likes")
#     list_filter = ("created_at", "category")
#     search_fields = ("content", "user__username")

#     def content_preview(self, obj):
#         return obj.content[:50] + "..."
