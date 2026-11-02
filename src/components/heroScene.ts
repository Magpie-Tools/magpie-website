/*
 * Hero backdrop: a dithered pixel-art dusk over the hills, in the
 * magpie-frontend green scale. Telegraph wires carry small packets of light,
 * magpies perch on them, and a click scatters the birds.
 *
 * The scene renders into a buffer of palette indices (one per art pixel). It
 * has no DOM dependencies; HeroScene.tsx paints the buffer onto a canvas.
 */

/** Dark-to-light ramp: a deep shade, the --p-950…--p-50 scale, then cream. */
export const PALETTE = [
  '#0b1d18',
  '#12302a',
  '#183e31',
  '#205241',
  '#27634d',
  '#2e755a',
  '#348566',
  '#4a9d83',
  '#61b399',
  '#8cc8b5',
  '#b8ddd1',
  '#e3f2ec',
  '#f9f3f0',
];

const TOP = PALETTE.length - 1;
/** --p-900, the background of the section below the hero. */
const BOTTOM_LEVEL = 2;
const FADE_ROWS = 16;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);

/* ----------------------------------------------------------------- sprites */

interface Sprite {
  w: number;
  h: number;
  /** Sprite pixel that sits on the bird's position. */
  ax: number;
  ay: number;
  px: Int8Array;
}

const INK: Record<string, number> = { k: 0, d: 1, g: 5, w: TOP, s: 10 };

function sprite(rows: string[], ax: number, ay: number): Sprite {
  const h = rows.length;
  const w = Math.max(...rows.map((row) => row.length));
  const px = new Int8Array(w * h).fill(-1);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const level = INK[row[x]!];
      if (level !== undefined) px[y * w + x] = level;
    }
  });
  return { w, h, ax, ay, px };
}

/* Facing right: black head and chest, white belly and shoulder patch, a dark
 * green-glossed wing and a long tail. The anchor is where the feet grip. */
export const PERCHED = sprite(
  [
    '..........kk..',
    '.........kkkk.',
    '.........kkkkk',
    '.........kkk..',
    '.......wwkkk..',
    '.....dwwwkkk..',
    '...dgddwwwwk..',
    '.dgdd..wwwk...',
    'dd......k.k...',
    'd.............',
  ],
  9,
  8
);

export const FLYING = [
  sprite(
    [
      '.......ww.......',
      '......wwd.......',
      '......wdd.......',
      '.......dd.....kk',
      'ddgddkkkwwkkkkkk',
      '.......kwwwkk...',
    ],
    8,
    4
  ),
  sprite(
    [
      'ddgddkkkwwkkkkkk',
      '.......kwwwkk...',
      '.......dd.......',
      '......wdd.......',
      '......ww........',
    ],
    8,
    0
  ),
];

/* ------------------------------------------------------------------ random */

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const smoothstep = (edge0: number, edge1: number, value: number) =>
  smooth(clamp((value - edge0) / (edge1 - edge0), 0, 1));

function noise1(x: number, seed: number) {
  const i = Math.floor(x);
  const f = smooth(x - i);
  return hash(i, 0, seed) * (1 - f) + hash(i + 1, 0, seed) * f;
}

/** Value noise that repeats every `period` lattice cells along x. */
function noise2(x: number, y: number, period: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const x0 = ((ix % period) + period) % period;
  const x1 = (x0 + 1) % period;
  const top = hash(x0, iy, seed) * (1 - fx) + hash(x1, iy, seed) * fx;
  const bottom = hash(x0, iy + 1, seed) * (1 - fx) + hash(x1, iy + 1, seed) * fx;
  return top * (1 - fy) + bottom * fy;
}

/* ------------------------------------------------------------------- scene */

interface Star {
  i: number;
  level: number;
  phase: number;
  rate: number;
  /** Behind or next to the hero copy, where it would hurt legibility. */
  hidden: boolean;
}

/** A rectangle in art pixels. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Slot {
  x: number;
  y: number;
  taken: boolean;
}

type BirdState = 'perched' | 'arriving' | 'leaving' | 'passing';

interface Bird {
  state: BirdState;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  phase: number;
  slot: Slot | null;
  /** Seconds until a perched bird turns around. */
  turn: number;
  baseY: number;
}

