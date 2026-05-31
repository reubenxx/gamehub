/**
 * Spatial-Mathematical Framework Physics Configuration
 * 
 * Grid System:
 * - 1 block = 30 × 30 units
 * - Viewport = 600 × 405 units (20 × 13.5 blocks)
 * - Fixed Tick Rate: 240 TPS (4.166... ms per tick)
 * 
 * Object Model:
 * - Hitbox = 24 × 24 units (centered on entity)
 * - Standard Mass: normal gravity & velocity
 * - Mini Mass: 0.5× visual size, 2.0× gravity, higher initial velocity
 */

export const physicsConfig = {
  // Tick Rate Engine (240 TPS)
  ticksPerSecond: 240,
  fixedTimeStep: 1 / 240, // ~4.166 ms per tick

  // World & Viewport
  blockSize: 30, // units
  viewportWidth: 600, // units (20 blocks)
  viewportHeight: 405, // units (13.5 blocks)

  // Player hitbox (24 × 24 units)
  player: {
    hitboxWidth: 24,
    hitboxHeight: 24,
    startX: 300, // units (10 blocks from left)
    startY: 202.5, // units (middle)
  },

  // Horizontal Velocity Tracks (at 60Hz equivalent)
  // Actual per-tick = (target_units / frame) * (240 / 60)
  velocityTracks: {
    slow: {
      multiplier: 0.5,
      unitsPerFrame60Hz: 8.60,
      unitsPerTick: (8.60 * 240) / 60, // ~34.4 units per tick at 240 TPS
    },
    baseline: {
      multiplier: 1.0,
      unitsPerFrame60Hz: 10.38,
      unitsPerTick: (10.38 * 240) / 60, // ~41.52 units per tick
    },
    fast: {
      multiplier: 2.0,
      unitsPerFrame60Hz: 12.89,
      unitsPerTick: (12.89 * 240) / 60, // ~51.56 units per tick
    },
    veryFast: {
      multiplier: 3.0,
      unitsPerFrame60Hz: 15.60,
      unitsPerTick: (15.60 * 240) / 60, // ~62.4 units per tick
    },
    extremeFast: {
      multiplier: 4.0,
      unitsPerFrame60Hz: 19.20,
      unitsPerTick: (19.20 * 240) / 60, // ~76.8 units per tick
    },
  },

  // Gravity & Vertical Kinematics
  gravity: {
    standard: 0.6, // units per tick^2
    mini: 1.2, // mini displacement: 2.0× gravity
    terminalVelocity: -15.0, // units per tick (downward cap)
  },

  // Jump Impulses (units per tick)
  jumps: {
    standard: 12.0, // cube/robot instant impulse
    mini: 16.0, // mini displacement: higher initial velocity
    continuousAscend: 0.8, // ship: per-tick acceleration while holding
    fixedAltitude: 11.0, // ufo: reset vy on tap
  },

  // Game Mechanics Configuration
  mechanics: {
    cube: {
      name: "Instant Impulse (Cube)",
      description: "Tap for single jump impulse. Hold for automated sequence on ground.",
      jumpVelocity: 12.0,
      holdJumpMaxFrames: 10,
      gravityScale: 1.0,
    },
    robot: {
      name: "Instant Impulse (Robot)",
      description: "Same as Cube but with hold scaling (1-10 frames).",
      jumpVelocity: 12.0,
      holdJumpScaling: true,
      maxHoldFrames: 10,
      gravityScale: 1.0,
    },
    ship: {
      name: "Continuous Ascend (Ship)",
      description: "Hold for upward acceleration. Release for downward dive.",
      thrustAccel: 0.8, // units per tick^2 upward
      thrustDecel: -0.6, // units per tick^2 downward when released
      gravityScale: 0.8,
    },
    ball: {
      name: "Binary Flipping (Ball)",
      description: "Tap to invert gravity direction. Parabolic arc.",
      gravityScale: 1.0,
      miniScale: 0.5,
    },
    spider: {
      name: "Binary Flipping (Spider)",
      description: "Tap to flip gravity. Instantly teleport to nearest solid surface.",
      gravityScale: 1.0,
      instantTeleport: true,
    },
    ufo: {
      name: "Fixed Altitude Steps (UFO)",
      description: "Every tap resets velocity to preset upward impulse.",
      jumpVelocity: 10.0,
      ignoresMomentum: true,
      gravityScale: 1.0,
    },
    wave: {
      name: "Linear Angles (Wave)",
      description: "Hold for 45° upward. Release for 45° downward.",
      angleUpDegrees: 45,
      angleDownDegrees: 45,
      linearSpeed: 0.7, // units per tick per axis
      gravityScale: 0.0, // no gravity in this mode
    },
    swing: {
      name: "Alternating Axis (Swing)",
      description: "Mid-air taps toggle gravity. Creates sweeping loops.",
      gravityScale: 1.0,
      toggleCooldown: 0.1, // seconds
    },
  },

  // Collision
  collision: {
    playerHitbox: { width: 24, height: 24 }, // units
    blockSize: 30, // solid structural block
    hazardPadding: 5, // spike safety boundary (4-6 units)
    skinWidth: 0, // no sliding; hard stops
  },

  // Camera
  camera: {
    width: 600,
    height: 405,
    defaultZoom: 1.0,
    canLock: true,
    canPan: true,
    canZoom: true,
    canRotate: true,
  },

  // Visual Scripting
  scripting: {
    maxGroupID: 9999,
    easing: ["Linear", "Bounce", "Elastic", "Exponential"],
    triggers: ["Move", "Rotate", "Animate", "Scale", "Count", "Collision", "Conditional", "Camera"],
  },

  // Debug
  debug: {
    showOverlay: true,
    showHitboxes: true,
    showGridLines: false,
  },
};
