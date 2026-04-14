import random
import string
from django.contrib.auth.models import AbstractUser
from django.db import models


class AnonymousUser(AbstractUser):
    # Completely remove email from the DB and logic
    email = None
    username = models.CharField(max_length=21, unique=True)
    def __init__(self, *args, **kwargs):
        kwargs.pop('email', None)
        super().__init__(*args, **kwargs)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.generate_unique_username()
        super().save(*args, **kwargs)

    def generate_unique_username(self):
        """Helper method to keep the save method clean."""
        while True:
            digits = "".join(random.choices(string.digits, k=16))
            new_username = f"user-{digits}"
            if not AnonymousUser.objects.filter(username=new_username).exists():
                return new_username

    def __str__(self):
        return self.username
