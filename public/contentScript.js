/* global chrome */
// === File: public/contentScript.js ===

let lastHighlightedElement = null;
let isPinModeActive = false;

// --- FUNGSI HIGHLIGHT ---

function handleMouseOver(event) {
  const targetElement = event.target;

  // Penting: Jangan highlight UI React kita sendiri!
  if (targetElement.id === 'bug-report-react-root' || targetElement.closest('#bug-report-react-root')) {
    return;
  }

  // Terapkan gaya highlight
  targetElement.style.outline = '3px dotted #E03A3E'; // Merah putus-putus
  targetElement.style.cursor = 'crosshair';
  lastHighlightedElement = targetElement;
}

function handleMouseOut(event) {
  const targetElement = event.target;
  // Hapus gaya highlight
  targetElement.style.outline = 'none';
  targetElement.style.cursor = 'default';
}

// --- FUNGSI KLIK (INTI LOGIKA) ---

function handleClickCapture(event) {
  // Hentikan aksi default halaman (misal: navigasi jika mengklik link)
  event.preventDefault();
  event.stopPropagation();

  const clickedElement = event.target;

  // Nonaktifkan mode "pin" SEGERA
  deactivatePinMode();

  // Bersihkan sisa highlight
  if (clickedElement) {
    clickedElement.style.outline = 'none';
    clickedElement.style.cursor = 'default';
  }

  // Kumpulkan semua data yang kita perlukan
  const clickData = {
    x: event.clientX,         // Posisi X mouse di layar
    y: event.clientY,         // Posisi Y mouse di layar
    pageScrollX: window.scrollX, // Seberapa jauh halaman di-scroll horizontal
    pageScrollY: window.scrollY, // Seberapa jauh halaman di-scroll vertikal
    elementTag: clickedElement.tagName,
    elementId: clickedElement.id,
    elementClasses: clickedElement.className,
    pageUrl: window.location.href
  };

  console.log('Elemen diklik:', clickData);

  // Kirim data ini ke UI React (App.jsx) untuk ditampilkan
  chrome.runtime.sendMessage({
    action: "SHOW_COMMENT_BOX",
    data: clickData
  });
}

// --- FUNGSI PENGELOLA MODE ---

function activatePinMode() {
  if (isPinModeActive) return; // Sudah aktif, jangan jalankan lagi
  isPinModeActive = true;
  console.log('Mode "Point-and-Click" Aktif!');
  document.body.style.cursor = 'crosshair';

  // Daftarkan listener
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  // Gunakan 'capture: true' agar event kita berjalan SEBELUM event di halaman
  document.addEventListener('click', handleClickCapture, { capture: true });
}

function deactivatePinMode() {
  if (!isPinModeActive) return; // Sudah nonaktif
  isPinModeActive = false;
  console.log('Mode "Point-and-Click" Nonaktif.');
  document.body.style.cursor = 'default';

  // Hapus listener
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClickCapture, { capture: true });

  // Bersihkan highlight terakhir jika ada
  if (lastHighlightedElement) {
    lastHighlightedElement.style.outline = 'none';
    lastHighlightedElement.style.cursor = 'default';
    lastHighlightedElement = null;
  }
}

// --- LISTENER UTAMA ---

// Listener untuk pesan dari background.js (saat ikon ekstensi diklik)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ACTIVATE_PIN_MODE") {
    activatePinMode();
    sendResponse({ status: "Mode pin diaktifkan" });
  } else if (request.action === "DEACTIVATE_PIN_MODE_FROM_UI") {
    // Pesan ini dikirim dari App.jsx saat modal ditutup
    deactivatePinMode();
    sendResponse({ status: "Mode pin dinonaktifkan dari UI" });
  }
});

// Listener untuk tombol 'Esc' untuk membatalkan
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isPinModeActive) {
    deactivatePinMode();
  }
});