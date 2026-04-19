// pow_worker.js
self.onmessage = async function (e) {
  const { challenge, difficulty, username } = e.data;

  // 1. Log with the correct variables received from e.data
  console.log(`Worker started. Difficulty: ${difficulty} | Challenge: ${challenge} | User: ${username}`);

  // 2. Ensure difficulty is an integer and create the target prefix
  const diffInt = parseInt(difficulty) || 4;
  const prefix = "0".repeat(diffInt);

  let nonce = 0;
  const encoder = new TextEncoder();

  while (true) {
    // 3. Construct the message exactly as the Middleware expects it:
    // content = f"{challenge}{username}{nonce}".encode()
    const msg = `${challenge}${username}${nonce}`;
    const msgBuffer = encoder.encode(msg);

    // 4. Hash the content
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // 5. Check if we found a match
    if (hashHex.startsWith(prefix)) {
      console.log(`POW SUCCESS! Nonce: ${nonce} | Hash: ${hashHex}`);
      self.postMessage({ nonce: nonce.toString() }); // Send back as string for headers
      break;
    }

    nonce++;

    // 6. Console log every 1000 nonces to show progress without lagging
    if (nonce % 1000 === 0) {
      console.log(`Mining... currently at nonce: ${nonce}`);
      // Short delay to allow the event loop to breathe
      // This prevents the "Worker thread unresponsive" warning
      await new Promise((r) => setTimeout(r, 0));
    }
    // 7. Safety break 
    if (nonce > 5000000) {
      console.error("Mining Timeout: Difficulty might be too high or parameters are wrong.");
      self.postMessage({ error: "timeout" });
      break;
    }
  }
};