interface Pulse {
  wire: number;
  pos: number;
  speed: number;
}

export interface Scene {
  width: number;
  height: number;
  /** Final palette index per pixel, refreshed by renderScene. */
  idx: Uint8Array;
  base: Float32Array;
  cloudTex: Float32Array;
  cloudGain: Float32Array;
  cloudTop: number;
  cloudRows: number;
  overlayAt: Int32Array;
  overlayLevel: Uint8Array;
  stars: Star[];
  wires: Int16Array[];
  slots: Slot[];
  birds: Bird[];
  pulses: Pulse[];
  birdTarget: number;
  flyBand: [number, number];
  time: number;
  cloudShift: number;
  nextPulse: number;
  nextPass: number;
  nextArrival: number;
  random: () => number;
}

export function createScene(width: number, height: number, seed = 7): Scene {
  const random = mulberry32(seed);
  const size = width * height;
  const horizon = height - 50;
  const compact = width < 200;
  const moonX = Math.round(width * (compact ? 0.78 : 0.8));
  const moonY = horizon - 26;
  const moonR = compact ? 5 : 6;

  /* Terrain profiles: the top row of each layer per column. */
  const farTop = new Int16Array(width);
  const midTop = new Int16Array(width);
  const frontTop = new Int16Array(width);
  for (let x = 0; x < width; x += 1) {
    farTop[x] = Math.round(horizon - 3 - 10 * noise1(x / 46, seed + 1) - 4 * noise1(x / 13, seed + 2));
    midTop[x] = Math.round(height - 40 - 6 * noise1(x / 70, seed + 3) - 3 * noise1(x / 21, seed + 4));
    frontTop[x] = Math.round(height - 22 - 3 * noise1(x / 52, seed + 5));
  }

  /* Static shading. */
  const base = new Float32Array(size);
  const skyMask = new Uint8Array(size);
  for (let y = 0; y < height; y += 1) {
    const t = clamp(y / horizon, 0, 1);
    const sky = 0.9 + 3.5 * Math.pow(t, 2);
    const nearHorizon = Math.exp(-Math.max(0, horizon - y) / 12);
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const toMoon = Math.abs(x - moonX);
      let value: number;

      if (y >= frontTop[x]!) {
        value = 1.45 + 0.3 * (noise1(x / 3 + y * 7.3, seed + 6) - 0.5);
      } else if (y >= midTop[x]!) {
        value = 2.3 + 0.5 * Math.exp(-toMoon / (width * 0.12));
        if (y === midTop[x]) value += 0.35;
      } else if (y >= farTop[x]!) {
        value = 2.6 + 1.2 * Math.exp(-toMoon / (width * 0.14));
        if (y === farTop[x]) value += 0.6;
      } else {
        const distance = Math.hypot(x - moonX, (y - moonY) * 1.15);
        const glow = 2.4 * Math.exp(-distance / 30) + 1.7 * Math.exp(-distance / 9);
        const haze = 2.1 * Math.exp(-toMoon / (width * 0.18)) * nearHorizon;
        value = sky + glow + haze;
        if (distance <= moonR) {
          const crater = (x - moonX + 2) ** 2 + (y - moonY + 1) ** 2 <= 2 || (x - moonX - 2) ** 2 + (y - moonY - 2) ** 2 <= 1;
          value = crater ? TOP - 0.6 : TOP;
        }
        skyMask[i] = 1;
      }

      const fade = smoothstep(height - FADE_ROWS, height - 3, y);
      base[i] = value + (BOTTOM_LEVEL - value) * fade;
    }
  }

  /* Pines along the middle ridge, grass tufts on the near meadow. */
  const plant = (x: number, y: number, level: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = y * width + x;
    base[i] = level;
    skyMask[i] = 0;
  };
  for (let x = 2; x < width - 2; x += 2 + Math.floor(random() * 7)) {
    if (random() < 0.45) continue;
    const tall = 3 + Math.floor(random() * 6);
    const foot = midTop[x]! + 1;
    for (let row = 0; row < tall; row += 1) {
      const half = Math.floor((row * 0.5) * (row > tall - 2 ? 1 : 0.8));
      for (let dx = -half; dx <= half; dx += 1) plant(x + dx, foot - tall + row, 1.85);
    }
  }
  for (let x = 0; x < width; x += 1) {
    if (random() < 0.35) {
      const blades = 1 + Math.floor(random() * 3);
      for (let dy = 1; dy <= blades; dy += 1) plant(x, frontTop[x]! - dy, 1.45);
    }
  }

  /* Clouds: horizontal wisps, densest toward the moon and lit by it. */
  const cloudTop = Math.max(0, moonY - 54);
  const cloudRows = Math.max(1, horizon - 6 - cloudTop);
  const cloudTex = new Float32Array(width * cloudRows);
  const cloudGain = new Float32Array(width * cloudRows);
  const p1 = Math.max(2, Math.round(width / 70));
  for (let row = 0; row < cloudRows; row += 1) {
    const y = cloudTop + row;
    const band = smoothstep(cloudTop, cloudTop + 18, y) * (1 - smoothstep(horizon - 22, horizon - 6, y));
    for (let x = 0; x < width; x += 1) {
      const u = (x / width) * p1;
      const n =
        0.55 * noise2(u, y / 5, p1, seed + 10) +
        0.3 * noise2(u * 2, y / 2.5, p1 * 2, seed + 11) +
        0.15 * noise2(u * 4, y / 1.4, p1 * 4, seed + 12);
      cloudTex[row * width + x] = smoothstep(0.54, 0.8, n);

      const i = y * width + x;
      if (!skyMask[i]) continue;
      const distance = Math.hypot(x - moonX, y - moonY);
      const side = 0.15 + 0.85 * smoothstep(width * 0.25, width * 0.7, x);
      cloudGain[row * width + x] = band * side * (1.1 + 3.2 * Math.exp(-distance / 38));
    }
  }

  /* Stars in the dark upper sky. */
  const stars: Star[] = [];
  const starCount = Math.round((width * horizon) / 650);
  for (let n = 0; n < starCount; n += 1) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * (moonY - 8));
    const i = y * width + x;
    if (!skyMask[i] || base[i]! > 2.6 || Math.hypot(x - moonX, y - moonY) < 28) continue;
    stars.push({ i, level: 6 + Math.floor(random() * 4), phase: random() * Math.PI * 2, rate: 0.6 + random() * 2.2, hidden: false });
  }

  /* Telegraph line receding from the near right toward the far left. */
  const overlay = new Map<number, number>();
  const ink = (x: number, y: number, level: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = y * width + x;
    const current = overlay.get(i);
    if (current === undefined || level < current) overlay.set(i, level);
  };

  const nearX = width * (compact ? 0.9 : 0.93);
  const farX = width * 0.04;
  const poleHeight = compact ? 46 : 52;
  interface Pole {
    x: number;
    top: number;
    depth: number;
    arm: number;
  }
  const poles: Pole[] = [];
  for (let k = -1; ; k += 1) {
    const depth = 1 / (1 + 0.55 * k);
    if (depth < 0.16) break;
    const x = Math.round(farX + (nearX - farX) * depth);
    let foot = Math.round(height - 44 + 27 * Math.pow(depth, 1.3));
    if (x >= 0 && x < width) foot = Math.max(foot, midTop[x]! + 2);
    const tall = Math.round(poleHeight * depth);
    poles.push({ x, top: foot - tall, depth, arm: Math.max(2, Math.round(8 * depth)) });

    if (k < 0) continue;
    const level = depth > 0.5 ? 0 : 1;
    const thick = depth > 0.6 ? 2 : 1;
    for (let y = foot - tall; y <= foot; y += 1) {
      for (let dx = 0; dx < thick; dx += 1) ink(x + dx, y, level);
    }
    const arms = [
      { y: foot - tall + Math.round(2 * depth), reach: Math.max(2, Math.round(8 * depth)) },
      { y: foot - tall + Math.round(7 * depth), reach: Math.max(1, Math.round(5 * depth)) },
    ];
    for (const arm of arms) {
      for (let dx = -arm.reach; dx <= arm.reach + thick - 1; dx += 1) ink(x + dx, arm.y, level);
    }
  }

  const wires: Int16Array[] = [];
  const attachments = (pole: Pole) => {
    const lower = pole.top + Math.round(7 * pole.depth);
    const upper = pole.top + Math.round(2 * pole.depth);
    const reachLow = Math.max(1, Math.round(5 * pole.depth));
    return [
      [pole.x - pole.arm, upper],
      [pole.x + reachLow, lower],
    ] as const;
  };
  for (let w = 0; w < 2; w += 1) {
    const points: number[] = [];
    for (let k = 0; k < poles.length - 1; k += 1) {
      const [x1, y1] = attachments(poles[k]!)[w]!;
      const [x2, y2] = attachments(poles[k + 1]!)[w]!;
      const span = Math.abs(x2 - x1);
      const sag = 1 + 0.07 * span;
      const steps = Math.ceil(span * 1.4 + Math.abs(y2 - y1) * 1.4) + 1;
      const level = poles[k + 1]!.depth > 0.4 ? 0 : 1;
      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        const x = Math.round(x1 + (x2 - x1) * t);
        const y = Math.round(y1 + (y2 - y1) * t + sag * 4 * t * (1 - t));
        const last = points.length;
        if (last && points[last - 2] === x && points[last - 1] === y) continue;
        points.push(x, y);
        ink(x, y, level);
      }
    }
    wires.push(Int16Array.from(points));
  }

  /* Perches on the near spans of the upper wires. */
  const slots: Slot[] = [];
  const minX = poles[3] ? poles[3].x + 4 : width * 0.3;
  const poleXs = poles.map((pole) => pole.x);
  for (const w of [0, 1]) {
    const points = wires[w]!;
    for (let p = 0; p < points.length; p += 2) {
      const x = points[p]!;
      const y = points[p + 1]!;
      if (x < minX || x > width - 8 || y < 14) continue;
      if (poleXs.some((poleX) => Math.abs(poleX - x) < 7)) continue;
      if (slots.some((slot) => Math.abs(slot.x - x) < 12 && Math.abs(slot.y - y) < 12)) continue;
      if (random() < 0.5) continue;
      slots.push({ x, y, taken: false });
    }
  }

  const scene: Scene = {
    width,
    height,
    idx: new Uint8Array(size),
    base,
    cloudTex,
    cloudGain,
    cloudTop,
    cloudRows,
    overlayAt: Int32Array.from(overlay.keys()),
    overlayLevel: Uint8Array.from(overlay.values()),
    stars,
    wires,
    slots,
    birds: [],
    pulses: [],
    birdTarget: clamp(Math.round(width / 55), 2, Math.min(9, slots.length)),
    flyBand: [Math.max(8, cloudTop + 6), Math.max(12, horizon - 30)],
    time: 0,
    cloudShift: random() * width,
    nextPulse: 0,
    nextPass: 3 + random() * 4,
    nextArrival: 2,
    random,
  };

  for (let n = 0; n < scene.birdTarget - 1; n += 1) {
    const slot = freeSlot(scene);
    if (!slot) break;
    slot.taken = true;
    scene.birds.push(perchedBird(scene, slot));
  }
  for (let n = 0; n < 4; n += 1) spawnPulse(scene, true);

  return scene;
}

