/* global chrome */
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import useScreenshot from "./hooks/useScreenshots";

function App() {
  const { imgUrl, captureScreenshot } = useScreenshot();

  const canvasRef = useRef(null);
  const [isMarkupMode, setIsMarkupMode] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [activeBug, setActiveBug] = useState(null);

  // Render screenshot di canvas
  useEffect(() => {
    if (imgUrl && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [imgUrl]);

  const handleMouseDown = (e) => {
    if (!isMarkupMode) return;
    const rect = e.target.getBoundingClientRect();
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = (e) => {
    if (!isMarkupMode || !startPoint) return;
    const rect = e.target.getBoundingClientRect();
    const end = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const newBugArea = {
  x: Math.min(startPoint.x, end.x),
  y: Math.min(startPoint.y, end.y),
  w: Math.abs(startPoint.x - end.x),
  h: Math.abs(startPoint.y - end.y),
};
setIsMarkupMode(false);
setActiveBug(newBugArea);

  };

  const handleMouseMove = (e) => {
    if (!isMarkupMode || !startPoint) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = x - startPoint.x;
      const h = y - startPoint.y;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(startPoint.x, startPoint.y, w, h);
    };
  };

  const saveBug = (title, desc) => {
    const newBug = { ...activeBug, title, desc };
    const updated = [...bugs, newBug];
    setBugs(updated);
    chrome.storage.local.set({ bugs: updated });
    setActiveBug(null);
  };

  return (
    <div className="container">
      <h3>Bug Reporter</h3>

      {/* Capture Screenshot */}
      <button onClick={captureScreenshot}>Capture Screenshot</button>

      {/* Start Markup */}
      {imgUrl && (
        <button
          style={{ marginTop: "10px" }}
          onClick={() => setIsMarkupMode(true)}
        >
          Start Markup
        </button>
      )}

      {/* Canvas Screenshot */}
      {imgUrl && (
        <div style={{ position: "relative", marginTop: "10px" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              border: "1px solid #ccc",
              width: "100%",
              cursor: isMarkupMode ? "crosshair" : "default",
            }}
          ></canvas>

          {/* Tooltip Bug Form */}
          {activeBug && (
            <div
              style={{
                position: "absolute",
                top: activeBug.y + activeBug.h + 10,
                left: activeBug.x,
                background: "white",
                border: "1px solid #aaa",
                padding: "8px",
                borderRadius: "8px",
                zIndex: 10,
                width: "200px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "14px" }}>Describe Bug</h4>
              <input
                type="text"
                placeholder="Title"
                id="bugTitle"
                style={{ width: "100%", marginTop: "5px" }}
              />
              <textarea
                placeholder="Description"
                id="bugDesc"
                style={{ width: "100%", marginTop: "5px", height: "60px" }}
              ></textarea>
              <button
                style={{
                  width: "100%",
                  marginTop: "5px",
                  background: "#007bff",
                  color: "white",
                }}
                onClick={() =>
                  saveBug(
                    document.getElementById("bugTitle").value,
                    document.getElementById("bugDesc").value
                  )
                }
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
