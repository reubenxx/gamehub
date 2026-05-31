import Phaser from 'phaser';
import { physicsConfig } from './physicsConfig';
import { createDebugOverlay } from './debugOverlay';

// ============================================
// AABB Collision Helper
// ============================================
function aabbIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ============================================
// Player State Machine
// ============================================
class Player {
  constructor(config) {
    this.config = config;
    this.x = config.player.startX;
    this.y = config.player.startY;
    this.vx = config.velocityTracks.baseline.unitsPerTick;
    this.vy = 0;
    this.gravitySign = 1; // 1 = down, -1 = up
    this.alive = true;
    this.grounded = false;
    this.mode = 'cube'; // default mechanic
    this.input = { holding: false, justPressed: false, justReleased: false };
    this.modeState = {};
  }

  updateInput(holding) {
    const prev = this.input.holding;
    this.input.holding = holding;
    this.input.justPressed = holding && !prev;
    this.input.justReleased = !holding && prev;
  }

  step(dt) {
    const cfg = this.config;
    const g = cfg.gravity.standard * this.gravitySign;

    // Horizontal: constant velocity (auto-move)
    // vx is always the same throughout the run

    // Vertical: mode-specific behavior
    switch (this.mode) {
      case 'cube':
        if (this.input.justPressed && this.grounded) {
          this.vy = -cfg.jumps.standard;
          this.grounded = false;
        }
        this.vy += g * dt;
        break;

      case 'robot':
        if (this.input.justPressed && this.grounded) {
          this.vy = -cfg.jumps.standard;
          this.grounded = false;
          this.modeState.holdFrames = 0;
        }
        if (this.input.holding && this.grounded) {
          this.modeState.holdFrames = (this.modeState.holdFrames || 0) + 1;
          if (this.modeState.holdFrames <= cfg.mechanics.robot.maxHoldFrames && this.vy === 0) {
            this.vy = -cfg.jumps.standard * (1 + (this.modeState.holdFrames / cfg.mechanics.robot.maxHoldFrames) * 0.5);
            this.grounded = false;
          }
        }
        this.vy += g * dt;
        break;

      case 'ship':
        if (this.input.holding) {
          this.vy += -cfg.jumps.continuousAscend * dt;
        } else {
          this.vy += cfg.gravity.standard * dt;
        }
        break;

      case 'ball':
        // Binary flip: tap to invert gravity
        if (this.input.justPressed) {
          this.gravitySign *= -1;
        }
        this.vy += g * dt;
        break;

      case 'spider':
        // Binary flip + instant teleport
        if (this.input.justPressed) {
          this.gravitySign *= -1;
          // Teleport will be handled after collision check
          this.modeState.teleportPending = true;
        }
        this.vy += g * dt;
        break;

      case 'ufo':
        // Every tap resets velocity to upward impulse
        if (this.input.justPressed) {
          this.vy = -cfg.jumps.fixedAltitude;
        } else {
          this.vy += g * dt;
        }
        break;

      case 'wave':
        // 45° angles: hold=up, release=down
        const angle45 = 45 * (Math.PI / 180);
        if (this.input.holding) {
          this.vy += -cfg.mechanics.wave.linearSpeed * Math.sin(angle45) * dt;
        } else {
          this.vy += cfg.mechanics.wave.linearSpeed * Math.sin(angle45) * dt;
        }
        break;

      case 'swing':
        // Mid-air gravity toggle
        if (this.input.justPressed && !this.grounded) {
          this.gravitySign *= -1;
          this.modeState.lastToggle = Date.now();
        }
        this.vy += g * dt;
        break;

      default:
        this.vy += g * dt;
    }

    // Clamp fall speed
    const maxFall = Math.abs(cfg.gravity.terminalVelocity);
    if (this.vy > maxFall) this.vy = maxFall;
    if (this.vy < -maxFall) this.vy = -maxFall;

    // Integrate position
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  getHitbox() {
    const hw = this.config.collision.playerHitbox.width / 2;
    const hh = this.config.collision.playerHitbox.height / 2;
    return { x: this.x - hw, y: this.y - hh, w: this.config.collision.playerHitbox.width, h: this.config.collision.playerHitbox.height };
  }
}

// ============================================
// Scripting & Trigger System
// ============================================
class ScriptTrigger {
  constructor(id, type, params) {
    this.id = id;
    this.type = type; // "move", "rotate", "animate", "scale", "count", "collision", "conditional", "camera"
    this.params = params;
    this.active = true;
  }

