import hashlib
from django.http import JsonResponse

class ProofOfWorkMiddleware: 
    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'POST' and request.path in [ 'accounts/register/']:
            nonce = request.POST.get('pow_nonce')
            # challenge = request.POST.get('pow_challenge')
            username = request.POST.get('username')
            challenge = request.session.get("pow_challenge")
            # check if user sended nonce or requessted challenge from server
            if not nonce or not challenge:
                return JsonResponse({'error': 'Proof of work parameters missing'}, status=403)

            # content=f'{challenge}{nonce}'.encode()
            content = f"{challenge}{username}{nonce}".encode()
            result_hash =  hashlib.sha256(content).hexdigest()

            difficulty =  4 
            prefix = '0' * difficulty

            if not result_hash.startswith(prefix):
                return JsonResponse({'error': 'Invalid proof of work'}, status=403)

        return self.get_response(request)
