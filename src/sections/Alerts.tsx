import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame';
import { useAnimateInView } from '../hooks/useInView';

/*
 * Replays one alert incident as documented in docs/user-guide/alerts.md:
 * rules are evaluated every minute, a breach must hold for two minutes to open
 * an incident, and two healthy minutes close it with one recovery message.
 */

const THRESHOLD = 50;
const VALUES = [72, 70, 71, 68, 66, 63, 58, 54, 47, 41, 36, 33, 35, 40, 46, 52, 58, 63, 67, 70, 72, 71, 73, 74];
const LAST = VALUES.length - 1;
const START_MINUTE = 0; // 12:00
const TICK_MS = 650;
const HOLD_TICKS = 6;
const DESTINATIONS = 'Production Discord, Ops mailbox, webhook';

type Tone = 'bad' | 'ok';

interface LogEvent {
  minute: number;
  tone: Tone;
  title: string;
  detail: string;
}

function clock(minute: number) {
  return `12:${String(START_MINUTE + minute).padStart(2, '0')}`;
}

function buildEvents(): LogEvent[] {
  const events: LogEvent[] = [];
  let breachSince: number | null = null;
  let healthySince: number | null = null;
  let open = false;

  VALUES.forEach((value, minute) => {
    const breach = value < THRESHOLD;
    if (!open) {
      if (breach) {
        if (breachSince === null) {
          breachSince = minute;
          events.push({ minute, tone: 'bad', title: 'breach observed', detail: `${value} < ${THRESHOLD} · waiting 2 min` });
        } else if (minute - breachSince >= 2) {
          open = true;
          healthySince = null;
          events.push({ minute, tone: 'bad', title: 'incident opened', detail: `${value} < ${THRESHOLD} → ${DESTINATIONS}` });
        }
      } else {
        breachSince = null;
      }
    } else if (!breach) {
      if (healthySince === null) {
        healthySince = minute;
        events.push({ minute, tone: 'ok', title: 'healthy again', detail: `${value} ≥ ${THRESHOLD} · waiting 2 min` });
      } else if (minute - healthySince >= 2) {
        open = false;
        breachSince = null;
        events.push({ minute, tone: 'ok', title: 'recovered', detail: `${value} ≥ ${THRESHOLD} → recovery message sent` });
      }
    } else {
      healthySince = null;
    }
  });

  return events;
}

const EVENTS = buildEvents();
const OPENED = EVENTS.find((event) => event.title === 'incident opened')?.minute ?? LAST;
const RECOVERED = EVENTS.find((event) => event.title === 'recovered')?.minute ?? LAST;

/* Chart geometry (SVG user units). */
const W = 640;
const H = 240;
const PAD = { top: 20, right: 16, bottom: 30, left: 36 };
const Y_MAX = 80;
const x = (minute: number) => PAD.left + (minute / LAST) * (W - PAD.left - PAD.right);
const y = (value: number) => PAD.top + (1 - value / Y_MAX) * (H - PAD.top - PAD.bottom);

