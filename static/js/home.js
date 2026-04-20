document.addEventListener("DOMContentLoaded", () => {
  // Select all paragraphs with the linkify-me class
  const contentAreas = document.querySelectorAll(".linkify-me");

  contentAreas.forEach((area) => {
    // el.textContent gets the raw text, linkify() adds the <a> tags
    area.innerHTML = linkify(area.textContent);
  });
});

function linkify(text) {
  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(urlPattern, function (url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #00ff88; text-decoration: underline;">${url}</a>`;
  });
}

function openConfession(id, title, content) {
  const modal = document.getElementById("confessionModal");
  const body = document.getElementById("modalBody");
  const linkedContent = linkify(content);

  if (modal.style.display === "block" && modal.dataset.currentId === id) {
    closeModal();
    return;
  }

  modal.style.display = "block";
  modal.dataset.currentId = id;
body.innerHTML = `
<div class="modal-inner" style="width:100%; max-width:100%; box-sizing:border-box; padding:10px;">

  <header style="display:flex; align-items:center; gap:10px; margin-bottom:28px; padding-bottom:16px; border-bottom:1px solid #1a1a1c;">
    <button onclick="closeModal()" style="background:transparent; border:1px solid #2a2a2c; color:#555; font-size:11px; font-family:'JetBrains Mono',monospace; padding:5px 12px; border-radius:5px; cursor:pointer; letter-spacing:0.05em;" onmouseover="this.style.borderColor='#ff4444';this.style.color='#ff4444'" onmouseout="this.style.borderColor='#2a2a2c';this.style.color='#555'">✕ close</button>
    <span style="font-size:11px; color:#333; font-family:'JetBrains Mono',monospace; letter-spacing:0.04em;"><span style="color:#00ff8877;">confession #${id}</span></span>
  </header>

  <div style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#00ff88; font-weight:600; letter-spacing:0.06em; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
    <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#00ff88; box-shadow:0 0 8px #00ff8888;"></span>
    > confession #${id}
  </div>

  <h2 style="font-size:22px; font-weight:700; color:#f0f0f0; line-height:1.35; letter-spacing:-0.02em; margin:0 0 20px; font-family:'Sora',sans-serif;">${title}</h2>

  <div style="height:1px; background:linear-gradient(90deg,#00ff8833,#00ff8818,transparent); margin-bottom:20px;"></div>

  <div class="full-text linkify-me" style="font-size:15px; line-height:1.75; color:#9a9a9c; text-align:justify; margin-bottom:32px; font-family:'Sora',sans-serif; display:block; width:100%; box-sizing:border-box;">
    ${linkedContent}
  </div>

  <section class="comment-area">
    <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#00ff88; letter-spacing:0.1em; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
      discussion
      <span style="flex:1; height:1px; background:#1e1e20; display:inline-block;"></span>
    </div>

    <div class="reply-input-wrapper" style="margin-bottom:28px; width:100%;">
      <textarea id="newComment" placeholder="Add a comment anonymously..." style="width:100%; height:90px; background:#0a0a0b; border:1px solid #222224; color:#d7dadc; padding:14px 16px; border-radius:8px; box-sizing:border-box; outline:none; font-family:'Sora',sans-serif; font-size:13.5px; line-height:1.6; resize:none; transition:border-color 0.2s;" onfocus="this.style.borderColor='#00ff8855'" onblur="this.style.borderColor='#222224'"></textarea>
      <button onclick="saveComment(${id})" style="margin-top:10px; background:#00ff88; color:#060f09; border:none; padding:11px 20px; border-radius:7px; cursor:pointer; font-weight:700; font-family:'Sora',sans-serif; font-size:13px; width:100%; letter-spacing:0.02em; transition:all 0.2s;">
        Post Comment
      </button>
    </div>

    <div id="commentList" style="width:100%;"></div>
  </section>
</div>
`;

  loadComments(id);

  // Optional: Load existing comments here
}

function closeModal() {
  const modal = document.getElementById("confessionModal");
  modal.style.display = "none";
  modal.dataset.currentId = "";
}

