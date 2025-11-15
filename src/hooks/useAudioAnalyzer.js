import { useEffect, useRef } from "react";

export default function useAudioAnalyzer(audioRef, audioFile, useMic = false) {
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const audioCtxRef = useRef(null);
  const elementSourceRef = useRef(null); // audio <audio> source
  const micSourceRef = useRef(null);     // mic source
  const micStreamRef = useRef(null);     // mic stream

  // 🔊 Original: set up AudioContext + analyser + media element source ONCE
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Create or reuse AudioContext
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioCtx = audioCtxRef.current;

    // Create MediaElementSource ONLY ONCE
    if (!elementSourceRef.current) {
      elementSourceRef.current = audioCtx.createMediaElementSource(audioEl);
    }

    // Create analyser ONLY ONCE
    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // tap audio element into analyser
      elementSourceRef.current.connect(analyser);
      // send audio element directly to output (not through analyser)
      elementSourceRef.current.connect(audioCtx.destination);

      // init data buffer
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      bufferLengthRef.current = bufferLength;
    }

    // Resume context on user interaction (Chrome autoplay rule)
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
      // Do NOT close or disconnect here — we reuse the graph for the whole app
    };
  }, [audioRef]);

  // When a new file loads, just ensure the context is resumed
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  }, [audioFile]);

  // 🎤 Mic handling: add/remove mic source to the SAME analyser
  useEffect(() => {
    const audioCtx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!audioCtx || !analyser) return;

    let cancelled = false;

    const enableMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          // effect was cleaned up before permission resolved
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;

        const micSource = audioCtx.createMediaStreamSource(stream);
        micSourceRef.current = micSource;

        // Mic goes ONLY into analyser (no echo)
        micSource.connect(analyser);
      } catch (err) {
        console.error("Microphone access error:", err);
      }
    };

    if (useMic) {
      enableMic();
    } else {
      // turning mic OFF → disconnect & stop stream
      if (micSourceRef.current) {
        try {
          micSourceRef.current.disconnect();
        } catch {}
        micSourceRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    }

    return () => {
      cancelled = true;

      // if unmounting while mic is still on, clean it up
      if (useMic) {
        if (micSourceRef.current) {
          try {
            micSourceRef.current.disconnect();
          } catch {}
          micSourceRef.current = null;
        }
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
        }
      }
    };
  }, [useMic]);

  return { analyserRef, dataArrayRef, bufferLengthRef };
}
