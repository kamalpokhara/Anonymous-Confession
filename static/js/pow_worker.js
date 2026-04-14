// pow_worker.js
self.onmessage = async function (e) {
  const { challenge, difficulty, username } = e.data;

  // FORCE difficulty to be an integer and create the prefix
  const diffInt = parseInt(difficulty);
  const prefix = "0".repeat(diffInt);

  console.log(`Worker started. Target: ${prefix} | Challenge: ${challenge} | User: ${username}`);

  let nonce = 0;
  while (true) {
    // EXACT order: challenge + username + nonce
    const msg = challenge + username + nonce;

    const msgBuffer = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex.startsWith(prefix)) {
      console.log(`FOUND! Nonce: ${nonce} | Hash: ${hashHex}`);
      self.postMessage({ nonce: nonce });
      break;
    }
    nonce++;

    // Lower this for testing so you see it's working
    // if (nonce % 1000 === 0) {
    // Optional: comment this out if it lags your console
    console.log("Current nonce: " + nonce);
    // }

    // Safety break for testing
    if (nonce > 1000000) {
      console.error("Too many attempts! Something is wrong with the string combination.");
      break;
    }
  }
};
