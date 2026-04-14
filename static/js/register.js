async function handleRegistration() {
  
  const infoResponse = await fetch("/accounts/get-info/");
  const { username, challenge, difficulty } = await infoResponse.json();

  document.getElementById("display-username").innerText = username;

  const password = document.getElementById("password-input").value;
  const registerBtn = document.getElementById("register-btn");

  registerBtn.disabled = true;
  registerBtn.innerText = "Verifying Humanity (Mining)...";

  const worker = new Worker("/static/js/pow_worker.js");
  worker.postMessage({ challenge, difficulty, username });

  worker.onmessage = async function (e) {
    const nonce = e.data.nonce;
    console.log("Found valid nonce: " + nonce);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("pow_nonce", nonce); // The middleware looks for this!

    const response = await fetch("/accounts/register/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken"), // Standard Django CSRF
      },
    });

    const result = await response.json();
    if (result.success) {
      window.location.href = "/home/";
    } else {
      alert(result.error);
      registerBtn.disabled = false;
    }
  };
}
