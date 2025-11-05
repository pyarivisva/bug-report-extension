/* global chrome */
import { useState } from "react";

export default function useScreenshot() {
  const [imgUrl, setImgUrl] = useState(null);

  const captureScreenshot = async () => {
    try {
      // Ambil tab aktif di window saat ini
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Ambil screenshot dari tab aktif
      const imageUri = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      setImgUrl(imageUri);
      return imageUri;
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  return { imgUrl, captureScreenshot };
}
