import { useEffect, useRef, useState, type ReactNode } from 'react';
import Frame from '../components/Frame';
import { LINKS } from '../content';

interface Line {
  key: number;
  content: ReactNode;
}

interface Step {
  title: string;
  prompt: string;
  help: string;
  caption: string;
  action: string;
  output: (run: number) => ReactNode[];
  result: (run: number) => string;
  idle: string;
}

const IMPORTED = [
  { address: '192.0.2.18:8080', protocol: 'http', alive: true, latency: '182 ms' },
  { address: '198.51.100.4:1080', protocol: 'socks5', alive: true, latency: '240 ms' },
  { address: '[2001:db8::17]:3128', protocol: 'http', alive: false, latency: 'timeout' },
  { address: 'gw2.provider.example:8000', protocol: 'https', alive: true, latency: '96 ms' },
  { address: '203.0.113.9:4145', protocol: 'socks4', alive: false, latency: 'refused' },
  { address: '203.0.113.77:3128', protocol: 'http', alive: true, latency: '311 ms' },
];

const EXIT_IPS = ['192.0.2.18', '198.51.100.4', '198.51.100.212', '203.0.113.77'];

const STEPS: Step[] = [
  {
    title: 'Install',
    prompt: 'curl -fsSL …/scripts/install.sh | bash',
    help: 'The installer asks for an encryption key, generates the remaining credentials, and starts the stack with Docker Compose.',
    caption: '~ · install',
    action: 'Run',
    idle: 'Nothing installed yet',
    output: () => [
      <span>
        <span className="dim">?</span> PROXY_ENCRYPTION_KEY <span className="dim">················</span>
      </span>,
      <span className="dim">  created ./magpie</span>,
      <span className="dim">  generated database and redis credentials</span>,
      <span>
        <span className="ok">  ✓</span> postgres <span className="ok">✓</span> redis <span className="ok">✓</span> backend{' '}
        <span className="ok">✓</span> frontend
      </span>,
      <span>
        {'  '}dashboard <span className="hl">http://localhost:5050</span>
      </span>,
    ],
    result: () => 'Dashboard running on localhost:5050',
  },
  {
    title: 'Add proxies',
    prompt: 'Proxies › Import › paste 6 routes',
    help: 'Paste proxy lists, import provider endpoints, or add scraping sources. Magpie checks every route and keeps checking.',
    caption: 'localhost:5050 · proxies',
    action: 'Import',
    idle: 'Pool is empty',
    output: () => [
      <span className="dim">imported 6 routes · checking…</span>,
      ...IMPORTED.map((route) => (
        <span>
          {route.address.padEnd(27)}
          <span className="dim">{route.protocol.padEnd(8)}</span>
          {route.alive ? <span className="ok">✓ alive </span> : <span className="bad">× dead  </span>}
          <span className="dim">{route.latency}</span>
        </span>
      )),
    ],
    result: () => '4 of 6 routes alive',
  },
  {
    title: 'Rotate',
    prompt: 'curl -x http://localhost:20000 https://api.ipify.org',
    help: 'Create a rotating proxy and point your app at it. Each request leaves through a healthy upstream.',
    caption: '~ · curl',
    action: 'Run',
    idle: 'No requests yet',
    output: (run) => [
      <span>
        <span className="dim">$</span> curl -x http://localhost:20000 https://api.ipify.org
      </span>,
      <span className="hl">{EXIT_IPS[run % EXIT_IPS.length]}</span>,
    ],
    result: (run) => `${run + 1} request${run === 0 ? '' : 's'} · ${Math.min(run + 1, EXIT_IPS.length)} exit IP${run === 0 ? '' : 's'}`,
  },
];

const LINE_DELAY = 260;
const MAX_LINES = 13;

export default function Walkthrough() {
  const [index, setIndex] = useState(0);
  const [runs, setRuns] = useState<number[]>([0, 0, 0]);
  const [lines, setLines] = useState<Line[][]>([[], [], []]);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);
  const lineKey = useRef(0);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const step = STEPS[index]!;
  const run = runs[index]!;
  const done = run > 0;

  const execute = () => {
    if (busy) return;
    const stepIndex = index;
    const output = STEPS[stepIndex]!.output(runs[stepIndex]!);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reduceMotion ? 0 : LINE_DELAY;

    setBusy(true);
    if (stepIndex !== 2) {
      setLines((current) => current.map((entry, position) => (position === stepIndex ? [] : entry)));
    }

    output.forEach((content, lineIndex) => {
      const timer = window.setTimeout(() => {
        const line = { key: lineKey.current++, content };
        setLines((current) =>
          current.map((entry, position) =>
            position === stepIndex ? [...entry, line].slice(-MAX_LINES) : entry
          )
        );
        if (lineIndex === output.length - 1) {
          setRuns((current) => current.map((value, position) => (position === stepIndex ? value + 1 : value)));
          setBusy(false);
        }
      }, delay * (lineIndex + 1));
      timers.current.push(timer);
    });
  };

  const goTo = (target: number) => {
    if (busy) return;
    setIndex(target);
  };

  const actionLabel = done ? (index === 2 ? 'Run again' : 'Next step') : step.action;
  const onAction = () => {
    if (done && index < 2) goTo(index + 1);
    else execute();
  };

  return (
    <section className="sec" id="how-it-works" aria-labelledby="walk-title">
      <div className="wrap">
        <span className="kicker">How it works</span>
        <h2 id="walk-title" className="h2">
          From a proxy list to a working endpoint
        </h2>
        <p className="lead">Install it, add proxies, point your app at one address.</p>

        <div className="walk-grid">
          <div className="walk-in">
            <ol className="walk-steps" aria-label="Steps">
              {STEPS.map((item, position) => (
                <li key={item.title}>
                  <button
                    type="button"
                    aria-current={position === index ? 'step' : undefined}
                    onClick={() => goTo(position)}
                  >
                    {position + 1} · {item.title.toLowerCase()}
                  </button>
                </li>
              ))}
            </ol>
            <h3 className="walk-title">{step.title}</h3>
            <p className="walk-prompt" aria-label={`Command: ${step.prompt}`}>
              <span className="ps">{index === 1 ? '›' : '$'}</span> {step.prompt}
              <span className="caret" aria-hidden="true">
                ▌
              </span>
            </p>
            <p className="walk-help">{step.help}</p>
            <div className="walk-actions">
              <button type="button" className="btn" onClick={onAction} disabled={busy}>
                {actionLabel}
              </button>
              {index === 2 && done ? (
                <a className="btn btn-line" href={LINKS.firstProxy}>
                  Try it for real
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <Frame caption={step.caption} captionEnd={`step ${index + 1} of 3`}>
              <div className="term" aria-live="polite">
                {lines[index]!.length === 0 ? (
                  <div className="term-line dim">
                    {index === 1 ? 'Press Import to add six example routes.' : 'Press Run to execute the command.'}
                  </div>
                ) : (
                  lines[index]!.map((line) => (
                    <div className="term-line" key={line.key}>
                      {line.content}
                    </div>
                  ))
                )}
              </div>
            </Frame>
            <p className="walk-result" aria-live="polite">
              <span className={done ? 'dot dot-on' : 'dot'} aria-hidden="true" />
              <span>{done ? step.result(run - 1) : step.idle}</span>
            </p>
          </div>
        </div>

        <p className="walk-note">
          …plus scraping schedules, checker rules per tag, reputation filters, alerts, exports, and a REST and
          GraphQL API. See the <a href={LINKS.docs}>documentation</a>.
        </p>
      </div>
    </section>
  );
}