function freeSlot(scene: Scene) {
  const free = scene.slots.filter((slot) => !slot.taken);
  return free.length ? free[Math.floor(scene.random() * free.length)]! : null;
}

function perchedBird(scene: Scene, slot: Slot): Bird {
  return {
    state: 'perched',
    x: slot.x,
    y: slot.y,
    vx: 0,
    vy: 0,
    facing: scene.random() < 0.5 ? 1 : -1,
    phase: scene.random() * 10,
    slot,
    turn: 2 + scene.random() * 8,
    baseY: slot.y,
  };
}

function spawnPulse(scene: Scene, anywhere = false) {
  const wire = Math.floor(scene.random() * scene.wires.length);
  const length = scene.wires[wire]!.length / 2;
  const forward = scene.random() < 0.5;
  const speed = (45 + scene.random() * 50) * (forward ? 1 : -1);
  const pos = anywhere ? scene.random() * length : forward ? 0 : length - 1;
  scene.pulses.push({ wire, pos, speed });
}

function spawnArrival(scene: Scene) {
  const slot = freeSlot(scene);
  if (!slot) return;
  slot.taken = true;
  const fromLeft = scene.random() < 0.35;
  const x = fromLeft ? -12 : scene.width + 12;
  const y = Math.max(6, slot.y - 30 - scene.random() * 40);
  scene.birds.push({
    state: 'arriving',
    x,
    y,
    vx: 0,
    vy: 0,
    facing: fromLeft ? 1 : -1,
    phase: scene.random() * 10,
    slot,
    turn: 0,
    baseY: y,
  });
}

