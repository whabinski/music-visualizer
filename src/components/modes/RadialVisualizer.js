let rotationOffset = 0;

export default function drawRadial(ctx, canvas, dataArray, smoothed) {
  // ensure we're using the true canvas dimensions (resized dynamically)
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  // correct for high-DPI scaling
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const numBars = dataArray.length;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.15;
  const maxBarLength = Math.min(centerX, centerY) - radius - 10;

  // background fade for motion trail
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(0, 0, width, height);

  const time = Date.now() * 0.001;
  const hueShift = (time * 20) % 360;
  rotationOffset += 0.002;

  const angleStep = (Math.PI * 2) / numBars;
  const avgAmp = dataArray.reduce((a, b) => a + b, 0) / (255 * numBars);
  const pulse = 1 + avgAmp * 0.25;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotationOffset);

  for (let i = 0; i < numBars; i++) {
    smoothed[i] += (dataArray[i] - smoothed[i]) * 0.25;

    // nonlinear amplification + soft cap
    let barHeight = smoothed[i] * 1.8 * pulse;
    barHeight = Math.pow(barHeight / maxBarLength, 0.8) * maxBarLength;
    const norm = barHeight / maxBarLength;
    if (norm > 1) {
      const compression = 1 - Math.exp(-1.2 * (norm - 1));
      barHeight = maxBarLength * (1 + compression * 0.25);
    }

    const hue = ((i / numBars) * 360 + hueShift) % 360;

    ctx.save();
    ctx.rotate(i * angleStep);
    ctx.shadowBlur = 25;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

    const barWidth = 2.4;
    const start = radius;
    const end = radius + barHeight * 0.85;
    ctx.fillRect(start, -barWidth / 2, end - start, barWidth);
    ctx.restore();
  }

  ctx.restore();
  ctx.shadowBlur = 0;
}
