/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Bug Reporter Extension installed");
});

chrome.runtime.onMessage.addListener((msg) => {
  // Ambil screenshot dan buka halaman markup
  if (msg.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      // buka tab baru untuk markup
      const markupUrl = chrome.runtime.getURL("markup.html") + "?img=" + encodeURIComponent(dataUrl);
      chrome.tabs.create({ url: markupUrl });
    });
    return true;
  }
});