function spawnPass(scene: Scene) {
  const fromLeft = scene.random() < 0.5;
  const [low, high] = scene.flyBand;
  const y = low + scene.random() * Math.max(1, high - low);
  const count = 1 + Math.floor(scene.random() * 3);
  for (let n = 0; n < count; n += 1) {
    const x = (fromLeft ? -14 : scene.width + 14) + (fromLeft ? -1 : 1) * n * (14 + scene.random() * 10);
    const birdY = y + (scene.random() - 0.5) * 10;
    scene.birds.push({
      state: 'passing',
      x,
      y: birdY,
      vx: (fromLeft ? 1 : -1) * (32 + scene.random() * 10),
      vy: 0,
      facing: fromLeft ? 1 : -1,
      phase: scene.random() * 10,
      slot: null,
      turn: 0,
      baseY: birdY,
    });
  }
}

/** Hide every star inside one of `rects` (the text on top of the scene). */
export function maskStars(scene: Scene, rects: Rect[]) {
  for (const star of scene.stars) {
    const x = star.i % scene.width;
    const y = Math.floor(star.i / scene.width);
    star.hidden = rects.some((rect) => x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h);
  }
}

/** Advance the simulation by `dt` seconds. */
export function stepScene(scene: Scene, dt: number) {
  const { random, width } = scene;
  scene.time += dt;
  scene.cloudShift = (scene.cloudShift + dt * 2.2) % width;

  scene.nextPulse -= dt;
  if (scene.nextPulse <= 0) {
    spawnPulse(scene);
    scene.nextPulse = 0.25 + random() * 0.7;
  }
  scene.pulses = scene.pulses.filter((pulse) => {
    pulse.pos += pulse.speed * dt;
    return pulse.pos >= 0 && pulse.pos < scene.wires[pulse.wire]!.length / 2;
  });

  scene.nextPass -= dt;
  if (scene.nextPass <= 0) {
    spawnPass(scene);
    scene.nextPass = 8 + random() * 10;
  }

  const settled = scene.birds.filter((bird) => bird.state === 'perched' || bird.state === 'arriving').length;
  scene.nextArrival -= dt;
  if (scene.nextArrival <= 0 && settled < scene.birdTarget) {
    spawnArrival(scene);
    scene.nextArrival = 1.5 + random() * 3;
  }

  scene.birds = scene.birds.filter((bird) => {
    switch (bird.state) {
      case 'perched':
        bird.turn -= dt;
        if (bird.turn <= 0) {
          bird.facing = bird.facing === 1 ? -1 : 1;
          bird.turn = 3 + random() * 9;
        }
        return true;
      case 'arriving': {
        const slot = bird.slot!;
        const dx = slot.x - bird.x;
        const dy = slot.y - bird.y;
        const distance = Math.hypot(dx, dy);
        const speed = Math.min(50, 12 + distance * 1.4);
        if (distance <= speed * dt + 0.5) {
          bird.state = 'perched';
          bird.x = slot.x;
          bird.y = slot.y;
          bird.turn = 2 + random() * 6;
          return true;
        }
        bird.x += (dx / distance) * speed * dt;
        bird.y += (dy / distance) * speed * dt;
        bird.facing = dx >= 0 ? 1 : -1;
        return true;
      }
      case 'leaving':
        bird.vy -= 34 * dt;
        bird.vx *= 1 + dt * 0.6;
        bird.x += bird.vx * dt;
        bird.y += bird.vy * dt;
        return bird.x > -20 && bird.x < width + 20 && bird.y > -20;
      case 'passing':
        bird.x += bird.vx * dt;
        bird.y = bird.baseY + Math.sin(scene.time * 2.6 + bird.phase) * 1.6;
        return bird.vx > 0 ? bird.x < width + 40 : bird.x > -40;
    }
  });
}

