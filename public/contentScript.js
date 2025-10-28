/* global chrome */

// (function () {
//   if (window.__BUG_REPORTER_LOADED__) {
//     console.log("Content script already loaded. Skipping duplicate.");
//     return;
//   }
//   window.__BUG_REPORTER_LOADED__ = true;
// })();

let selectionBox = null;
let startX, startY, endX, endY;
let isSelecting = false;

function enableSelection() {
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  document.body.style.cursor = "crosshair";
}

function disableSelection() {
  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  document.body.style.cursor = "default";
  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }
}

let hoverBox = null;
// let clickMarker = null;

function enableClickSelection() {
  document.addEventListener("mousemove", onHoverElement);
  document.addEventListener("click", onClickElement, true);
  document.body.style.cursor = "pointer";
}

function disableClickSelection() {
  document.removeEventListener("mousemove", onHoverElement);
  document.removeEventListener("click", onClickElement, true);
  document.body.style.cursor = "default";
  if (hoverBox) hoverBox.remove();
}

function onHoverElement(e) {
  const el = e.target;
  const rect = el.getBoundingClientRect();

  if (!hoverBox) {
    hoverBox = document.createElement("div");
    hoverBox.style.position = "fixed";
    hoverBox.style.pointerEvents = "none";
    hoverBox.style.border = "2px solid red";
    hoverBox.style.zIndex = "999999";
    document.body.appendChild(hoverBox);
  }

  hoverBox.style.left = rect.left + "px";
  hoverBox.style.top = rect.top + "px";
  hoverBox.style.width = rect.width + "px";
  hoverBox.style.height = rect.height + "px";
}

function onClickElement(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  const rect = el.getBoundingClientRect();

  disableClickSelection();

  chrome.runtime.sendMessage({
    type: "ELEMENT_SELECTED",
    rect: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START_CLICK_SELECTION") {
    enableClickSelection();
  }
});


function onMouseDown(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px solid red";
  selectionBox.style.pointerEvents = "none";
  selectionBox.style.zIndex = "999999";
  document.body.appendChild(selectionBox);
}

function onMouseMove(e) {
  if (!isSelecting) return;
  endX = e.clientX;
  endY = e.clientY;

  const rect = {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(startX - endX),
    height: Math.abs(startY - endY)
  };

  selectionBox.style.left = rect.left + "px";
  selectionBox.style.top = rect.top + "px";
  selectionBox.style.width = rect.width + "px";
  selectionBox.style.height = rect.height + "px";
}

function onMouseUp() {
  isSelecting = false;

  const rect = selectionBox.getBoundingClientRect();
  disableSelection();

  chrome.runtime.sendMessage({
    type: "SELECTION_COMPLETE",
    rect: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START_SELECTION") {
    enableSelection();
  }
});
