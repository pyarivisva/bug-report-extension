/* global chrome */
import React from 'react';
import './App.css';

function App() {

  const handleScreenshotClick = () => {
    // Kirim pesan ke background script untuk memulai
    chrome.runtime.sendMessage({ action: "TAKE_SCREENSHOT" });
    // Langsung tutup popup
    window.close();
  };

  return (
    <div className="popup-container">
      <button onClick={handleScreenshotClick} className="popup-button">
        Screenshot & Markup
      </button>
    </div>
  );
}

// Anda bisa tambahkan styling minimal untuk popup di App.css
// .popup-container { width: 200px; padding: 10px; }
// .popup-button { width: 100%; padding: 10px; }

export default App;