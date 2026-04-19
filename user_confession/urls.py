from django.urls import path
from . views import *
urlpatterns = [
    path("", create_confession, name="create_confession"),
    # route for AJAX call to like/unlike
    path("like/<int:confession_id>/", toggle_like, name="toggle_like"),
    path("comment/<int:confession_id>/", add_comment, name="add_comment"),
    path("get_comments/<int:confession_id>/", get_comments, name="get_comments"),
]
