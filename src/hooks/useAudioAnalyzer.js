import { useEffect, useRef } from "react";

export default function useAudioAnalyzer(audioRef, audioFile) {
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // 🎧 Create the audio context once and reuse it
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioCtx = audioCtxRef.current;

    // ✅ Reuse the same MediaElementSource if it already exists
    if (!sourceRef.current) {
      sourceRef.current = audioCtx.createMediaElementSource(audioEl);
    }

    // ⚙️ Create or reuse analyser
    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Connect graph only once
      sourceRef.current.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Init data array
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      bufferLengthRef.current = bufferLength;
    }

    // 🧩 Resume context (Chrome rule)
    const resume = () => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
    };
    window.addEventListener("click", resume);
    window.addEventListener("keydown", resume);

    return () => {
      window.removeEventListener("click", resume);
      window.removeEventListener("keydown", resume);
      // ❌ DO NOT close or disconnect context here — reuse across files
    };
  }, [audioRef]);

  // 🔄 When a new file loads, resume the context (don’t rebuild)
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  }, [audioFile]);

  return { analyserRef, dataArrayRef, bufferLengthRef };
}
