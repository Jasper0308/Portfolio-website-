// helpers
const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))

// set current year
document.addEventListener('DOMContentLoaded', () => {
  const y = new Date().getFullYear()
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = y

  // create animated orbs
  const orbsRoot = document.querySelector('.orbs')
  if (orbsRoot) {
    const colors = [
      'rgba(255,20,147,0.95)',
      'rgba(0,200,255,0.9)',
      'rgba(0,255,120,0.9)',
      'rgba(255,180,0,0.85)',
      'rgba(180,0,255,0.85)'
    ]
    for (let i = 0; i < 5; i++) {
      const o = document.createElement('div')
      o.className = 'orb o' + (i + 1)
      o.style.background = colors[i % colors.length]
      orbsRoot.appendChild(o)
    }
  }

  // small parallax for orbs
  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5)
    const cy = (e.clientY / window.innerHeight - 0.5)
    $$('.orbs .orb').forEach((orb, i) => {
      const speed = (i + 1) * 6
      orb.style.transform = `translate3d(${cx * speed}px, ${cy * speed}px, 0)`
    })
  })

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show')
    })
  }, { threshold: 0.12 })

  $$('.slide-up').forEach(el => io.observe(el))
  $$('.card').forEach(el => io.observe(el))

  // animate skill bars when visible
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fills = e.target.querySelectorAll('.bar-fill')
        fills.forEach(f => {
          const v = f.getAttribute('data-fill') || 0
          f.style.width = v + '%'
        })
        skillObserver.unobserve(e.target)
      }
    })
  }, { threshold: 0.2 })
  $$('.skills').forEach(s => skillObserver.observe(s))

  // simple tilt for project cards
  $$('.project[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', tilt)
    card.addEventListener('pointerleave', resetTilt)
  })

  // add subtle glow on profile using canvas
  const canvas = document.querySelector('.pic-glow')
  const img = document.querySelector('.profile-pic')
  if (canvas && img && canvas.getContext) {
    function fitCanvas() {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawGlow()
    }
    function drawGlow() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const grd = ctx.createLinearGradient(0,0,canvas.width,canvas.height)
      grd.addColorStop(0, 'rgba(255,20,147,0.12)')
      grd.addColorStop(0.5, 'rgba(0,200,255,0.12)')
      grd.addColorStop(1, 'rgba(0,255,120,0.10)')
      ctx.fillStyle = grd
      ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.globalCompositeOperation = 'lighter'
      for (let i=0; i<5; i++) {
        ctx.beginPath()
        ctx.arc(canvas.width/2, canvas.height/2, (canvas.width * 0.5) + i*8, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${0.02 - i*0.002})`
        ctx.fill()
      }
    }
    window.addEventListener('resize', fitCanvas)
    fitCanvas()
  }

  // typed headline effect (non-blocking)
  $$('.typed').forEach(el => {
    const text = el.getAttribute('data-text') || el.textContent || ''
    el.textContent = ''
    let i = 0
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i)
        i++
        setTimeout(tick, 28)
      }
    }
    tick()
  })

  // footer social icon glow
  $$('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.boxShadow = '0 10px 50px rgba(0,200,255,0.15)'
      link.style.transform = 'translateY(-6px) scale(1.06)'
    })
    link.addEventListener('mouseleave', () => {
      link.style.boxShadow = ''
      link.style.transform = ''
    })
  })
})

// tilt math functions
function tilt(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  const rx = (py - 0.5) * 10
  const ry = (px - 0.5) * -16
  el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`
}
function resetTilt(e) {
  e.currentTarget.style.transform = 'none'
}

function drawPieChart(ctx, data, colors, animationDuration) {
  const total = data.reduce((a, b) => a + b, 0);
  let startAngle = -Math.PI / 2;
  const frameRate = 60;
  const totalFrames = Math.round(animationDuration / (1000 / frameRate));
  let currentFrame = 0;

  function animate() {
    currentFrame++;
    const progress = Math.min(currentFrame / totalFrames, 1);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let angle = startAngle;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI * progress;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2 - 20, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();

      // Draw number and percentage during and after animation
      if (sliceAngle > 0.05) { // avoid clutter on very small slices
        const midAngle = angle + sliceAngle / 2;
        const radius = ctx.canvas.width / 2 - 60;
        const x = ctx.canvas.width / 2 + radius * Math.cos(midAngle);
        const y = ctx.canvas.height / 2 + radius * Math.sin(midAngle);
        ctx.fillStyle = '#e7f5ff';
        ctx.font = '14px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const percent = ((data[i] / total) * 100).toFixed(0);
        ctx.fillText(`${data[i]} (${percent}%)`, x, y);
      }

      angle += sliceAngle;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function lightenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.min(255, parseInt(parts[1]) + 255 * amount);
  let g = Math.min(255, parseInt(parts[2]) + 255 * amount);
  let b = Math.min(255, parseInt(parts[3]) + 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function darkenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.max(0, parseInt(parts[1]) - 255 * amount);
  let g = Math.max(0, parseInt(parts[2]) - 255 * amount);
  let b = Math.max(0, parseInt(parts[3]) - 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function lightenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.min(255, parseInt(parts[1]) + 255 * amount);
  let g = Math.min(255, parseInt(parts[2]) + 255 * amount);
  let b = Math.min(255, parseInt(parts[3]) + 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function darkenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.max(0, parseInt(parts[1]) - 255 * amount);
  let g = Math.max(0, parseInt(parts[2]) - 255 * amount);
  let b = Math.max(0, parseInt(parts[3]) - 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function lightenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.min(255, parseInt(parts[1]) + 255 * amount);
  let g = Math.min(255, parseInt(parts[2]) + 255 * amount);
  let b = Math.min(255, parseInt(parts[3]) + 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function darkenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.max(0, parseInt(parts[1]) - 255 * amount);
  let g = Math.max(0, parseInt(parts[2]) - 255 * amount);
  let b = Math.max(0, parseInt(parts[3]) - 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function lightenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.min(255, parseInt(parts[1]) + 255 * amount);
  let g = Math.min(255, parseInt(parts[2]) + 255 * amount);
  let b = Math.min(255, parseInt(parts[3]) + 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function darkenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.max(0, parseInt(parts[1]) - 255 * amount);
  let g = Math.max(0, parseInt(parts[2]) - 255 * amount);
  let b = Math.max(0, parseInt(parts[3]) - 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function drawPieChart(ctx, data, colors, animationDuration) {
  const total = data.reduce((a, b) => a + b, 0);
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const baseRadius = ctx.canvas.width / 2 - 20;
  let startAngle = -Math.PI / 2;
  const frameRate = 60;
  const totalFrames = Math.round(animationDuration / (1000 / frameRate));
  let currentFrame = 0;
  let rotation = 0;
  const rotationSpeed = 0.01;
  let selectedSlice = null; // index of selected slice

  function animate() {
    currentFrame++;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    const lightAngle = rotation;

    // Draw shadow offset downward
    ctx.save();
    ctx.translate(0, 6);
    let shadowAngle = startAngle;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (sliceAngle <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, baseRadius, shadowAngle, shadowAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = darkenColor(colors[i], 0.25);
      ctx.fill();
      shadowAngle += sliceAngle;
    }
    ctx.restore();

    let angle = startAngle;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (sliceAngle <= 0) continue;

      const isSelected = selectedSlice === i;
      // Expand radius if selected
      const radius = isSelected ? baseRadius + 10 : baseRadius;

      const midAngle = angle + sliceAngle / 2;
      const lightDiff = Math.cos(midAngle - lightAngle);
      const brightness = 0.4 + 0.6 * Math.max(lightDiff, 0);

      let baseColor = colors[i];
      if (isSelected) {
        baseColor = lightenColor(baseColor, 0.25);
      }
      const lightColor = lightenColor(baseColor, 0.4 * brightness);
      const darkColor = darkenColor(baseColor, 0.3 * (1 - brightness));

      const grad = ctx.createRadialGradient(cx, cy - 10, radius * 0.3, cx, cy, radius);
      grad.addColorStop(0, lightColor);
      grad.addColorStop(1, darkColor);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.005);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      angle += sliceAngle;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#031022';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Labels
    angle = startAngle;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (sliceAngle <= 0) continue;

      const midAngle = angle + sliceAngle / 2 + rotation;
      const labelRadius = baseRadius * 0.7;
      const x = cx + labelRadius * Math.cos(midAngle);
      const y = cy + labelRadius * Math.sin(midAngle);
      ctx.fillStyle = '#e7f5ff';
      ctx.font = 'bold 14px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const percent = ((data[i] / total) * 100).toFixed(0);
      ctx.fillText(`${data[i]} (${percent}%)`, x, y);

      angle += sliceAngle;
    }

    ctx.restore();

    rotation += rotationSpeed;

    requestAnimationFrame(animate);
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function handleClick(evt) {
    const pos = getMousePos(ctx.canvas, evt);
    const x = pos.x - cx;
    const y = pos.y - cy;
    const distance = Math.sqrt(x * x + y * y);
    if (distance < baseRadius * 0.45 || distance > baseRadius + 15) {
      // inside hole or outside circle, no slice selected
      selectedSlice = null;
      return;
    }
    // Calculate angle of click relative to top center (-Math.PI/2)
    let clickAngle = Math.atan2(y, x) - rotation;
    if (clickAngle < -Math.PI / 2) {
      clickAngle += 2 * Math.PI;
    }
    // Normalize to 0-2PI from -PI/2 start
    clickAngle = (clickAngle + Math.PI * 2 + Math.PI / 2) % (2 * Math.PI);

    let angle = 0;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (clickAngle >= angle && clickAngle < angle + sliceAngle) {
        // Toggle selection
        selectedSlice = selectedSlice === i ? null : i;
        break;
      }
      angle += sliceAngle;
    }
  }

  ctx.canvas.addEventListener('click', handleClick);

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  const pieCanvas = document.getElementById('pieChart');
  if (pieCanvas) {
    const ctx = pieCanvas.getContext('2d');
    pieCanvas.width = 300;
    pieCanvas.height = 300;

    const skillValues = [95, 92, 89, 93];
    const skillColors = [
      'rgba(0,200,255,0.8)',
      'rgba(255,20,147,0.8)',
      'rgba(0,255,120,0.8)',
      'rgba(255,180,0,0.8)'
    ];
    drawPieChart(ctx, skillValues, skillColors, 1500);
  }
});

function lightenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.min(255, parseInt(parts[1]) + 255 * amount);
  let g = Math.min(255, parseInt(parts[2]) + 255 * amount);
  let b = Math.min(255, parseInt(parts[3]) + 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function darkenColor(color, amount) {
  const parts = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)?\)/);
  if (!parts) return color;
  let r = Math.max(0, parseInt(parts[1]) - 255 * amount);
  let g = Math.max(0, parseInt(parts[2]) - 255 * amount);
  let b = Math.max(0, parseInt(parts[3]) - 255 * amount);
  const a = parts[4] !== undefined && parts[4] !== '' ? parseFloat(parts[4]) : 1;
  return `rgba(${r},${g},${b},${a})`;
}

function drawPieChart(ctx, data, colors, animationDuration) {
  const total = data.reduce((a, b) => a + b, 0);
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const baseRadius = ctx.canvas.width / 2 - 30;
  const depth = 20; // thickness of pie chart
  let startAngle = -Math.PI / 2;
  const frameRate = 60;
  const totalFrames = Math.round(animationDuration / (1000 / frameRate));
  let currentFrame = 0;
  let rotation = 0;
  const rotationSpeed = 0.008;
  let selectedSlice = null;

  function animate() {
    currentFrame++;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw from bottom layers (depth)
    for (let layer = depth; layer >= 0; layer--) {
      ctx.save();
      ctx.translate(cx, cy + layer);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);

      let angle = startAngle;
      for (let i = 0; i < data.length; i++) {
        const sliceAngle = (data[i] / total) * 2 * Math.PI;
        if (sliceAngle <= 0) continue;

        const isSelected = selectedSlice === i;
        const radius = isSelected ? baseRadius + 12 : baseRadius;

        // Darker shade for lower layers
        let colorShade = darkenColor(colors[i], 0.05 + (depth - layer) * 0.02);
        if (isSelected) {
          colorShade = lightenColor(colorShade, 0.2);
        }

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
        ctx.lineTo(cx, cy);
        ctx.closePath();

        ctx.fillStyle = colorShade;
        ctx.fill();

        angle += sliceAngle;
      }

      ctx.restore();
    }

    // Draw top layer with gradient and highlights
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    let angle = startAngle;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (sliceAngle <= 0) continue;

      const isSelected = selectedSlice === i;
      const radius = isSelected ? baseRadius + 12 : baseRadius;

      const midAngle = angle + sliceAngle / 2;

      // Gradient for depth and light
      const grad = ctx.createRadialGradient(
        cx + Math.cos(midAngle) * radius * 0.3,
        cy + Math.sin(midAngle) * radius * 0.3 - 10,
        radius * 0.1,
        cx,
        cy - 10,
        radius
      );

      let baseColor = colors[i];
      if (isSelected) {
        baseColor = lightenColor(baseColor, 0.3);
      }
      grad.addColorStop(0, lightenColor(baseColor, 0.4));
      grad.addColorStop(1, darkenColor(baseColor, 0.25));

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Slice border highlight
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.007);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      angle += sliceAngle;
    }
    ctx.restore();

    // Draw inner circle (hole)
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#031022';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw labels
    angle = startAngle;
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.fillStyle = '#e7f5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (sliceAngle <= 0) continue;

      const midAngle = angle + sliceAngle / 2 + rotation;
      const labelRadius = baseRadius * 0.8;
      const x = cx + labelRadius * Math.cos(midAngle);
      const y = cy + labelRadius * Math.sin(midAngle);

      const percent = ((data[i] / total) * 100).toFixed(0);
      ctx.fillText(`${data[i]} (${percent}%)`, x, y);

      angle += sliceAngle;
    }

    rotation += rotationSpeed;

    requestAnimationFrame(animate);
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function handleClick(evt) {
    const pos = getMousePos(ctx.canvas, evt);
    const x = pos.x - cx;
    const y = pos.y - cy;
    const distance = Math.sqrt(x * x + y * y);
    if (distance < baseRadius * 0.5 || distance > baseRadius + 15) {
      selectedSlice = null;
      return;
    }
    let clickAngle = Math.atan2(y, x) - rotation;
    if (clickAngle < -Math.PI / 2) {
      clickAngle += 2 * Math.PI;
    }
    clickAngle = (clickAngle + Math.PI * 2 + Math.PI / 2) % (2 * Math.PI);

    let angle = 0;
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      if (clickAngle >= angle && clickAngle < angle + sliceAngle) {
        selectedSlice = selectedSlice === i ? null : i;
        break;
      }
      angle += sliceAngle;
    }
  }

  ctx.canvas.addEventListener('click', handleClick);

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  const pieCanvas = document.getElementById('pieChart');
  if (pieCanvas) {
    const ctx = pieCanvas.getContext('2d');
    pieCanvas.width = 300;
    pieCanvas.height = 300;

    const skillValues = [95, 92, 89, 93];
    const skillColors = [
      'rgba(0,200,255,0.8)',
      'rgba(255,20,147,0.8)',
      'rgba(0,255,120,0.8)',
      'rgba(255,180,0,0.8)'
    ];
    drawPieChart(ctx, skillValues, skillColors, 1500);
  }
});