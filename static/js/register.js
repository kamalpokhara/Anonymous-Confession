async function handleRegistration() {
  // 1. Get the password from the input
  const password = document.getElementById("password-input").value;
  const registerBtn = document.getElementById("register-btn");

  // 2. Use the "global" variables we saved during window.onload
  // This ensures the username stays the same as the one displayed on screen
  const username = window.currentUsername;
  const challenge = window.currentChallenge;
  const difficulty = window.currentDifficulty;

  if (!password) {
    alert("Please enter a password.");
    return;
  }

  registerBtn.disabled = true;
  registerBtn.innerText = "Verifying Humanity (Mining)...";

  // 3. Start the Web Worker with the FIXED username
  const worker = new Worker("/static/js/pow_worker.js");
  worker.postMessage({ challenge, difficulty, username });

  worker.onmessage = async function (e) {
    const nonce = e.data.nonce;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("pow_nonce", nonce);

    const response = await fetch("/accounts/register/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });

    const result = await response.json();
    if (response.status == 200) {
      window.location.href = "home/";
    } else {
      alert(response.error);
      registerBtn.disabled = false;
      registerBtn.innerText = "Register";
    }
  };
}
