/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('screenshot-container');
  const screenshotImage = document.getElementById('screenshot-image');
  let pinCounter = 1;

  // Muat screenshot dari storage
  chrome.storage.local.get('latestScreenshot', (data) => {
    if (data.latestScreenshot) {
      screenshotImage.src = data.latestScreenshot;
      chrome.storage.local.remove('latestScreenshot');
    } else {
      screenshotImage.alt = "Gagal memuat screenshot.";
    }
  });

  // Event listener klik pada kontainer
  container.addEventListener('click', (event) => {
    if (event.target.closest('.bug-tooltip-wrapper')) {
      return;
    }
    
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    createTooltipForm(x, y);
  });

  // Fungsi baru untuk membuat form "Tooltip"
  function createTooltipForm(x, y) {

    const tooltipWrapper = document.createElement('div');
    tooltipWrapper.className = 'bug-tooltip-wrapper';
    tooltipWrapper.style.left = `${x}px`;
    tooltipWrapper.style.top = `${y}px`;
    
    const currentPin = pinCounter;
    pinCounter++;

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
    
    container.appendChild(tooltipWrapper);
    
    tooltipWrapper.querySelector('.bug-title').focus();

    const form = tooltipWrapper.querySelector('.bug-form');
    const pinElement = tooltipWrapper.querySelector('.bug-pin');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const title = tooltipWrapper.querySelector('.bug-title').value;
      const description = tooltipWrapper.querySelector('.bug-description').value;

      const report = {
        pin: currentPin,
        title: title,
        description: description,
        position: { x, y },
        screenshotUrl: screenshotImage.src,
      };

      console.log("LAPORAN SIAP DIKIRIM:", report);
      alert(`Laporan #${currentPin} "${title}" terkirim!`);
      
      pinElement.classList.add('submitted');
      tooltipWrapper.querySelector('.bug-form-content').remove();
    });

    tooltipWrapper.querySelector('.bug-cancel').addEventListener('click', (e) => {
      e.stopPropagation();
      tooltipWrapper.remove();
      pinCounter--; 
    });
  }

  const finishButton = document.getElementById('finish-markup-button');

  finishButton.addEventListener('click', () => {
    if (confirm("Apakah Anda yakin sudah selesai melakukan markup? Tab ini akan ditutup.")) {

      window.close();
    }
  });
});