  execute(gameState, groupObjects) {
    if (!this.active) return;

    switch (this.type) {
      case 'move':
        const target = groupObjects[this.params.groupID];
        if (target) {
          // Animate position over time using easing
          target.moveX = this.params.targetX;
          target.moveY = this.params.targetY;
          target.moveTime = this.params.time || 1;
          target.moveElapsed = 0;
          target.moveEasing = this.params.easing || 'Linear';
        }
        break;
      // More trigger types can be added here
    }
  }
}

// ============================================
// Phaser Scene
// ============================================
class DeterministicPhysicsScene extends Phaser.Scene {
  constructor(key, level, options = {}) {
    super({ key });
    this.level = level;
    this.opts = options;
  }

  init() {
    this.config = { ...physicsConfig, ...(this.opts.config || {}) };
    this.player = new Player(this.config);
    this.player.mode = this.opts.mechanic || 'cube';
    this.accumulator = 0;
  }

  create() {
    // Graphics
    this.worldGraphics = this.add.graphics({ x: 0, y: 0 });

    // Input handling
    this.input.addPointer(1);
    this.input.on('pointerdown', () => this.player.updateInput(true));
    this.input.on('pointerup', () => this.player.updateInput(false));
    this.input.keyboard?.on('keydown-SPACE', () => this.player.updateInput(true));
    this.input.keyboard?.on('keyup-SPACE', () => this.player.updateInput(false));

    // Build obstacles from level
    this.obstacles = (this.level.obstacles || []).map((o) => ({
      id: o.id || Math.random(),
      x: o.x,
      y: o.y,
      w: o.w || this.config.blockSize,
      h: o.h || this.config.blockSize,
      type: o.type || 'solid', // "solid", "hazard", "spike"
      meta: o,
    }));

    // World bounds
    this.worldBounds = {
      top: 0,
      bottom: this.config.viewportHeight,
      left: 0,
      right: 10000, // extend for scrolling levels
    };

    // Debug overlay
    if (this.config.debug.showOverlay) {
      this.debugOverlay = createDebugOverlay(this.game.canvas.parentElement || document.body);
    }

    // Fixed-step accumulator
    this.accumulator = 0;
    this.lastTime = this.time.now;

    // Scripting
    this.triggers = [];
    this.groupObjects = {};
  }

  step(dt) {
    // Physics step
    this.player.step(dt);

    // World bounds collision
    const topBound = this.config.collision.playerHitbox.height / 2;
    const bottomBound = this.config.viewportHeight - this.config.collision.playerHitbox.height / 2;

    if (this.player.y < topBound) {
      this.player.y = topBound;
      this.player.vy = 0;
    }

    if (this.player.y > bottomBound) {
      this.player.y = bottomBound;
      this.player.vy = 0;
      this.player.grounded = true;
    } else {
      this.player.grounded = false;
    }

    // Obstacle collision detection
    const playerBox = this.player.getHitbox();
    for (const obstacle of this.obstacles) {
      if (aabbIntersect(playerBox, obstacle)) {
        if (obstacle.type === 'solid') {
          this.player.alive = false;
        } else if (obstacle.type === 'hazard' || obstacle.type === 'spike') {
          // Hazard with padding
          const padded = { x: obstacle.x + this.config.collision.hazardPadding, y: obstacle.y + this.config.collision.hazardPadding, w: obstacle.w - this.config.collision.hazardPadding * 2, h: obstacle.h - this.config.collision.hazardPadding * 2 };
          if (aabbIntersect(playerBox, padded)) {
            this.player.alive = false;
          }
        }
      }
    }
  }

