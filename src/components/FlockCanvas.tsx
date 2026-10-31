import { useEffect, useRef, type PointerEvent } from 'react';

/*
 * Hero illustration: proxies drift in from sources on the left, pass the
 * checker, and the live ones converge on a single rotating endpoint.
 * Click or tap to scrape a burst of new proxies.
 */

const ROW = 18;
const FONT = '400 12px "IBM Plex Mono", ui-monospace, monospace';
const LABEL_FONT = '400 12px "IBM Plex Mono", ui-monospace, monospace';
const SOURCE_GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ':'];
const ALIVE_RATIO = 0.62;
const MAX_PARTICLES = 420;

const COLOR = {
  dim: 'rgba(249, 243, 240, 0.34)',
  cream: '#f9f3f0',
  gate: 'rgba(141, 188, 170, 0.55)',
  gateHot: '#f9f3f0',
  label: '#b9d6ca',
  dead: '#f0a493',
  out: 'rgba(249, 243, 240, 0.85)',
  box: '#185641',
};

type Phase = 'source' | 'alive' | 'dead' | 'out';

interface Particle {
  x: number;
  y: number;
  y0: number;
  vx: number;
  vy: number;
  glyph: string;
  phase: Phase;
  alpha: number;
}

interface Scene {
  width: number;
  height: number;
  particles: Particle[];
  gateFlashes: Map<number, number>;
  endpointPulse: number;
  spawnDebt: number;
  checked: number;
  alive: number;
}

function layout(scene: Scene) {
  const { width, height } = scene;
  const compact = width < 640;
  return {
    top: 44,
    bottom: height - 40,
    gateX: Math.round(width * (compact ? 0.42 : 0.47)),
    endpointX: Math.round(width * (compact ? 0.76 : 0.8)),
    centerY: Math.round((44 + height - 40) / 2 / ROW) * ROW,
    edge: compact ? 20 : 48,
  };
}

function randomRow(scene: Scene) {
  const { top, bottom } = layout(scene);
  const rows = Math.max(1, Math.floor((bottom - top) / ROW));
  return top + Math.floor(Math.random() * rows) * ROW + ROW / 2;
}

function spawn(scene: Scene, x: number, y: number) {
  if (scene.particles.length >= MAX_PARTICLES) return;
  scene.particles.push({
    x,
    y,
    y0: y,
    vx: 48 + Math.random() * 60,
    vy: 0,
    glyph: SOURCE_GLYPHS[Math.floor(Math.random() * SOURCE_GLYPHS.length)]!,
    phase: 'source',
    alpha: 1,
  });
}

function burst(scene: Scene, x: number, y: number) {
  const { gateX, top, bottom } = layout(scene);
  const originX = Math.min(x, gateX - 24);
  for (let index = 0; index < 28; index += 1) {
    const rowY = Math.round((y + (Math.random() - 0.5) * 120 - ROW / 2) / ROW) * ROW + ROW / 2;
    spawn(
      scene,
      originX - Math.random() * 80,
      Math.min(bottom - ROW / 2, Math.max(top + ROW / 2, rowY))
    );
  }
}

function step(scene: Scene, dt: number) {
  const { gateX, endpointX, centerY } = layout(scene);
  const { width } = scene;
  const rate = Math.max(9, width / 70);

  scene.spawnDebt += dt * rate;
  while (scene.spawnDebt >= 1) {
    scene.spawnDebt -= 1;
    spawn(scene, -8 - Math.random() * 24, randomRow(scene));
  }

  for (const [row, life] of scene.gateFlashes) {
    const next = life - dt;
    if (next <= 0) scene.gateFlashes.delete(row);
    else scene.gateFlashes.set(row, next);
  }
  scene.endpointPulse = Math.max(0, scene.endpointPulse - dt);

  const survivors: Particle[] = [];
  const emitted: Particle[] = [];

  for (const particle of scene.particles) {
    particle.x += particle.vx * dt;

    if (particle.phase === 'source' && particle.x >= gateX) {
      scene.checked += 1;
      scene.gateFlashes.set(Math.floor(particle.y / ROW), 0.25);
      if (Math.random() < ALIVE_RATIO) {
        scene.alive += 1;
        particle.phase = 'alive';
        particle.glyph = '■';
        particle.y0 = particle.y;
        particle.vx = Math.max(particle.vx, 70);
      } else {
        particle.phase = 'dead';
        particle.glyph = '×';
        particle.vx *= 0.35;
        particle.vy = 10 + Math.random() * 30;
      }
    }

    if (particle.phase === 'alive') {
      const progress = Math.min(1, (particle.x - gateX) / (endpointX - gateX));
      const eased = progress * progress * (3 - 2 * progress);
      particle.y = particle.y0 + (centerY + ROW / 2 - particle.y0) * eased;
      if (particle.x >= endpointX - 30) {
        scene.endpointPulse = 0.18;
        if (Math.random() < 0.5) {
          emitted.push({
            x: endpointX + 34,
            y: centerY + ROW / 2,
            y0: centerY + ROW / 2,
            vx: 150,
            vy: 0,
            glyph: '─',
            phase: 'out',
            alpha: 1,
          });
        }
        continue;
      }
    }

    if (particle.phase === 'dead') {
      particle.vy += 140 * dt;
      particle.y += particle.vy * dt;
      particle.alpha -= dt * 0.6;
      if (particle.alpha <= 0) continue;
    }

    if (particle.x > width + 16) continue;
    survivors.push(particle);
  }

  scene.particles = survivors.concat(emitted);
}

