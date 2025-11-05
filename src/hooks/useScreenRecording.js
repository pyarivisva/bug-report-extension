import { useState, useRef } from "react";
/* global chrome */

function useScreenRecording() {
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = () => {
    // Dapatkan tab yang aktif saat ini
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        console.error("No active tab found");
        return;
      }

      chrome.tabCapture.capture(
        {
          video: true,
          audio: false, 
        },
        (stream) => {
          if (chrome.runtime.lastError) {
            console.error(
              "tabCapture error:",
              chrome.runtime.lastError.message
            );
            return;
          }

          videoRef.current.srcObject = stream;
          videoRef.current.play();

          chunksRef.current = [];
          const mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            videoRef.current.srcObject = null;
            videoRef.current.src = url;

            stream.getTracks().forEach((track) => track.stop());
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
          setRecording(true);
        }
      );
    });
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return { recording, videoRef, startRecording, stopRecording };
}

export default useScreenRecording;