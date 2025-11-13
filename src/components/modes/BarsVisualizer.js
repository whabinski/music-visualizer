export default function drawBars(ctx, canvas, dataArray, smoothed) {
  const numBars = dataArray.length;
  const barWidth = (canvas.clientWidth / numBars) * 1.15;
  const gap = 0.5;
  const effectiveBarWidth = barWidth - gap;
  const scale = canvas.clientHeight / 255;

  for (let i = 0; i < numBars; i++) {
    smoothed[i] += (dataArray[i] - smoothed[i]) * 0.2;
    const barHeight = smoothed[i] * scale;
    const hue = (i / numBars) * 360;

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.shadowBlur = Math.min(barHeight / 3, 30);
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;

    const x = i * barWidth;
    ctx.fillRect(
      x,
      canvas.clientHeight - barHeight,
      effectiveBarWidth,
      barHeight
    );
  }

  ctx.shadowBlur = 0;
}
