/* global chrome */
import { useState } from "react";

function App() {
  const [imgUrl, setImgUrl] = useState("");

  const captureScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      setImgUrl(dataUrl);
    });
  };

  return (
    <div style={{ width: "250px", padding: "10px" }}>
      <h3>Bug Reporter</h3>
      <button onClick={captureScreenshot}>Capture Screenshot</button>

      {imgUrl && (
        <img
          src={imgUrl}
          alt="Screenshot"
          style={{ width: "100%", marginTop: "10px", border: "1px solid #ccc" }}
        />
      )}
    </div>
  );
}

export default App;
