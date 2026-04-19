async function handleRegistration() {
  const password = document.getElementById("password-input").value;
  const registerBtn = document.getElementById("register-btn");

  // Use the variables set in your base/register template
  const username = window.currentUsername;
  const challenge = window.currentChallenge;
  const difficulty = window.currentDifficulty;

  if (!password) {
    alert("Please enter a password.");
    return;
  }

  registerBtn.disabled = true;
  registerBtn.innerText = "Mining Proof of Work...";

  // Start the Worker
  const worker = new Worker("/static/js/pow_worker.js");
  worker.postMessage({ challenge, difficulty, username });

  worker.onmessage = async function (e) {
    if (e.data.error) {
      alert("Mining failed. Please refresh and try again.");
      registerBtn.disabled = false;
      return;
    }

    const nonce = e.data.nonce;
    worker.terminate(); // Stop the worker now that we have the result

    // Standardizing: Send password/username in Body, but Nonce in Header
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("/register_user/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          // THIS IS THE KEY: Matches request.META.get("HTTP_X_POW_NONCE")
          "X-POW-NONCE": nonce,
        },
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = "/";
      } else {
        alert(result.error || "Registration failed.");
        registerBtn.disabled = false;
        registerBtn.innerText = "Register";
      }
    } catch (error) {
      console.error("Network error:", error);
      registerBtn.disabled = false;
    }
  };
}


