// Level data for RhythmRunner. Each level describes rhythm timing, obstacles, and metadata.
export const LEVELS = [
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    difficulty: 'Beginner',
    bpm: 100,
    speed: 260,
    length: 60, // seconds
    theme: 'neon',
    events: [
      // time (s), type, params
      [0.5, 'spike', { x: 700, y: 360 }],
      [1.2, 'gap', { width: 140 }],
      [2.0, 'jumpPad', { x: 900 }],
      [3.0, 'gap', { width: 180 }],
      [4.1, 'gravitySwitch', {}],
    ],
  },
  {
    id: 'velocity-core',
    name: 'Velocity Core',
    difficulty: 'Easy',
    bpm: 120,
    speed: 340,
    length: 80,
    theme: 'velocity',
    events: [
      [0.8, 'gap', { width: 160 }],
      [1.4, 'spike', { x: 620 }],
      [2.4, 'speedPortal', { multiplier: 1.35 }],
      [3.0, 'waveSection', {}],
    ],
  },
  {
    id: 'plasma-shift',
    name: 'Plasma Shift',
    difficulty: 'Medium',
    bpm: 140,
    speed: 420,
    length: 95,
    theme: 'plasma',
    events: [
      [1.0, 'jumpPad', {}],
      [2.2, 'movingHazard', { pattern: 'sine' }],
      [3.6, 'gravitySwitch', {}],
      [4.8, 'gap', { width: 220 }],
    ],
  },
  {
    id: 'inferno-grid',
    name: 'Inferno Grid',
    difficulty: 'Hard',
    bpm: 160,
    speed: 520,
    length: 110,
    theme: 'inferno',
    events: [
      [0.6, 'spike', {}],
      [1.8, 'gap', { width: 200 }],
      [2.7, 'movingHazard', { pattern: 'zigzag' }],
      [3.5, 'speedPortal', { multiplier: 1.6 }],
    ],
  },
  {
    id: 'hyper-drift',
    name: 'Hyper Drift',
    difficulty: 'Expert',
    bpm: 180,
    speed: 620,
    length: 130,
    theme: 'hyper',
    events: [
      [0.4, 'jumpPad', {}],
      [1.2, 'waveSection', {}],
      [1.9, 'gravitySwitch', {}],
      [2.7, 'gap', { width: 260 }],
    ],
  },
];

export default LEVELS;
