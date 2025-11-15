import { useEffect, useRef } from "react";

export default function useAudioAnalyzer(audioRef, audioFile, useMic = false) {
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(0);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let audioCtx;
    let source;

    const setup = async () => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      if (useMic) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        source = audioCtx.createMediaStreamSource(stream);
      } else if (audioRef.current && audioFile) {
        source = audioCtx.createMediaElementSource(audioRef.current);
      }

      if (source) {
        source.connect(analyser);
        if (!useMic) {
          analyser.connect(audioCtx.destination);
        }

        sourceRef.current = source;
      }


      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
    };

    setup();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [audioFile, useMic]);

  return { analyserRef, dataArrayRef, bufferLengthRef };
}