  update(time, delta) {
    // Fixed-step deterministic loop
    const dtSeconds = Math.min(delta / 1000, 0.05); // cap at 50ms for stability
    this.accumulator += dtSeconds;

    const fixedDt = this.config.fixedTimeStep;
    let steps = 0;
    while (this.accumulator >= fixedDt && steps < 10) {
      this.step(fixedDt);
      this.accumulator -= fixedDt;
      steps++;
    }

    // Render
    this.worldGraphics.clear();
    this.worldGraphics.fillStyle(0x050913, 1);
    this.worldGraphics.fillRect(0, 0, this.scale.width, this.scale.height);

    // Camera position (follow player, keep at left side of viewport)
    const camX = Math.max(0, this.player.x - this.config.viewportWidth * 0.25);
    const camY = this.player.y - this.config.viewportHeight * 0.5;

    // Draw obstacles
    for (const ob of this.obstacles) {
      const sx = ((ob.x - camX) / this.config.viewportWidth) * this.scale.width;
      const sy = ((ob.y - camY) / this.config.viewportHeight) * this.scale.height;
      const sw = (ob.w / this.config.viewportWidth) * this.scale.width;
      const sh = (ob.h / this.config.viewportHeight) * this.scale.height;

      if (sx + sw > 0 && sx < this.scale.width && sy + sh > 0 && sy < this.scale.height) {
        if (ob.type === 'solid') {
          this.worldGraphics.fillStyle(0x3dd3ff, 0.15);
          this.worldGraphics.fillRect(sx, sy, sw, sh);
          this.worldGraphics.lineStyle(2, 0x56eeff, 0.7);
        } else {
          this.worldGraphics.fillStyle(0xff6b9d, 0.18);
          this.worldGraphics.fillRect(sx, sy, sw, sh);
          this.worldGraphics.lineStyle(2, 0xff8fab, 0.6);
        }
        this.worldGraphics.strokeRect(sx, sy, sw, sh);
      }
    }

    // Draw player (centered)
    const px = (this.scale.width / 2);
    const py = ((this.player.y - camY) / this.config.viewportHeight) * this.scale.height;
    const pw = (this.config.collision.playerHitbox.width / this.config.viewportWidth) * this.scale.width;
    const ph = (this.config.collision.playerHitbox.height / this.config.viewportHeight) * this.scale.height;

    this.worldGraphics.fillStyle(0x7df0ff, 1);
    // Draw as triangle (pointing right for directional feedback)
    const pts = [
      [px, py - ph / 2],
      [px + pw / 2, py + ph / 2],
      [px - pw / 2, py + ph / 2],
    ];
    this.worldGraphics.fillTriangleShape(pts);

    // Debug info
    if (this.debugOverlay) {
      this.debugOverlay.update(
        {
          x: this.player.x.toFixed(1),
          y: this.player.y.toFixed(1),
          vx: this.player.vx.toFixed(2),
          vy: this.player.vy.toFixed(2),
          grounded: this.player.grounded,
          alive: this.player.alive,
          mode: this.player.mode,
          gravitySign: this.player.gravitySign,
        },
        { camX, camY, obstacles: this.obstacles.length }
      );
    }

    // Reset input flags
    this.player.input.justPressed = false;
    this.player.input.justReleased = false;

    // Instant restart on death
    if (!this.player.alive) {
      setTimeout(() => this.scene.restart({ level: this.level, options: this.opts }), 300);
    }
  }
}

// ============================================
// Phaser Game Factory
// ============================================
export function createPhaserGeoDashers(parentElement, level, options = {}) {
  const sceneKey = 'PhysicsScene_' + Date.now();
  const scene = new DeterministicPhysicsScene(sceneKey, level, options);

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: parentElement,
    width: '100%',
    height: '100%',
    scene: scene,
    banner: false,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { pixelArt: false, antialias: true, backgroundColor: '#050913' },
  });

  return {
    game,
    scene,
    destroy() {
      try {
        game.destroy(true);
      } catch (e) {
        console.error('Error destroying game:', e);
      }
    },
  };
}
