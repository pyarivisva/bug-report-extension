import React from "react";
import "./App.css";
import useScreenshot from "./hooks/useScreenshots";
import useScreenRecording from "./hooks/useScreenRecording";

function App() {
  const { imgUrl, captureScreenshot } = useScreenshot();
  const { recording, videoRef, startRecording, stopRecording } = useScreenRecording();

  return (
    <div className="container">
      <h3>Bug Reporter 🐞</h3>

      {/* Screenshot */}
      <button onClick={captureScreenshot}>
        Capture Screenshot
      </button>

      {imgUrl && (
        <img src={imgUrl} style={{ width: "100%", marginTop: "10px" }} alt="Screenshot" />
      )}

      {/* Video Recording */}
      {!recording ? (
        <button onClick={startRecording} style={{ marginTop: "10px" }}>
          Record Video
        </button>
      ) : (
        <button onClick={stopRecording} style={{ marginTop: "10px", background: "red", color: "white" }}>
          Stop Recording
        </button>
      )}

      <video ref={videoRef} style={{ width: "100%", marginTop: "10px" }} controls></video>
    </div>
  );
}

export default App;
