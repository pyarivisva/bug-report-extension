/* global chrome */
// === File: public/markup.js (REVISI BESAR) ===

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('screenshot-container');
  const screenshotImage = document.getElementById('screenshot-image');
  let pinCounter = 1; // Untuk menghitung jumlah pin

  // 1. Muat screenshot dari storage
  chrome.storage.local.get('latestScreenshot', (data) => {
    if (data.latestScreenshot) {
      screenshotImage.src = data.latestScreenshot;
      chrome.storage.local.remove('latestScreenshot');
    } else {
      screenshotImage.alt = "Gagal memuat screenshot.";
    }
  });

  // 2. Event listener klik pada kontainer
  container.addEventListener('click', (event) => {
    // Cek apakah kita mengklik form yang sudah ada atau gambar
    // Jika kita mengklik sesuatu di dalam form, jangan buat form baru
    if (event.target.closest('.bug-tooltip-wrapper')) {
      return;
    }
    
    // Dapatkan posisi klik relatif terhadap kontainer
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Buat form tooltip di posisi itu
    createTooltipForm(x, y);
  });

  // 3. Fungsi baru untuk membuat form "Tooltip"
  function createTooltipForm(x, y) {
    // Buat elemen wrapper (yang akan diposisikan)
    const tooltipWrapper = document.createElement('div');
    tooltipWrapper.className = 'bug-tooltip-wrapper';
    tooltipWrapper.style.left = `${x}px`;
    tooltipWrapper.style.top = `${y}px`;
    
    const currentPin = pinCounter; // Simpan nomor pin saat ini
    pinCounter++; // Tambah counter untuk pin berikutnya

    // Isi HTML untuk form
    tooltipWrapper.innerHTML = `
      <div class="bug-pin">${currentPin}</div>
      <div class="bug-form-content">
        <form class="bug-form">
          <input type="text" class="bug-title" placeholder="Judul bug..." required>
          <textarea class="bug-description" rows="3" placeholder="Deskripsi..."></textarea>
          <div class="bug-form-actions">
            <button type="button" class="bug-cancel">Batal</button>
            <button type="submit" class="bug-send">Kirim</button>
          </div>
        </form>
      </div>
    `;
    
    // Tambahkan form ke kontainer
    container.appendChild(tooltipWrapper);
    
    // Fokus ke input judul
    tooltipWrapper.querySelector('.bug-title').focus();

    // Tambahkan event listener untuk tombol form BARU ini
    const form = tooltipWrapper.querySelector('.bug-form');
    const pinElement = tooltipWrapper.querySelector('.bug-pin');

    // Handle "Kirim"
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Hentikan event agar tidak memicu listener kontainer
      
      const title = tooltipWrapper.querySelector('.bug-title').value;
      const description = tooltipWrapper.querySelector('.bug-description').value;

      const report = {
        pin: currentPin,
        title: title,
        description: description,
        position: { x, y },
        screenshotUrl: screenshotImage.src,
      };

      // GANTI INI: Kirim 'report' ke API atau server Anda
      console.log("LAPORAN SIAP DIKIRIM:", report);
      alert(`Laporan #${currentPin} "${title}" terkirim!`);
      
      // Tandai sebagai terkirim (misal, ganti warna pin)
      pinElement.classList.add('submitted');
      // Tutup dan nonaktifkan form-nya
      tooltipWrapper.querySelector('.bug-form-content').remove();
    });

    // Handle "Batal"
    tooltipWrapper.querySelector('.bug-cancel').addEventListener('click', (e) => {
      e.stopPropagation();
      // Hapus seluruh tooltip jika dibatalkan
      tooltipWrapper.remove();
      // Kurangi counter pin jika dibatalkan
      pinCounter--; 
    });
  }

  const finishButton = document.getElementById('finish-markup-button');

  finishButton.addEventListener('click', () => {
    // Tanyakan konfirmasi (opsional tapi bagus)
    if (confirm("Apakah Anda yakin sudah selesai melakukan markup? Tab ini akan ditutup.")) {
      
      // Aksi untuk menutup tab
      // Karena tab ini dibuka oleh ekstensi, kita bisa menutupnya
      window.close();
    }
  });
});