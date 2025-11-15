import { useEffect, useRef } from "react";
import useAudioAnalyzer from "../hooks/useAudioAnalyzer";
import drawBars from "./modes/BarsVisualizer";
import drawWaveform from "./modes/WaveVisualizer";
import drawRadial from "./modes/RadialVisualizer";

export default function VisualizerCanvas({ audioRef, audioFile, mode, useMic }) {
  const canvasRef = useRef(null);
  const { analyserRef, dataArrayRef, bufferLengthRef } =
    useAudioAnalyzer(audioRef, audioFile, useMic);

  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
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

      if (mode === "Wave") {
        analyser.getByteTimeDomainData(dataArray);
        drawWaveform(ctx, canvas, dataArray);
      } else if (mode === "Radial") {
        drawRadial(ctx, canvas, dataArray, smoothed);
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
  }, [audioFile, mode, useMic, analyserRef, dataArrayRef, bufferLengthRef]);

  return (
    <div className="w-screen flex justify-center">
      <canvas
        ref={canvasRef}
        className="w-[80vw] sm:w-[80vw] h-[45vh]
                  bg-transparent
                  shadow-none outline-none rounded-none"
      />
    </div>
  );
}
