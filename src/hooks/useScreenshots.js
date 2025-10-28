/* global chrome */
import { useState } from "react";

export default function useScreenshot() {
  const [imgUrl, setImgUrl] = useState("");

  const captureScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      setImgUrl(dataUrl);
    });
  };

  return { imgUrl, captureScreenshot };
}
