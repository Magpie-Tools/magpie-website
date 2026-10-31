import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame';
import { useAnimateInView } from '../hooks/useInView';

const COLUMNS = 24;
const ROWS = 9;
const COUNT = COLUMNS * ROWS;
const ALIVE_RATIO = 0.6;

type CellState = 'idle' | 'probe' | 'alive' | 'dead';

function seededStates(): CellState[] {
  let seed = 7;
  return Array.from({ length: COUNT }, () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const roll = seed / 2147483648;
    if (roll < 0.12) return 'idle';
    return roll < 0.12 + 0.88 * ALIVE_RATIO ? 'alive' : 'dead';
  });
}

function settle(): CellState {
  return Math.random() < ALIVE_RATIO ? 'alive' : 'dead';
}

export default function CheckIllustration() {
  const ref = useRef<HTMLButtonElement>(null);
  const active = useAnimateInView(ref);
  const [cells, setCells] = useState<CellState[]>(seededStates);
  const sweep = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setCells((current) => {
        const next = current.slice();
        for (let index = 0; index < next.length; index += 1) {
          if (next[index] === 'probe') next[index] = settle();
        }
        if (sweep.current !== null) {
          const column = sweep.current;
          for (let row = 0; row < ROWS; row += 1) next[row * COLUMNS + column] = 'probe';
          sweep.current = column + 1 < COLUMNS ? column + 1 : null;
        } else {
          for (let probes = 0; probes < 3; probes += 1) {
            next[Math.floor(Math.random() * COUNT)] = 'probe';
          }
        }
        return next;
      });
    }, 110);
    return () => window.clearInterval(timer);
  }, [active]);

  const recheck = () => {
    if (active) {
      sweep.current = 0;
      return;
    }
    setCells((current) => current.map(() => settle()));
  };

  const alive = cells.filter((cell) => cell === 'alive').length;
  const dead = cells.filter((cell) => cell === 'dead').length;

  return (
    <button ref={ref} type="button" className="feat-ill" onClick={recheck} aria-label="Re-check every proxy">
      <Frame
        caption="checker · judges"
        captionEnd="http · https · socks4 · socks5"
        footer={
          <span>
            alive {alive} · dead {dead} · {Math.round((alive / Math.max(1, alive + dead)) * 100)}% healthy
          </span>
        }
      >
        <div className="ill" aria-hidden="true">
          <div className="cells">
            {cells.map((state, index) => (
              <span key={index} className="cell" data-s={state} />
            ))}
          </div>
        </div>
      </Frame>
    </button>
  );
}
