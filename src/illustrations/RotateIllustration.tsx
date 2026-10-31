import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame';
import { useAnimateInView } from '../hooks/useInView';

const UPSTREAMS = [
  { label: '192.0.2.18:8080', reputation: 'good' },
  { label: '198.51.100.4:1080', reputation: 'good' },
  { label: '203.0.113.77:3128', reputation: 'neutral' },
  { label: 'gw2.provider.example', reputation: 'good' },
];

const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 216;
const APP = { x: 16, y: 92, w: 64, h: 32 };
const ENDPOINT = { x: 128, y: 92, w: 72, h: 32 };
const UPSTREAM_X = 236;
const UPSTREAM_W = 152;

function upstreamY(index: number) {
  return 22 + index * 46;
}

export default function RotateIllustration() {
  const ref = useRef<HTMLButtonElement>(null);
  const active = useAnimateInView(ref);
  const [current, setCurrent] = useState(0);
  const [requests, setRequests] = useState(1);

  const next = () => {
    setCurrent((value) => (value + 1) % UPSTREAMS.length);
    setRequests((value) => value + 1);
  };

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % UPSTREAMS.length);
      setRequests((value) => value + 1);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [active]);

  const endpointRight = ENDPOINT.x + ENDPOINT.w;
  const middleY = APP.y + APP.h / 2;

  return (
    <button ref={ref} type="button" className="feat-ill" onClick={next} aria-label="Send another request">
      <Frame
        caption="rotating proxy · tcp · quic · http/3"
        captionEnd={`request #${requests}`}
        footer={<span>$ curl -x http://localhost:20000 https://example.com</span>}
      >
        <div className="ill" aria-hidden="true">
          <div className="rot">
            <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
              <line className="rot-wire rot-wire-on" x1={APP.x + APP.w} y1={middleY} x2={ENDPOINT.x} y2={middleY} />
              {UPSTREAMS.map((upstream, index) => {
                const y = upstreamY(index) + 13;
                const on = index === current;
                return (
                  <g key={upstream.label}>
                    <path
                      className={on ? 'rot-wire rot-wire-on' : 'rot-wire'}
                      d={`M${endpointRight} ${middleY} C ${endpointRight + 20} ${middleY}, ${UPSTREAM_X - 20} ${y}, ${UPSTREAM_X} ${y}`}
                      fill="none"
                    />
                    <rect rx={6}
                      className={on ? 'rot-node rot-node-on' : 'rot-node'}
                      x={UPSTREAM_X + 0.5}
                      y={upstreamY(index) + 0.5}
                      width={UPSTREAM_W}
                      height={26}
                    />
                    <text className={on ? 'rot-text rot-text-on' : 'rot-text'} x={UPSTREAM_X + 8} y={upstreamY(index) + 17}>
                      {upstream.label}
                    </text>
                    <text className="rot-label" x={UPSTREAM_X + UPSTREAM_W} y={upstreamY(index) + 38} textAnchor="end">
                      {upstream.reputation}
                    </text>
                  </g>
                );
              })}
              <rect rx={6} className="rot-node" x={APP.x + 0.5} y={APP.y + 0.5} width={APP.w} height={APP.h} />
              <text className="rot-text" x={APP.x + APP.w / 2} y={middleY + 4} textAnchor="middle">
                app
              </text>
              <rect rx={6} className="rot-node rot-node-on" x={ENDPOINT.x + 0.5} y={ENDPOINT.y + 0.5} width={ENDPOINT.w} height={ENDPOINT.h} />
              <text className="rot-text rot-text-on" x={ENDPOINT.x + ENDPOINT.w / 2} y={middleY + 4} textAnchor="middle">
                :20000
              </text>
              <text className="rot-label" x={ENDPOINT.x + ENDPOINT.w / 2} y={ENDPOINT.y + ENDPOINT.h + 18} textAnchor="middle">
                magpie
              </text>
            </svg>
          </div>
        </div>
      </Frame>
    </button>
  );
}
