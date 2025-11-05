/* global chrome */
import React from "react";
import "./App.css";
import useScreenshot from "./hooks/useScreenshots";
import useScreenRecording from "./hooks/useScreenRecording";

function App() {
  const { imgUrl, captureScreenshot } = useScreenshot();
  const { recording, videoRef, startRecording, stopRecording } =
    useScreenRecording();

  //  Helper function untuk inject content script dan mengirim pesan.
  const triggerContentScript = (message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Pastikan ada tab aktif
      if (!tabs[0] || !tabs[0].id) {
        console.error("No active tab found. Cannot send message.");
        return;
      }
      const tabId = tabs[0].id;

      // Selalu inject script terlebih dahulu
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["contentScript.js"],
        },
        () => {
          // Cek jika injeksi gagal (misal di halaman internal Chrome)
          if (chrome.runtime.lastError) {
            console.error(
              "Script injection failed: ",
              chrome.runtime.lastError.message
            );
            return;
          }

          chrome.tabs.sendMessage(tabId, message, () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Message send failed: ",
                chrome.runtime.lastError.message
              );
            } else {
              // Jika pesan terkirim, tutup popup
              window.close();
            }
          });
        }
      );
    });
  };

  return (
    <div className="container">
      <h3>Bug Reporter 🐞</h3>

      {/* Fitur Screenshot & Video (Tidak berubah) */}
      <button onClick={captureScreenshot}>Capture Screenshot</button>
      {imgUrl && (
        <img
          src={imgUrl}
          style={{ width: "100%", marginTop: "10px" }}
          alt="Screenshot"
        />
      )}
      {!recording ? (
        <button onClick={startRecording} style={{ marginTop: "10px" }}>
          Record Video
        </button>
      ) : (
        <button
          onClick={stopRecording}
          style={{ marginTop: "10px", background: "red", color: "white" }}
        >
          Stop Recording
        </button>
      )}
      <video
        ref={videoRef}
        style={{ width: "100%", marginTop: "10px" }}
        controls
      ></video>

      {/* Garis pemisah */}
      <hr style={{ margin: "15px 0", borderColor: "#eee" }} />

      {/* === PERUBAHAN DI SINI === */}

      {/* TOMBOL BARU UNTUK D1 (Drag Selection) */}
      <button
        style={{ marginTop: "5px", width: "100%" }}
        onClick={() => triggerContentScript({ type: "START_SELECTION" })}
      >
        Select Area (Drag)
      </button>

      {/* TOMBOL LAMA (D2) YANG DIGANTI NAMA */}
      <button
        style={{ marginTop: "10px", width: "100%" }}
        onClick={() => triggerContentScript({ type: "START_CLICK_SELECTION" })}
      >
        Select Element (Click)
      </button>
    </div>
  );
}

export default App;