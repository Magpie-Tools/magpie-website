import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  CheckCircle2,
  CircleDot,
  Gauge,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const noisySources = [
  { value: '103.183.58.198:8181', state: 'slow' },
  { value: '160.22.90.92:8818', state: 'alive' },
  { value: '195.93.172.32:3128', state: 'dead' },
  { value: '189.72.85.254:8080', state: 'alive' },
  { value: '177.242.137.182:999', state: 'weak' },
];

const cleanRotators = [
  { name: 'market-watch', meta: 'HTTP / TCP', rule: 'good reputation' },
  { name: 'status-monitor', meta: 'SOCKS5 / TCP', rule: 'low latency' },
  { name: 'geo-checks', meta: 'HTTPS / TCP', rule: 'country filter' },
];

const signals = [
  {
    icon: <Activity className="h-5 w-5" />,
    label: 'Alive checks',
    text: 'Stop routing through dead IPs.',
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    label: 'Latency scoring',
    text: 'Prefer proxies that answer quickly.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'Reputation filters',
    text: 'Keep weak performers out of rotators.',
  },
];

const operatingSteps = ['Scrape', 'Check', 'Score', 'Rotate'];

function stateClass(state: string) {
  switch (state) {
    case 'alive':
      return 'border-[#3fa37a]/40 bg-[#3fa37a]/12 text-[#9ee0c5]';
    case 'dead':
      return 'border-[#ef4444]/35 bg-[#ef4444]/10 text-[#fca5a5]';
    case 'slow':
      return 'border-[#f2b84b]/35 bg-[#f2b84b]/10 text-[#f5d08b]';
    default:
      return 'border-[#6ea8ff]/35 bg-[#6ea8ff]/10 text-[#a8c8ff]';
  }
}

