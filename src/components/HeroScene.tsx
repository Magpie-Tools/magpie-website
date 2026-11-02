import { useEffect, useRef } from 'react';
import { createScene, maskStars, PALETTE, pokeScene, renderScene, stepScene, type Rect, type Scene } from './heroScene';

/* CSS pixels per art pixel. */
const pixelSize = (width: number) => (width < 768 ? 3 : 4);
const FRAME_SECONDS = 1 / 30;
/* Star-free margin around the hero text, in CSS pixels. */
const TEXT_CLEARANCE = 20;

/** Boxes around the hero's header and copy, in art pixels relative to `canvas`. */
function measureText(hero: Element, canvas: HTMLCanvasElement, scale: number): Rect[] {
  const origin = canvas.getBoundingClientRect();
  const boxes: DOMRect[] = [];
  for (const element of hero.querySelectorAll('.head > *, .hero-copy > *')) {
    if (element.tagName === 'H1' || element.tagName === 'P') {
      // Measure each line of text, not the full-width block.
      const range = document.createRange();
      range.selectNodeContents(element);
      boxes.push(...range.getClientRects());
    } else {
      boxes.push(element.getBoundingClientRect());
    }
  }
  return boxes
    .filter((box) => box.width > 0 && box.height > 0)
    .map((box) => {
      const left = (box.left - origin.left - TEXT_CLEARANCE) / scale;
      const top = (box.top - origin.top - TEXT_CLEARANCE) / scale;
      return {
        x: Math.floor(left),
        y: Math.floor(top),
        w: Math.ceil((box.width + 2 * TEXT_CLEARANCE) / scale) + 1,
        h: Math.ceil((box.height + 2 * TEXT_CLEARANCE) / scale) + 1,
      };
    });
}

function packPalette() {
  const bytes = new Uint8ClampedArray(PALETTE.length * 4);
  PALETTE.forEach((hex, index) => {
    bytes[index * 4] = parseInt(hex.slice(1, 3), 16);
    bytes[index * 4 + 1] = parseInt(hex.slice(3, 5), 16);
    bytes[index * 4 + 2] = parseInt(hex.slice(5, 7), 16);
    bytes[index * 4 + 3] = 255;
  });
  return new Uint32Array(bytes.buffer);
}

/**
 * Pixel-art backdrop for the hero. Click the scene to scatter the magpies on
 * the wires; anywhere else sends a burst of packets down the line.
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const palette = packPalette();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scene: Scene | null = null;
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let scale = 4;
    let frame = 0;
    let last = 0;
    let pending = 0;
    let visible = true;

    const paint = () => {
      if (!scene || !image || !pixels) return;
      renderScene(scene);
      const { idx } = scene;
      for (let index = 0; index < idx.length; index += 1) pixels[index] = palette[idx[index]!]!;
      context.putImageData(image, 0, 0);
    };

    const maskText = () => {
      if (!scene || !container.parentElement) return;
      maskStars(scene, measureText(container.parentElement, canvas, scale));
      paint();
    };

    const resize = () => {
      const box = container.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      scale = pixelSize(box.width);
      const width = Math.ceil(box.width / scale);
      const height = Math.ceil(box.height / scale);
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;
      if (!scene || scene.width !== width || scene.height !== height) {
        canvas.width = width;
        canvas.height = height;
        scene = createScene(width, height);
        // Let a few packets spread out before the first paint.
        for (let index = 0; index < 60; index += 1) stepScene(scene, FRAME_SECONDS);
        image = context.createImageData(width, height);
        pixels = new Uint32Array(image.data.buffer);
      }
      // Text can rewrap without the scene changing size, so re-mask every time.
      maskText();
    };

    const tick = (time: number) => {
      const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
      last = time;
      pending += dt;
      if (scene && pending >= FRAME_SECONDS) {
        stepScene(scene, pending);
        pending = 0;
        paint();
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || reducedMotion.matches || !visible || document.hidden) return;
      last = 0;
      pending = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!scene || reducedMotion.matches) return;
      const box = canvas.getBoundingClientRect();
      pokeScene(scene, (event.clientX - box.left) / scale, (event.clientY - box.top) / scale);
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
    container.addEventListener('pointerdown', onPointerDown);
    // Web fonts change line widths once they load.
    document.fonts?.ready.then(maskText);

    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotion);
      container.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <div className="hero-scene" ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
