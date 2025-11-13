import { useEffect, useRef } from "react";
import useAudioAnalyzer from "../hooks/useAudioAnalyzer";
import drawBars from "./modes/BarsVisualizer";
import drawWaveform from "./modes/WaveformVisualizer";

export default function VisualizerCanvas({ audioRef, audioFile, mode }) {
  const canvasRef = useRef(null);
  const { analyserRef, dataArrayRef, bufferLengthRef } =
    useAudioAnalyzer(audioRef, audioFile);

  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = bufferLengthRef.current;
    const smoothed = new Array(bufferLength).fill(0);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === "Waveform") {
        analyser.getByteTimeDomainData(dataArray);
        drawWaveform(ctx, canvas, dataArray);
      } else {
        drawBars(ctx, canvas, dataArray, smoothed);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [audioFile, mode]);

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        className="w-[100%] max-w-7xl h-[45vh]
                   bg-transparent border-2 border-white
                   shadow-none outline-none rounded-none"
      />
    </div>
  );
}