export default function TechStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 84%',
          toggleActions: 'play none none none',
          onEnter: (self) => triggers.push(self),
        },
      }
    );

    gsap.fromTo(
      consoleRef.current,
      { opacity: 0, y: 42, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: consoleRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
          onEnter: (self) => triggers.push(self),
        },
      }
    );

    const animatedRows = consoleRef.current?.querySelectorAll('.control-row');
    if (animatedRows?.length) {
      gsap.fromTo(
        animatedRows,
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.045,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: consoleRef.current,
            start: 'top 74%',
            toggleActions: 'play none none none',
            onEnter: (self) => triggers.push(self),
          },
        }
      );
    }

    const signals = signalRef.current?.querySelectorAll('.signal-item');
    if (signals?.length) {
      gsap.fromTo(
        signals,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: signalRef.current,
            start: 'top 84%',
            toggleActions: 'play none none none',
            onEnter: (self) => triggers.push(self),
          },
        }
      );
    }

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0e0e0e] py-24 lg:py-32"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(63, 163, 122, 0.55), rgba(242, 184, 75, 0.35), transparent)',
          }}
        />
        <div
          className="absolute left-[12%] top-24 h-[520px] w-[520px] opacity-[0.16]"
          style={{
            background:
              'radial-gradient(circle, rgba(242, 184, 75, 0.32) 0%, rgba(242, 184, 75, 0.08) 35%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[620px] w-[760px] opacity-[0.18]"
          style={{
            background:
              'radial-gradient(ellipse, rgba(63, 163, 122, 0.36) 0%, rgba(63, 163, 122, 0.08) 42%, transparent 72%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
            backgroundSize: '86px 86px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div ref={headerRef} className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="space-y-5">
              <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                The product is not more proxies. It is knowing which proxies deserve traffic.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-relaxed text-[#a7b3ad] lg:text-lg">
              Magpie turns scraped sources, imports, and private pools into a maintained routing layer: checked, scored, filtered, and exposed through stable rotating endpoints.
            </p>
          </div>
        </div>

        <div
          ref={consoleRef}
          className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-[28px] border border-[#29342f] bg-[#111412] shadow-2xl shadow-black/30"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background:
                'linear-gradient(90deg, rgba(242,184,75,0.9), rgba(63,163,122,0.95), rgba(110,168,255,0.8))',
            }}
          />

          <div className="grid lg:grid-cols-[0.92fr_1.16fr_0.92fr]">
            <div className="relative border-b border-[#29342f] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f2b84b]">
                    Before
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Raw pool</h3>
                </div>
                <SlidersHorizontal className="h-5 w-5 text-[#f2b84b]" />
              </div>

              <div className="mt-8 space-y-3">
                {noisySources.map((source) => (
                  <div
                    key={source.value}
                    className="control-row flex items-center justify-between gap-3 rounded-xl border border-[#2b2f2d] bg-[#171a18] px-4 py-3"
                  >
                    <span className="min-w-0 truncate text-sm text-[#d8dfdb]">{source.value}</span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${stateClass(source.state)}`}
                    >
                      {source.state}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-7 text-sm leading-relaxed text-[#8f9b95]">
                Lists drift fast. Without checks and scoring, every script inherits the same stale pool.
              </p>
            </div>

            <div className="relative min-h-[460px] overflow-hidden border-b border-[#29342f] p-6 sm:p-8 lg:border-b-0">
              <div className="absolute inset-0 opacity-[0.06]">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(158,224,197,0.9) 1px, transparent 0)',
                    backgroundSize: '26px 26px',
                  }}
                />
              </div>

              <div className="relative flex h-full min-h-[400px] flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9ee0c5]">
                      Magpie
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Operating layer</h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#3fa37a]/30 bg-[#3fa37a]/10 px-3 py-1.5 text-xs font-semibold text-[#9ee0c5]">
                    <span className="h-2 w-2 rounded-full bg-[#3fa37a]" />
                    live
                  </div>
                </div>

                <div className="relative mx-auto my-12 flex h-64 w-full max-w-md items-center justify-center">
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 420 260"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M26 128 C92 36 151 38 210 128 C271 218 332 217 394 128"
                      stroke="rgba(63, 163, 122, 0.42)"
                      strokeWidth="2"
                      strokeDasharray="8 10"
                    />
                    <path
                      d="M26 128 C92 220 151 218 210 128 C271 38 332 39 394 128"
                      stroke="rgba(110, 168, 255, 0.28)"
                      strokeWidth="2"
                      strokeDasharray="4 12"
                    />
                  </svg>

                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-[#3fa37a]/45 bg-[#10221a] shadow-[0_0_60px_rgba(63,163,122,0.22)]">
                    <div className="absolute h-48 w-48 rounded-full border border-[#3fa37a]/15" />
                    <div className="absolute h-60 w-60 rounded-full border border-[#6ea8ff]/10" />
                    <img
                      src="/magpie-light-green.svg"
                      alt="Magpie"
                      className="h-20 w-20 object-contain drop-shadow-[0_0_10px_rgba(63,163,122,0.55)]"
                      loading="lazy"
                    />
                  </div>

                  {operatingSteps.map((step, index) => {
                    const positions = [
                      'left-0 top-8',
                      'right-0 top-8',
                      'left-0 bottom-8',
                      'right-0 bottom-8',
                    ];
                    return (
                      <div
                        key={step}
                        className={`control-row absolute ${positions[index]} flex items-center gap-2 rounded-full border border-[#33413a] bg-[#151a17] px-3 py-2 text-sm font-semibold text-[#d8dfdb]`}
                      >
                        <CircleDot className="h-4 w-4 text-[#3fa37a]" />
                        {step}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#29342f] bg-[#151a17] p-4">
                    <p className="text-2xl font-semibold text-white">24/7</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8f9b95]">checks</p>
                  </div>
                  <div className="rounded-xl border border-[#29342f] bg-[#151a17] p-4">
                    <p className="text-2xl font-semibold text-white">4</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8f9b95]">protocols</p>
                  </div>
                  <div className="rounded-xl border border-[#29342f] bg-[#151a17] p-4">
                    <p className="text-2xl font-semibold text-white">1</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8f9b95]">endpoint</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:border-l lg:border-[#29342f]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6ea8ff]">
                    After
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Clean routes</h3>
                </div>
                <Route className="h-5 w-5 text-[#6ea8ff]" />
              </div>

              <div className="mt-8 space-y-4">
                {cleanRotators.map((rotator) => (
                  <div
                    key={rotator.name}
                    className="control-row rounded-xl border border-[#2b2f2d] bg-[#171a18] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-base font-semibold text-white">
                        {rotator.name}
                      </span>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3fa37a]" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#6ea8ff]/30 bg-[#6ea8ff]/10 px-3 py-1 text-xs font-semibold text-[#a8c8ff]">
                        {rotator.meta}
                      </span>
                      <span className="rounded-full border border-[#3fa37a]/30 bg-[#3fa37a]/10 px-3 py-1 text-xs font-semibold text-[#9ee0c5]">
                        {rotator.rule}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-7 text-sm leading-relaxed text-[#8f9b95]">
                Your apps connect to stable rotators while Magpie keeps selecting healthier upstream proxies behind them.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={signalRef}
          className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-3"
        >
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="signal-item flex items-start gap-4 border-t border-[#29342f] pt-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3fa37a]/30 bg-[#3fa37a]/10 text-[#9ee0c5]">
                {signal.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{signal.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8f9b95]">{signal.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-4 border-l border-[#3fa37a]/45 pl-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-white">
            Use one maintained pool instead of chasing broken proxy lists in every workflow.
          </p>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#3fa37a]/30 bg-[#3fa37a]/10 px-4 py-2 text-sm font-semibold text-[#9ee0c5]">
            <Zap className="h-4 w-4" />
            Built for teams that bring their own sources
          </div>
        </div>
      </div>
    </section>
  );
}