window.onclick = function (event) {
  const modal = document.getElementById("confessionModal");
  if (event.target == modal) {
    closeModal();
  }
};

//HELPER FOR STANDARD HEADERS
function getStandardHeaders() {
  return {
    "X-CSRFToken": window.DJANGO_CONFIG.csrfToken, // Ensure this is defined in base.html
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
}

// LIKE LOGI
async function handleLike(event, id) {
  // 1. Stop propagation first
  if (event) event.stopPropagation();
  try {
    const response = await fetch(`/confessions/like/${id}/`, {
      method: "POST",
      headers: getStandardHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      // 2. Select elements by their explicit IDs
      const btn = document.getElementById(`like-btn-${id}`);
      const countSpan = document.getElementById(`like-count-${id}`);
      // 3. Update the UI with safety checks
      if (countSpan) {
        countSpan.innerText = data.count;
      }
      if (btn) {
        btn.style.color = data.liked ? "#ff4500" : "#818384";
        // Optional: Toggle the 'active' class to stay in sync with your CSS
        if (data.liked) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }
    }
  } catch (error) {
    console.error("Like failed:", error);
  }
}

//COMMENT LOGIC
async function saveComment(id) {
  const textarea = document.getElementById("newComment");
  const content = textarea.value.trim();

  if (!content) {
    alert("The void requires a message.");
    return;
  }

  try {
    const response = await fetch(`/confessions/comment/${id}/`, {
      method: "POST",
      headers: getStandardHeaders(),
      body: JSON.stringify({ content: content }),
    });

    if (response.ok) {
      const data = await response.json();
      textarea.value = "";

      const list = document.getElementById("commentList");
      const newComment = document.createElement("div");
      newComment.className = "comment-item";
      newComment.style.cssText = "padding: 15px 15px 15px 0px;  color: #ddd;";
      const safeContent = linkify(data.content);

newComment.innerHTML = `
  <div class="reddit-comment" style="border-left:2px solid #222224; padding-left:14px; margin-bottom:4px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
      <span style="font-family:'JetBrains Mono',monospace; color:#00ff8899; font-weight:600; font-size:11px; letter-spacing:0.04em;">anon_user</span>
      <span style="color:#444; font-family:'JetBrains Mono',monospace; font-size:10px;">• ${data.created_at}</span>
    </div>
    <div style="color:#8a8a8c; font-size:13.5px; line-height:1.65; text-align:justify;font-family:'Sora',sans-serif; word-wrap:break-word;">
      ${data.content}
    </div>
  </div>
`;
      list.prepend(newComment);
    }
  } catch (error) {
    console.error("Commenting failed:", error);
  }
}

async function loadComments(id) {
  const list = document.getElementById("commentList");
  try {
    const response = await fetch(`/confessions/get_comments/${id}/`);
    const data = await response.json();

    if (data.length > 0) {
      list.innerHTML = data
        .map((c) => {
          const safeContent = linkify(c.content);
          // Format the date if it exists, otherwise show "Recent"
          const date = c.created_at
            ? new Date(c.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent";

          return `
            <div class="comment-container" style="margin-bottom:4px;">
              <div class="reddit-comment" style="border-left:2px solid #222224; padding-left:14px; margin-bottom:4px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
                  <span style="font-family:'JetBrains Mono',monospace; color:#00ff8899; font-weight:600; font-size:11px; letter-spacing:0.04em;">anon_user</span>
                  <span style="color:#444; font-family:'JetBrains Mono',monospace; font-size:10px;">• ${date}</span>
                </div>
                <div style="color:#8a8a8c; text-align:justify;font-size:13.5px; line-height:1.65; font-family:'Sora',sans-serif; word-wrap:break-word;">
                  ${safeContent}
                </div>
              </div>
              <hr style="border:0; border-top:1px solid #141416; margin:14px 0;">
            </div>
          `;
        })
        .join("");
    } else {
      list.innerHTML = '<p style="text-align: center; color: #818384; padding: 20px;">No one has spoken yet.</p>';
    }
  } catch (err) {
    console.error("Error:", err);
    list.innerHTML = '<p style="color: #ff4500;">Failed to load discussion.</p>';
  }
}
