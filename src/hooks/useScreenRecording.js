import { useState, useRef } from "react";

export default function useScreenRecording() {
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error start recording:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    const tracks = videoRef.current.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    setRecording(false);
  };

  return {
    recording,
    videoRef,
    startRecording,
    stopRecording,
  };
}
