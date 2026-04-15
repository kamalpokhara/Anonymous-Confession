import os
import uuid
import random
import string
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class AnonymousUser(AbstractUser):
    # Completely remove email from the DB and logic
    email = None
    username = models.CharField(max_length=21, unique=True)

    def __init__(self, *args, **kwargs):
        kwargs.pop("email", None)
        super().__init__(*args, **kwargs)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        # If no username is provided, pull from the file
        if not self.username:
            self.username = self.generate_unique_username()
        super().save(*args, **kwargs)

    def generate_unique_username(self):
        file_path = os.path.join(settings.BASE_DIR, "usernames.txt")
        if not os.path.exists(file_path):
            return self._get_random_fallback()

        with open(file_path, "r") as f:
            # Create a list of names, ignoring empty lines
            names = [line.strip() for line in f if line.strip()]
        # 2. Fallback if file is empty
        if not names:
            return self._get_random_fallback()

        # 3. Try to find a unique name from the list
        random.shuffle(names)
        for name in names:
            # Check if this name is already in the database
            if not AnonymousUser.objects.filter(username=name).exists():
                return name

        # 4. Final fallback if ALL names in the file are already taken
        return self._get_random_fallback()

    def _get_random_fallback(self):
        # Generates something like user-83749281
        digits = "".join(random.choices(string.digits, k=8))
        return f"user-{digits}"

    def __str__(self):
        return self.username
