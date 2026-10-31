import { useEffect, useState, type RefObject } from 'react';

/** True while the element is on screen and the user has not asked for reduced motion. */
export function useAnimateInView(ref: RefObject<Element | null>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let intersecting = false;
    const update = () => setActive(intersecting && !reducedMotion.matches && !document.hidden);

    const observer = new IntersectionObserver(([entry]) => {
      intersecting = Boolean(entry?.isIntersecting);
      update();
    });
    observer.observe(element);
    reducedMotion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [ref]);

  return active;
}
