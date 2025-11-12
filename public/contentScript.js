/* global chrome */

let lastHighlightedElement = null;
let isPinModeActive = false;

function handleMouseOver(event) {
  const targetElement = event.target;

  if (targetElement.id === 'bug-report-react-root' || targetElement.closest('#bug-report-react-root')) {
    return;
  }

  targetElement.style.outline = '3px dotted #E03A3E';
  targetElement.style.cursor = 'crosshair';
  lastHighlightedElement = targetElement;
}

function handleMouseOut(event) {
  const targetElement = event.target;
  targetElement.style.outline = 'none';
  targetElement.style.cursor = 'default';
}

function handleClickCapture(event) {
  event.preventDefault();
  event.stopPropagation();

  const clickedElement = event.target;

  deactivatePinMode();

  if (clickedElement) {
    clickedElement.style.outline = 'none';
    clickedElement.style.cursor = 'default';
  }

  const clickData = {
    x: event.clientX,         
    y: event.clientY,
    pageScrollX: window.scrollX,
    pageScrollY: window.scrollY,
    elementTag: clickedElement.tagName,
    elementId: clickedElement.id,
    elementClasses: clickedElement.className,
    pageUrl: window.location.href
  };

  console.log('Elemen diklik:', clickData);

  chrome.runtime.sendMessage({
    action: "SHOW_COMMENT_BOX",
    data: clickData
  });
}

function activatePinMode() {
  if (isPinModeActive) return;
  isPinModeActive = true;
  console.log('Mode "Point-and-Click" Aktif!');
  document.body.style.cursor = 'crosshair';

  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClickCapture, { capture: true });
}

function deactivatePinMode() {
  if (!isPinModeActive) return;
  isPinModeActive = false;
  console.log('Mode "Point-and-Click" Nonaktif.');
  document.body.style.cursor = 'default';

  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClickCapture, { capture: true });

  if (lastHighlightedElement) {
    lastHighlightedElement.style.outline = 'none';
    lastHighlightedElement.style.cursor = 'default';
    lastHighlightedElement = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ACTIVATE_PIN_MODE") {
    activatePinMode();
    sendResponse({ status: "Mode pin diaktifkan" });
  } else if (request.action === "DEACTIVATE_PIN_MODE_FROM_UI") {
    deactivatePinMode();
    sendResponse({ status: "Mode pin dinonaktifkan dari UI" });
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isPinModeActive) {
    deactivatePinMode();
  }
});