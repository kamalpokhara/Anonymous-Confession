
// These variables are now available globally to home.js and pow_worker.js
// const AUTH_CONTEXT = {
//     user: "{{ request.user.username|default:'anonymous' }}",
//     // For the challenge, we can use the CSRF token or a timestamp for now
//     // A better way is a dedicated challenge from the server, but this works:
//     challenge: "{{ csrf_token }}" 
//   };
const DJANGO_CONFIG = {
  csrfToken: "{{ csrf_token }}",
  workerPath: "{% static 'js/pow_worker.js' %}",
};

async function getPoWHeader(challenge, username) {
  // 1. Pass the real data to the miner
  // If mineNonce takes an object, pass it like this:
  const nonce = await mineNonce(challenge, username);

  return {
    "X-POW-NONCE": nonce,
    "X-CSRFToken": "{{ csrf_token }}",
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  };
}