/** Scatter the birds near (x, y); with none nearby, fire a burst of packets. */
export function pokeScene(scene: Scene, x: number, y: number) {
  let scattered = 0;
  for (const bird of scene.birds) {
    if (bird.state !== 'perched' && bird.state !== 'arriving') continue;
    if (Math.hypot(bird.x - x, bird.y - y) > 36) continue;
    if (bird.slot) bird.slot.taken = false;
    bird.slot = null;
    bird.state = 'leaving';
    const away = bird.x === x ? (scene.random() < 0.5 ? -1 : 1) : Math.sign(bird.x - x);
    bird.vx = away * (26 + scene.random() * 22);
    bird.vy = -(18 + scene.random() * 22);
    bird.facing = away > 0 ? 1 : -1;
    scattered += 1;
  }
  if (scattered) {
    scene.nextArrival = 3 + scene.random() * 2;
  } else {
    for (let n = 0; n < 8; n += 1) spawnPulse(scene);
  }
}

function drawSprite(scene: Scene, art: Sprite, x: number, y: number, facing: 1 | -1) {
  const { width, height, idx } = scene;
  const left = Math.round(x) - (facing === 1 ? art.ax : art.w - 1 - art.ax);
  const top = Math.round(y) - art.ay;
  for (let row = 0; row < art.h; row += 1) {
    const py = top + row;
    if (py < 0 || py >= height) continue;
    for (let col = 0; col < art.w; col += 1) {
      const level = art.px[row * art.w + (facing === 1 ? col : art.w - 1 - col)]!;
      const px = left + col;
      if (level < 0 || px < 0 || px >= width) continue;
      idx[py * width + px] = level;
    }
  }
}

