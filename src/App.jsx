/* global chrome */
import React from 'react';
import './App.css';

function App() {

  const handleScreenshotClick = () => {
    chrome.runtime.sendMessage({ action: "TAKE_SCREENSHOT" });
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

export default App;