function Chart({ minute }: { minute: number }) {
  const visible = VALUES.slice(0, minute + 1);
  const path = visible.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(value)}`).join(' ');
  const area = `${path} L${x(minute)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const incidentEnd = Math.min(minute, RECOVERED);
  const incidentOpen = minute >= OPENED;

  return (
    <svg
      className="al-chart"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={`Usable routes per minute, minimum ${THRESHOLD}`}>
      <defs>
        <linearGradient id="al-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#61b399" stopOpacity="0.28" />
          <stop offset="1" stopColor="#61b399" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 20, 40, 60, 80].map((tick) => (
        <g key={tick}>
          <line className="al-grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
          <text className="al-axis" x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">
            {tick}
          </text>
        </g>
      ))}
      {[0, 6, 12, 18, LAST].map((tick) => (
        <text key={tick} className="al-axis" x={x(tick)} y={H - 8} textAnchor="middle">
          {clock(tick)}
        </text>
      ))}

      {incidentOpen ? (
        <rect
          className="al-incident"
          x={x(OPENED)}
          y={PAD.top}
          width={Math.max(0, x(incidentEnd) - x(OPENED))}
          height={H - PAD.top - PAD.bottom}
        />
      ) : null}

      <line className="al-threshold" x1={PAD.left} x2={W - PAD.right} y1={y(THRESHOLD)} y2={y(THRESHOLD)} />
      <text className="al-threshold-label" x={W - PAD.right} y={y(THRESHOLD) - 6} textAnchor="end">
        min {THRESHOLD}
      </text>

      <path className="al-area" d={area} fill="url(#al-fill)" />
      <path className="al-line" d={path} />
      {visible.map((value, index) => (
        <circle
          key={index}
          className={value < THRESHOLD ? 'al-pt al-pt-bad' : 'al-pt'}
          cx={x(index)}
          cy={y(value)}
          r={index === minute ? 4 : 2.2}
        />
      ))}
      <line className="al-head" x1={x(minute)} x2={x(minute)} y1={PAD.top} y2={H - PAD.bottom} />
    </svg>
  );
}

export default function Alerts() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useAnimateInView(ref);
  const [minute, setMinute] = useState(LAST);
  const started = useRef(false);
  const hold = useRef(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setMinute((current) => {
        if (!started.current) {
          // The static view shows the whole incident; the first visit replays it.
          started.current = true;
          return 0;
        }
        if (current < LAST) return current + 1;
        hold.current += 1;
        if (hold.current < HOLD_TICKS) return current;
        hold.current = 0;
        return 0;
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [active]);

  const replay = () => {
    hold.current = 0;
    setMinute(active ? 0 : LAST);
  };

  const value = VALUES[minute]!;
  const state = minute >= OPENED && minute < RECOVERED ? 'incident open' : minute >= RECOVERED ? 'recovered' : 'healthy';
  const shown = EVENTS.filter((event) => event.minute <= minute);

  return (
    <section className="sec" id="alerts" aria-labelledby="alerts-title">
      <div className="wrap">
        <div className="al-head-row">
          <div>
            <h2 id="alerts-title" className="h2">
              Alerts when your pool degrades
            </h2>
            <p className="lead">
              Alert rules watch a rotating pool or a whole workspace and tell your team before clients notice.
            </p>
          </div>
          <p className="al-channels">email · Slack · Discord · signed webhook</p>
        </div>

        <div ref={ref} className="al-frame">
          <Frame
            caption="Production HTTP pool · usable routes"
            captionEnd={
              <button type="button" className="al-replay" onClick={replay}>
                replay
              </button>
            }
            footer={
              <>
                <span>
                  {clock(minute)} · {value} usable · {state}
                </span>
                <span>evaluated every minute</span>
              </>
            }
          >
            <div className="al-body">
              <Chart minute={minute} />
              <ol className="al-log" aria-live="polite">
                {shown.length === 0 ? <li className="al-empty">No incidents. Watching the pool.</li> : null}
                {shown.map((event) => (
                  <li key={`${event.minute}-${event.title}`} className={`al-ev al-ev-${event.tone}`}>
                    <span className="al-time">{clock(event.minute)}</span>
                    <span className="al-dot" aria-hidden="true" />
                    <span className="al-text">
                      <strong>{event.title}</strong>
                      <span>{event.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Frame>
        </div>

        <ul className="al-facts">
          <li>
            <span className="al-fact-k">conditions</span>
            Usable routes, checker success rate, or average latency, for one rotator or the whole workspace.
          </li>
          <li>
            <span className="al-fact-k">no flapping</span>
            A breach has to hold for two minutes to open an incident, and two healthy minutes close it.
          </li>
          <li>
            <span className="al-fact-k">no spam</span>
            One message when it opens and one when it recovers. Webhooks can be signed and carry a delivery ID.
          </li>
        </ul>
      </div>
    </section>
  );
}
