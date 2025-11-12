/* global chrome */

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TAKE_SCREENSHOT") {
    // 1. Ambil screenshot dari tab yang aktif
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      
      // 2. Simpan dataUrl screenshot ke storage lokal sementara
      chrome.storage.local.set({ 'latestScreenshot': dataUrl }, () => {
        
        // 3. Buka tab markup.html
        chrome.tabs.create({ url: chrome.runtime.getURL('markup.html') });
      });
    });
    return true; // Menandakan bahwa kita akan merespons secara asinkron
  }
});