/** Rasterise the current state into `scene.idx`. */
export function renderScene(scene: Scene) {
  const { width, height, base, idx, cloudTex, cloudGain, cloudTop, cloudRows, time } = scene;
  const shift = Math.floor(scene.cloudShift);
  const cloudEnd = cloudTop + cloudRows;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    const bayerRow = (y & 3) * 4;
    const inClouds = y >= cloudTop && y < cloudEnd;
    const texRow = (y - cloudTop) * width;
    for (let x = 0; x < width; x += 1) {
      let value = base[row + x]!;
      if (inClouds) {
        const gain = cloudGain[texRow + x]!;
        if (gain > 0) value += gain * cloudTex[texRow + ((x + shift) % width)]!;
      }
      const level = Math.floor(value + BAYER[bayerRow + (x & 3)]!);
      idx[row + x] = level < 0 ? 0 : level > TOP ? TOP : level;
    }
  }

  for (const star of scene.stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * star.rate + star.phase);
    if (star.hidden || twinkle < 0.3) continue;
    if (idx[star.i]! > 3) continue;
    idx[star.i] = Math.min(TOP, star.level + (twinkle > 0.85 ? 2 : 0));
  }

  const { overlayAt, overlayLevel } = scene;
  for (let n = 0; n < overlayAt.length; n += 1) idx[overlayAt[n]!] = overlayLevel[n]!;

  const trail = [TOP, 10, 8, 6];
  for (const pulse of scene.pulses) {
    const points = scene.wires[pulse.wire]!;
    const head = Math.floor(pulse.pos);
    const back = pulse.speed > 0 ? -1 : 1;
    for (let n = trail.length - 1; n >= 0; n -= 1) {
      const p = head + back * n;
      if (p < 0 || p * 2 >= points.length) continue;
      const x = points[p * 2]!;
      const y = points[p * 2 + 1]!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      idx[y * width + x] = trail[n]!;
    }
  }

  for (const bird of scene.birds) {
    if (bird.state === 'perched') {
      drawSprite(scene, PERCHED, bird.x, bird.y - 1, bird.facing);
    } else {
      const frame = Math.floor((time + bird.phase) * (bird.state === 'leaving' ? 10 : 6)) % 2;
      drawSprite(scene, FLYING[frame]!, bird.x, bird.y, bird.facing);
    }
  }
}