function draw(context: CanvasRenderingContext2D, scene: Scene) {
  const { width, height } = scene;
  const { top, bottom, gateX, endpointX, centerY, edge } = layout(scene);

  context.clearRect(0, 0, width, height);
  context.textBaseline = 'middle';

  // Labels
  context.font = LABEL_FONT;
  context.fillStyle = COLOR.label;
  context.textAlign = 'left';
  context.fillText('sources', edge, 18);
  context.textAlign = 'center';
  context.fillText('checker', gateX, 18);
  context.fillText('rotating endpoint', endpointX, 18);

  // Checker gate
  context.font = FONT;
  for (let y = top; y + ROW <= bottom + 1; y += ROW) {
    const hot = scene.gateFlashes.has(Math.floor((y + ROW / 2) / ROW));
    context.fillStyle = hot ? COLOR.gateHot : COLOR.gate;
    context.fillText('┊', gateX, y + ROW / 2);
  }

  // Particles
  for (const particle of scene.particles) {
    context.globalAlpha = Math.max(0, particle.alpha);
    context.fillStyle =
      particle.phase === 'source'
        ? COLOR.dim
        : particle.phase === 'dead'
          ? COLOR.dead
          : particle.phase === 'out'
            ? COLOR.out
            : COLOR.cream;
    context.fillText(particle.glyph, Math.round(particle.x), Math.round(particle.y));
  }
  context.globalAlpha = 1;

  // Endpoint box
  const label = ':20000';
  const boxWidth = 68;
  const boxHeight = ROW + 10;
  const boxX = endpointX - boxWidth / 2;
  const boxY = centerY + ROW / 2 - boxHeight / 2;
  context.fillStyle = scene.endpointPulse > 0 ? COLOR.cream : COLOR.box;
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLOR.cream;
  context.lineWidth = 1;
  context.strokeRect(boxX + 0.5, boxY + 0.5, boxWidth - 1, boxHeight - 1);
  context.fillStyle = scene.endpointPulse > 0 ? COLOR.box : COLOR.cream;
  context.fillText(label, endpointX, centerY + ROW / 2 + 1);

  // Counter
  context.font = LABEL_FONT;
  context.textAlign = 'left';
  context.fillStyle = COLOR.label;
  const counter = `checked ${scene.checked.toLocaleString('en-US')}  ·  alive ${scene.alive.toLocaleString('en-US')}`;
  context.fillText(counter, edge, height - 18);
}

export default function FlockCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene: Scene = {
      width: 0,
      height: 0,
      particles: [],
      gateFlashes: new Map(),
      endpointPulse: 0,
      spawnDebt: 0,
      checked: 0,
      alive: 0,
    };
    sceneRef.current = scene;

    let frame = 0;
    let last = 0;
    let visible = true;
    let warmed = false;

    const resize = () => {
      const box = container.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      scene.width = Math.round(box.width);
      scene.height = Math.round(box.height);
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!warmed && scene.width > 0) {
        // Pre-fill the stage so the first paint is not empty.
        for (let index = 0; index < 1500; index += 1) step(scene, 1 / 60);
        warmed = true;
      }
      draw(context, scene);
    };

    const tick = (time: number) => {
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 1 / 60;
      last = time;
      step(scene, dt);
      draw(context, scene);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || reducedMotion.matches || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(container);

    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotion = () => (reducedMotion.matches ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onMotion);
    document.fonts?.ready.then(() => draw(context, scene));

    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotion);
    };
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    const box = event.currentTarget.getBoundingClientRect();
    burst(scene, event.clientX - box.left, event.clientY - box.top);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let index = 0; index < 240; index += 1) step(scene, 1 / 60);
      const context = canvas.getContext('2d');
      if (context) draw(context, scene);
    }
  };

  return (
    <div className="flock" ref={containerRef} onPointerDown={onPointerDown} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
