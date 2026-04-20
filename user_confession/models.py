from django.db import models
from django.conf import settings


class Confession(models.Model):
    # Link to your custom AnonymousUser from the accounts app
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="confessions"
    )
    
    title = models.CharField(max_length=100, default="Untitled Confession")
    # The actual secret content
    content = models.TextField()

    # Metadata for sorting and filtering
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Like system: Many users can like many confessions
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="liked_confessions", blank=True
    )

    # Categorization (eg Crush, Regret, Work, Funny)
    category = models.CharField(max_length=50, default="General")

    class Meta:
        ordering = ["-created_at"]  # Newest secrets show up first by default

    def __str__(self):
        return f"Confession {self.id} by {self.user.username[:10]}..."

    @property
    def total_likes(self):
        return self.likes.count()


class Comment(models.Model):
    # Link to the specific confession being discussed
    confession = models.ForeignKey(
        Confession, on_delete=models.CASCADE, related_name="comments"
    )

    # Link to the user who wrote the comment
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_comments"
    )

    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]  # Newest comments at the top

    def __str__(self):
        return f"Comment by {self.user.username} on #{self.confession.id}"
