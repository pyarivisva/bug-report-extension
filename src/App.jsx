/* global chrome */
import React, { useState } from "react";
import "./App.css";
import useScreenshot from "./hooks/useScreenshots";

function App() {
  const { imgUrl, captureScreenshot } = useScreenshot();
  const [showPopup, setShowPopup] = useState(false);

  const handleCapture = async () => {
    await captureScreenshot();
    setShowPopup(true);
  };

  const handleAddMarkup = () => {
    // Kirim pesan ke content script dengan gambar screenshot
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SHOW_MARKUP_OVERLAY",
        image: imgUrl,
      });
    });
    window.close();
  };

  return (
    <div className="container">
      <h3>Bug Reporter</h3>

      <button onClick={handleCapture}>Capture Screenshot</button>

      {showPopup && imgUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "80%",
              maxWidth: "600px",
            }}
          >
            <h4>Screenshot Captured</h4>
            <img
              src={imgUrl}
              alt="Screenshot"
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <div style={{ marginTop: "15px" }}>
              <button
                style={{
                  marginTop: "10px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
                onClick={handleAddMarkup}
              >
                Add Markup
              </button>

              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: "#ccc",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  marginLeft: "8px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
