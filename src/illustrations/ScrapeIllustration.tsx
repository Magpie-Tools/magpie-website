import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame';
import { useAnimateInView } from '../hooks/useInView';
import { randomRoute, type ExampleRoute } from '../exampleRoutes';

const VISIBLE_ROWS = 11;

interface Row extends ExampleRoute {
  key: number;
}

function makeRows(count: number, startKey: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ ...randomRoute(), key: startKey + index }));
}

export default function ScrapeIllustration() {
  const ref = useRef<HTMLButtonElement>(null);
  const active = useAnimateInView(ref);
  const nextKey = useRef(VISIBLE_ROWS);
  const [rows, setRows] = useState<Row[]>(() => makeRows(VISIBLE_ROWS, 0));
  const [total, setTotal] = useState(12480);

  const add = (count: number) => {
    const fresh = makeRows(count, nextKey.current);
    nextKey.current += count;
    setRows((current) => [...current, ...fresh].slice(-VISIBLE_ROWS));
    setTotal((current) => current + count);
  };

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      const fresh = makeRows(1, nextKey.current);
      nextKey.current += 1;
      setRows((current) => [...current, ...fresh].slice(-VISIBLE_ROWS));
      setTotal((current) => current + 1);
    }, 1100);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      className="feat-ill"
      onClick={() => add(4)}
      aria-label="Collect more proxies"
    >
      <Frame
        caption="sources → pool"
        captionEnd="ipv4 · ipv6 · hostnames"
        footer={<span>pool {total.toLocaleString('en-US')} routes</span>}
      >
        <div className="ill" aria-hidden="true">
          <div className="feed">
            {rows.map((row) => (
              <div className="feed-row" key={row.key}>
                <span className="plus">+</span>
                <span>{row.address}</span>
                <span className="src">{row.protocol}</span>
              </div>
            ))}
          </div>
        </div>
      </Frame>
    </button>
  );
}
