function openConfession(id, content) {
  const modal = document.getElementById("confessionModal");
  const body = document.getElementById("modalBody");

  if (modal.style.display === "block" && modal.dataset.currentId === id) {
    closeModal();
    return;
  }

  modal.style.display = "block";
  modal.dataset.currentId = id;

  body.innerHTML = `
<div class="modal-inner" style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px;">
    <header style="margin-bottom: 10px;">
        <span class="anon-handle" style="font-size: 1.4rem; color: #00ff88;">> Confession #${id}</span>
        <hr style="border-color: #333; margin-top: 10px;">
    </header>

    <div class="full-text" style="font-size: 1.1rem; padding: 10px 0; color: #d7dadc; margin-bottom: 10px; text-align: justify; display: block; width: 100%; box-sizing: border-box;">
        ${content}
    </div>

    <section class="comment-area">
        <h3 style="color: #00ff88; margin-bottom: 10px;">Discussion</h3>
        <div class="reply-input-wrapper" style="margin-bottom: 30px; width: 100%;">
           <textarea id="newComment" placeholder="Add a comment anonymously..." style="width: 100%; height: 100px; background: #000; border: 1px solid #343536; color: white; padding: 15px; border-radius: 4px; box-sizing: border-box; outline: none; "></textarea>
            <button onclick="saveComment(${id})" style="margin-top: 10px; background: #00ff88; color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
                Post Comment
            </button>
        </div>
        <div id="commentList" style="width: 100%;"></div>
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

      newComment.innerHTML = `
      <div class="reddit-comment" style="border-left: 2px solid #343536; padding-left: 12px; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; ">
            <span style="color: #d7dadc; font-weight: 600; font-size: 0.85rem;">Anonymous User</span>
            <span style="color: #818384; font-size: 0.75rem;">• ${data.created_at}</span>
          </div>
          <div style="color: #d7dadc; font-size: 0.95rem; line-height: 1.5; word-wrap: break-word;">
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
            <div class="comment-container" style="margin-bottom: 15px;">
                <div class="reddit-comment" style="border-left: 2px solid #343536; padding-left: 12px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; margin-bottom: 6px; gap: 8px;">
                        <span style="color: #d7dadc; font-weight: 600; font-size: 0.85rem;">Anonymous User</span>
                        <span style="color: #818384; font-size: 0.75rem;">• ${date}</span>
                    </div>
                    <div style="color: #d7dadc; font-size: 0.95rem; line-height: 1.5; word-wrap: break-word;">
                        ${c.content}
                    </div>
                </div>
                <hr style="border: 0; border-top: 1px solid #1a1a1b; margin: 0;">
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
