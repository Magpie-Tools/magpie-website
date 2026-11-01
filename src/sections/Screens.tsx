import { useState, type KeyboardEvent } from 'react';
import Frame from '../components/Frame';

const SCREENS = [
  { id: 'dashboard', label: 'dashboard', alt: 'Magpie dashboard with alive, total, and scraped proxy counts, a proxies per hour chart against the proxy limit, and recent check history' },
  { id: 'proxy-list', label: 'proxies', alt: 'Magpie proxy list with status, tags, response time, type, country, reputation, and last check columns' },
  { id: 'add-proxies', label: 'import', alt: 'Magpie add proxies dialog with tags, paste and file import, and an import summary' },
  { id: 'scrape-sources', label: 'scraping', alt: 'Magpie scrape sources with proxy counts, alive proxies, health bars, and scrape status per source' },
  { id: 'alerts', label: 'alerts', alt: 'Magpie alert rules with an open latency incident, pool capacity status, and a form for adding a rule' },
] as const;

export default function Screens() {
  const [current, setCurrent] = useState(0);
  const screen = SCREENS[current]!;

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + SCREENS.length) % SCREENS.length;
    setCurrent(next);
    document.getElementById(`screen-tab-${SCREENS[next]!.id}`)?.focus();
  };

  return (
    <section className="sec" id="dashboard" aria-labelledby="screens-title">
      <div className="wrap">
        <div className="shots-head">
          <div>
            <h2 id="screens-title" className="h2">
              One place for the whole team
            </h2>
            <p className="lead">
              Shared workspaces with roles and invitations. Everyone sees the same pool, checks, and endpoints.
            </p>
          </div>
          <div className="tabs" role="tablist" aria-label="Screens">
            {SCREENS.map((item, index) => (
              <button
                key={item.id}
                id={`screen-tab-${item.id}`}
                type="button"
                role="tab"
                className="tab"
                aria-selected={index === current}
                aria-controls="screen-panel"
                tabIndex={index === current ? 0 : -1}
                onClick={() => setCurrent(index)}
                onKeyDown={(event) => onKey(event, index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="shot" id="screen-panel" role="tabpanel" aria-labelledby={`screen-tab-${screen.id}`}>
          <Frame caption={`localhost:5050 · ${screen.label}`} captionEnd="magpie-frontend">
            <img
              key={screen.id}
              src={`/screen-${screen.id}-1600.webp`}
              srcSet={`/screen-${screen.id}-960.webp 960w, /screen-${screen.id}-1600.webp 1600w`}
              sizes="(min-width: 1344px) 1248px, calc(100vw - 2 * var(--margin))"
              width={1600}
              height={1000}
              alt={screen.alt}
              loading="lazy"
              decoding="async"
            />
          </Frame>
        </div>
      </div>
    </section>
  );
}
