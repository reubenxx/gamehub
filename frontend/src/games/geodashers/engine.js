const BASE_HEIGHT = 720;
const PLAYER_SIZE = 46;
const PLAYER_OFFSET_X = 320;
const MIN_Y = 80;
const MAX_Y = BASE_HEIGHT - PLAYER_SIZE - 40;
const GRAVITY = 2400;
const THRUST = 3200;
const MAX_VY = 1100;
const PARTICLE_LIFE = 0.35;
const PARTICLE_COUNT = 72;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function getObstaclePosition(obstacle, time) {
  if (obstacle.type === "moving") {
    const offset = Math.sin(time * obstacle.freq + (obstacle.phase || 0)) * (obstacle.moveY || 120);
    return { x: obstacle.x, y: obstacle.y + offset, w: obstacle.w, h: obstacle.h };
  }
  return { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
}

function createParticle(x, y, hue) {
  return {
    x,
    y,
    vx: -90 + Math.random() * -70,
    vy: (-20 + Math.random() * 40) * 0.4,
    life: PARTICLE_LIFE,
    size: 4 + Math.random() * 8,
    hue,
  };
}

export function createGeoDashersGame(canvas, level, options) {
  const ctx = canvas.getContext("2d");
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  let dpr = window.devicePixelRatio || 1;
  let scale = height / BASE_HEIGHT;
  let rafId;
  let running = true;
  let lastTime = performance.now();
  const state = {
    worldX: 0,
    cameraX: 0,
    time: 0,
    player: {
      y: BASE_HEIGHT * 0.5,
      vy: 0,
    },
    alive: true,
    respawnTimer: 0,
    flash: 0,
    shake: 0,
    particles: [],
    trail: [],
    statusMessage: "Ready",
  };

  const input = {
    hold: false,
  };

  const config = {
    gravity: options.gravity || 1,
    hue: level.color || "#59e8ff",
    speed: level.speed,
    afterFinish: options.onFinish,
    onDeath: options.onDeath,
    onStatus: options.onStatus,
  };

  const resizeCanvas = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = height / BASE_HEIGHT;
  };

  const triggerDeath = () => {
    if (!state.alive) return;
    state.alive = false;
    state.respawnTimer = 0.22;
    state.flash = 0.75;
    state.shake = 12;
    state.statusMessage = "Crash! Restarting...";
    config.onDeath?.();
  };

  const initRun = () => {
    state.alive = true;
    state.worldX = 0;
    state.cameraX = 0;
    state.player.y = BASE_HEIGHT * 0.5;
    state.player.vy = 0;
    state.time = 0;
    state.flash = 0;
    state.shake = 0;
    state.particles = [];
    state.trail = [];
    state.statusMessage = "Go!";
    config.onStatus?.({ status: "playing", distance: 0 });
  };

  const getPlayerRect = () => ({
    x: PLAYER_OFFSET_X,
    y: state.player.y,
    w: PLAYER_SIZE,
    h: PLAYER_SIZE,
  });

  const checkCollisions = () => {
    const player = getPlayerRect();
    if (player.y <= MIN_Y || player.y + player.h >= MAX_Y + PLAYER_SIZE * 0.5) {
      return true;
    }

    for (const obstacle of level.obstacles) {
      const target = getObstaclePosition(obstacle, state.time);
      const rect = { x: target.x, y: target.y, w: target.w, h: target.h };
      if (rectIntersect(player, rect)) {
        return true;
      }
    }
    return false;
  };

  const updateParticles = (dt) => {
    const hue = config.hue;
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      return particle.life > 0;
    });
    if (state.particles.length < PARTICLE_COUNT && state.alive && input.hold) {
      state.particles.push(createParticle(PLAYER_OFFSET_X - 12, state.player.y + PLAYER_SIZE * 0.5, hue));
    }
  };

  const updateTrail = () => {
    state.trail.unshift({ x: PLAYER_OFFSET_X, y: state.player.y + PLAYER_SIZE * 0.5, alpha: 1 });
    if (state.trail.length > 18) {
      state.trail.pop();
    }
    state.trail = state.trail.map((point, index) => ({ ...point, alpha: 1 - index / 18 }));
  };

  const drawBackground = () => {
    ctx.fillStyle = "#050913";
    ctx.fillRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(8, 36, 60, 0.35)");
    gradient.addColorStop(1, "rgba(2, 7, 19, 0.98)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawParallaxGrid = () => {
    const base = state.time * 80;
    ctx.save();
    ctx.strokeStyle = "rgba(48, 110, 170, 0.18)";
    ctx.lineWidth = 1;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 16; i += 1) {
      const alpha = 0.06 + i * 0.02;
      ctx.strokeStyle = `rgba(44, 138, 255, ${alpha})`;
      const offset = (base * (i + 1) * 0.12) % (width * 2);
      const spacing = 90 + i * 10;
      for (let x = -width + (offset % spacing); x <= width * 2; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (offset % spacing) - spacing; y <= height + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  const drawObstacles = () => {
    for (const obstacle of level.obstacles) {
      const target = getObstaclePosition(obstacle, state.time);
      const x = (target.x - state.cameraX) * scale;
      const y = target.y * scale;
      const w = target.w * scale;
      const h = target.h * scale;
      if (x + w < -100 || x > width + 100) continue;
      const neon = `hsla(${Math.round(200 + (state.time * 20) % 120)}, 100%, 70%, 0.9)`;
      ctx.save();
      ctx.shadowColor = neon;
      ctx.shadowBlur = 24;
      if (obstacle.type === "spikeDown" || obstacle.type === "spikeUp") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        const spikeCount = 5;
        ctx.beginPath();
        if (obstacle.type === "spikeDown") {
          ctx.moveTo(x, y + h);
          for (let i = 0; i <= spikeCount; i += 1) {
            const px = x + (w / spikeCount) * i;
            const py = y + h - (i % 2 === 0 ? h * 0.3 : 0);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(x + w, y + h);
        } else {
          ctx.moveTo(x, y);
          for (let i = 0; i <= spikeCount; i += 1) {
            const px = x + (w / spikeCount) * i;
            const py = y + (i % 2 === 0 ? h * 0.3 : 0);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(x + w, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = neon;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        const fill = ctx.createLinearGradient(x, y, x + w, y + h);
        fill.addColorStop(0, "rgba(255,255,255,0.14)");
        fill.addColorStop(1, "rgba(63, 210, 255, 0.18)");
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = neon;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
    }
  };

  const drawPlayerTrail = () => {
    for (let i = state.trail.length - 1; i >= 0; i -= 1) {
      const dot = state.trail[i];
      ctx.fillStyle = `rgba(122, 255, 255, ${dot.alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(dot.x * scale, dot.y * scale, (6 + i * 0.2) * (1 - dot.alpha * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawParticles = () => {
    for (const particle of state.particles) {
      const alpha = particle.life / PARTICLE_LIFE;
      ctx.fillStyle = `hsla(190, 100%, 80%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x * scale, particle.y * scale, particle.size * alpha * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPlayer = () => {
    const playerScreenX = PLAYER_OFFSET_X * scale;
    const playerScreenY = state.player.y * scale;
    const size = PLAYER_SIZE * scale;
    ctx.save();
    ctx.translate(playerScreenX + size / 2, playerScreenY + size / 2);
    const rotation = Math.sin(state.time * 6) * 0.08 + (state.player.vy / MAX_VY) * 0.15;
    ctx.rotate(rotation);
    ctx.translate(-size / 2, -size / 2);
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#7df0ff");
    gradient.addColorStop(1, "#f6b4ff");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(133, 255, 255, 0.85)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size, size * 0.4);
    ctx.lineTo(size * 0.7, size);
    ctx.lineTo(size * 0.3, size);
    ctx.lineTo(0, size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawGoal = () => {
    const finishX = (level.length - state.cameraX) * scale;
    if (finishX < -200 || finishX > width + 200) return;
    const lineTop = 80 * scale;
    const lineBottom = (BASE_HEIGHT - 80) * scale;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(finishX, lineTop);
    ctx.lineTo(finishX, lineBottom);
    ctx.stroke();
    ctx.fillStyle = "rgba(58, 255, 221, 0.14)";
    ctx.fillRect(finishX - 8, lineTop, 16, lineBottom - lineTop);
    ctx.restore();
  };

  const drawHUD = () => {
    const progress = Math.min(100, Math.round((state.worldX / level.length) * 100));
    const title = level.name;
    ctx.save();
    ctx.fillStyle = "rgba(4, 17, 42, 0.7)";
    ctx.fillRect(16, 16, 320, 88);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "600 18px Inter, system-ui, sans-serif";
    ctx.fillText(`Geo Dashers — ${title}`, 32, 40);
    ctx.font = "500 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 255, 0.9)";
    ctx.fillText(`Progress: ${progress}%`, 32, 64);
    ctx.fillText(`Speed: ${Math.round(config.speed)} u/s`, 32, 82);
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.fillText(state.statusMessage, 32, 104);

    const barWidth = Math.max(160, 200);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(32, 112, barWidth, 10);
    ctx.fillStyle = "rgba(71, 228, 255, 0.92)";
    ctx.fillRect(32, 112, (barWidth * progress) / 100, 10);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.strokeRect(32, 112, barWidth, 10);
    ctx.restore();
  };

  const draw = () => {
    ctx.save();
    const shakeX = (Math.random() - 0.5) * state.shake;
    const shakeY = (Math.random() - 0.5) * state.shake;
    ctx.translate(shakeX, shakeY);
    drawBackground();
    drawParallaxGrid();
    drawGoal();
    drawObstacles();
    drawParticles();
    drawPlayerTrail();
    drawPlayer();
    drawHUD();
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 100, 150, ${state.flash})`;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  };

  const loop = (timestamp) => {
    if (!running) return;
    const dt = clamp((timestamp - lastTime) / 1000, 0, 0.04);
    lastTime = timestamp;
    if (state.respawnTimer > 0) {
      state.respawnTimer -= dt;
      state.flash = Math.max(0, state.flash - dt * 2.5);
      state.shake = Math.max(0, state.shake - dt * 22);
      if (state.respawnTimer <= 0) {
        initRun();
      }
      draw();
    } else if (state.alive) {
      state.time += dt;
      const force = input.hold ? -THRUST * config.gravity : GRAVITY * config.gravity;
      state.player.vy += force * dt;
      state.player.vy = clamp(state.player.vy, -MAX_VY, MAX_VY);
      state.player.y += state.player.vy * dt;
      const floorY = BASE_HEIGHT - PLAYER_SIZE - 40;
      if (state.player.y < MIN_Y) {
        state.player.y = MIN_Y;
        state.player.vy = 0;
      }
      if (state.player.y > floorY) {
        state.player.y = floorY;
        state.player.vy = 0;
      }
      state.worldX += config.speed * dt;
      const targetCamera = Math.max(0, state.worldX - PLAYER_OFFSET_X);
      state.cameraX += (targetCamera - state.cameraX) * 0.14;
      if (state.worldX >= level.length) {
        state.worldX = level.length;
        state.alive = false;
        state.statusMessage = "Level complete!";
        config.afterFinish?.();
      } else if (checkCollisions()) {
        triggerDeath();
      }
      updateParticles(dt);
      updateTrail();
      state.flash = Math.max(0, state.flash - dt * 3);
      state.shake = Math.max(0, state.shake - dt * 16);
      draw();
    } else {
      state.flash = Math.max(0, state.flash - dt * 3);
      state.shake = Math.max(0, state.shake - dt * 16);
      draw();
    }
    rafId = window.requestAnimationFrame(loop);
  };

  const resizeHandler = () => {
    resizeCanvas();
  };

  const destroy = () => {
    running = false;
    window.cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resizeHandler);
  };

  const setHold = (value) => {
    input.hold = value;
  };

  resizeCanvas();
  window.addEventListener("resize", resizeHandler);
  initRun();
  rafId = window.requestAnimationFrame((ts) => {
    lastTime = ts;
    loop(ts);
  });

  return {
    destroy,
    setHold,
    resize: resizeCanvas,
  };
}
