/* global chrome */

(function () {
  if (window.__BUG_REPORTER_LOADED__) {
    // Kita biarkan guard ini untuk mencegah duplikasi listener
    // jika kita menggunakan programmatic injection (Solusi 2)
    return;
  }
  window.__BUG_REPORTER_LOADED__ = true;
})();

let selectionBox = null;
let startX, startY, endX, endY;
let isSelecting = false;

let hoverBox = null;

// BARU: Variabel global untuk melacak tooltip yang sedang aktif
let activeTooltip = null;

// --- Fungsi D1 (Drag Selection) ---

function enableSelection() {
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.body.style.cursor = "crosshair";
}

function disableSelection() {
  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.body.style.cursor = "default";
  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }
}

function onMouseDown(e) {
  // Cegah trigger jika kita klik di dalam tooltip
  if (e.target.closest("#bug-reporter-tooltip")) return;

  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px solid red";
  selectionBox.style.pointerEvents = "none";
  selectionBox.style.zIndex = "999999";
  document.body.appendChild(selectionBox);
}

function onMouseMove(e) {
  if (!isSelecting) return;
  endX = e.clientX;
  endY = e.clientY;

  const rect = {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(startX - endX),
    height: Math.abs(startY - endY),
  };

  selectionBox.style.left = rect.left + "px";
  selectionBox.style.top = rect.top + "px";
  selectionBox.style.width = rect.width + "px";
  selectionBox.style.height = rect.height + "px";
}

function onMouseUp() {
  isSelecting = false;

  const rect = selectionBox.getBoundingClientRect();
  disableSelection();

  // BARU: Panggil tooltip form, jangan kirim message
  showTooltipForm(rect);
}

// --- Fungsi D2 (Click Selection) ---

function enableClickSelection() {
  document.addEventListener("mousemove", onHoverElement);
  document.addEventListener("click", onClickElement, true);
  document.body.style.cursor = "pointer";
}

function disableClickSelection() {
  document.removeEventListener("mousemove", onHoverElement);
  document.removeEventListener("click", onClickElement, true);
  document.body.style.cursor = "default";
  if (hoverBox) hoverBox.remove();
}

function onHoverElement(e) {
  // Cegah hover jika kita di atas tooltip
  if (e.target.closest("#bug-reporter-tooltip")) {
    if (hoverBox) hoverBox.remove();
    return;
  }

  const el = e.target;
  const rect = el.getBoundingClientRect();

  if (!hoverBox) {
    hoverBox = document.createElement("div");
    hoverBox.style.position = "fixed";
    hoverBox.style.pointerEvents = "none";
    hoverBox.style.border = "2px solid red";
    hoverBox.style.zIndex = "999999";
    document.body.appendChild(hoverBox);
  }

  hoverBox.style.left = rect.left + "px";
  hoverBox.style.top = rect.top + "px";
  hoverBox.style.width = rect.width + "px";
  hoverBox.style.height = rect.height + "px";
}

function onClickElement(e) {
  // Cegah trigger jika kita klik di dalam tooltip
  if (e.target.closest("#bug-reporter-tooltip")) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  const rect = el.getBoundingClientRect();

  disableClickSelection();

  // BARU: Panggil tooltip form, jangan kirim message
  showTooltipForm(rect);
}

// --- BARU: Fungsi D3 (Tooltip Form) ---

function showTooltipForm(rect) {
  // Hapus tooltip lama jika ada
  if (activeTooltip) {
    activeTooltip.remove();
  }

  // Buat elemen form
  activeTooltip = document.createElement("div");
  activeTooltip.id = "bug-reporter-tooltip";

  // Styling (bisa dipindah ke file CSS nanti)
  activeTooltip.style.position = "absolute";
  activeTooltip.style.zIndex = "9999999";
  activeTooltip.style.background = "white";
  activeTooltip.style.border = "1px solid #ddd";
  activeTooltip.style.borderRadius = "8px";
  activeTooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  activeTooltip.style.padding = "10px";
  activeTooltip.style.width = "250px";
  activeTooltip.style.fontFamily = "Arial, sans-serif";

  // Posisi: di bawah elemen + 10px, ditambah scroll offset
  activeTooltip.style.left = `${rect.left + window.scrollX}px`;
  activeTooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;

  // Isi HTML untuk form
  activeTooltip.innerHTML = `
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Report Bug</div>
    <textarea 
      id="bug-reporter-textarea" 
      placeholder="Describe the bug..." 
      style="width: 100%; box-sizing: border-box; height: 70px; border: 1px solid #ccc; border-radius: 4px; padding: 5px; font-family: Arial, sans-serif;"
    ></textarea>
    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
      <button id="bug-reporter-cancel" style="background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; padding: 5px 10px; cursor: pointer; margin-right: 5px;">
        Cancel
      </button>
      <button id="bug-reporter-submit" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
        Submit
      </button>
    </div>
  `;

  document.body.appendChild(activeTooltip);

  // Fokus otomatis ke textarea
  activeTooltip.querySelector("#bug-reporter-textarea").focus();

  // Tambah listener untuk tombol
  activeTooltip
    .querySelector("#bug-reporter-submit")
    .addEventListener("click", () => {
      const comment =
        activeTooltip.querySelector("#bug-reporter-textarea").value;

      // Kumpulkan semua data
      const bugData = {
        comment: comment,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // (Untuk D4/D5, di sinilah kita akan trigger screenshot)

      // Kirim data ke background (atau popup, tapi background lebih baik)
      console.log("Bug submitted:", bugData);
      chrome.runtime.sendMessage({ type: "BUG_SUBMITTED", payload: bugData });

      // Hapus tooltip
      activeTooltip.remove();
      activeTooltip = null;
    });

  activeTooltip
    .querySelector("#bug-reporter-cancel")
    .addEventListener("click", () => {
      // Hapus tooltip
      activeTooltip.remove();
      activeTooltip = null;
    });
}

// --- Listener Utama (Tidak berubah) ---

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START_SELECTION") {
    // Hapus tooltip jika ada, sebelum memulai seleksi baru
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    enableSelection();
  }

  if (msg.type === "START_CLICK_SELECTION") {
    // Hapus tooltip jika ada, sebelum memulai seleksi baru
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    enableClickSelection();
  }
});