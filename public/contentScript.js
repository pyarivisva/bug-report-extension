/* global chrome */

// contentScript.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_MARKUP_OVERLAY") {
    showMarkupOverlay(message.image);
  }
});

function showMarkupOverlay(imageSrc) {
  // Hapus overlay lama jika ada
  const existing = document.getElementById("bug-overlay");
  if (existing) existing.remove();

  // Overlay utama
  const overlay = document.createElement("div");
  overlay.id = "bug-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.7)",
    zIndex: 999999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });
  document.body.appendChild(overlay);

  // Container putih di tengah
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "relative",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  });
  overlay.appendChild(container);

  // Gambar di canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  container.appendChild(canvas);

  // Toolbar
  const toolbar = document.createElement("div");
  Object.assign(toolbar.style, {
    marginTop: "10px",
    textAlign: "center",
  });
  container.appendChild(toolbar);

  // Tombol Markup
  const markupBtn = document.createElement("button");
  markupBtn.textContent = "Start Markup";
  markupBtn.style.background = "#28a745";
  markupBtn.style.color = "white";
  markupBtn.style.padding = "6px 12px";
  markupBtn.style.border = "none";
  markupBtn.style.borderRadius = "6px";
  markupBtn.style.cursor = "pointer";
  toolbar.appendChild(markupBtn);

  // Tombol Close
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  Object.assign(closeBtn.style, {
    background: "#dc3545",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  });
  closeBtn.onclick = () => overlay.remove();
  toolbar.appendChild(closeBtn);

  // Aktifkan markup mode
  markupBtn.onclick = () => {
    startMarkupMode(canvas, img, ctx);
  };
}

function startMarkupMode(canvas, img, ctx) {
  let start = null;
  let activeRect = null;

  const handleMouseDown = (e) => {
    const rect = canvas.getBoundingClientRect();
    start = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = (e) => {
    if (!start) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = x - start.x;
    const h = y - start.y;
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(start.x, start.y, w, h);
    activeRect = { x: start.x, y: start.y, w, h };
  };

  const handleMouseUp = () => {
    if (activeRect) {
      showBugForm(canvas, activeRect);
    }
    start = null;
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
}

function showBugForm(canvas, rect) {
  // Buat popup form kecil
  const form = document.createElement("div");
  Object.assign(form.style, {
    position: "absolute",
    top: `${rect.y + rect.h + 10}px`,
    left: `${rect.x}px`,
    background: "white",
    border: "1px solid #aaa",
    borderRadius: "6px",
    padding: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    width: "200px",
    zIndex: 1000000,
  });
  canvas.parentElement.appendChild(form);

  const title = document.createElement("input");
  title.placeholder = "Bug Title";
  Object.assign(title.style, {
    width: "100%",
    marginBottom: "5px",
  });
  form.appendChild(title);

  const desc = document.createElement("textarea");
  desc.placeholder = "Description";
  Object.assign(desc.style, {
    width: "100%",
    height: "60px",
  });
  form.appendChild(desc);

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  Object.assign(saveBtn.style, {
    background: "#007bff",
    color: "white",
    width: "100%",
    marginTop: "5px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  });
  form.appendChild(saveBtn);

  saveBtn.onclick = () => {
    const bug = {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      title: title.value,
      desc: desc.value,
    };

    chrome.storage.local.get("bugs", (data) => {
      const updated = [...(data.bugs || []), bug];
      chrome.storage.local.set({ bugs: updated });
    });

    form.remove();
  };
}
