import hashlib
from django.http import JsonResponse
from django.urls import reverse
from .views import get_pow_difficulty

class ProofOfWorkMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Define paths that REQUIRE PoW
        # auth_paths = [reverse("login"), reverse("register_user")]
        auth_paths = [ reverse("register_user")]

        if request.method == "POST" and request.path in auth_paths:
            nonce = request.META.get("HTTP_X_POW_NONCE")
            # For login/register, username comes from the POST form
            username = request.POST.get("username")
            challenge = request.session.get("pow_challenge")

            if not nonce or not challenge or not username:
                return JsonResponse(
                    {"error": "Security parameters missing"}, status=403
                )
            print(f"DEBUG: Challenge={challenge}, User={username}, Nonce={nonce}")
            content = f"{challenge}{username}{nonce}".encode()
            result_hash = hashlib.sha256(content).hexdigest()

            # Dynamic Difficulty
            # difficulty = 5 if request.path == reverse("register_user") else 3
            difficulty = get_pow_difficulty(request.path)
            prefix = "0" * difficulty

            if not result_hash.startswith(prefix):
                return JsonResponse({"error": "Invalid proof of work"}, status=403)

        return self.get_response(request)
