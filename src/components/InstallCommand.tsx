import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { INSTALL, OPERATING_SYSTEMS, detectOperatingSystem, type OperatingSystem } from '../content';

interface InstallCommandProps {
  id: string;
}

export default function InstallCommand({ id }: InstallCommandProps) {
  const [os, setOs] = useState<OperatingSystem>(detectOperatingSystem);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const install = INSTALL[os];

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(install.command);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = OPERATING_SYSTEMS[(index + step + OPERATING_SYSTEMS.length) % OPERATING_SYSTEMS.length]!;
    setOs(next);
    setCopied(false);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div className="install">
      <div className="os" role="tablist" aria-label="Your system">
        {OPERATING_SYSTEMS.map((key, index) => (
          <button
            key={key}
            id={`${id}-tab-${key}`}
            type="button"
            role="tab"
            className="os-tab"
            aria-selected={os === key}
            aria-controls={`${id}-panel`}
            tabIndex={os === key ? 0 : -1}
            onClick={() => {
              setOs(key);
              setCopied(false);
            }}
            onKeyDown={(event) => onTabKey(event, index)}
          >
            {INSTALL[key].label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${os}`}>
        <button
          type="button"
          className="cmd"
          onClick={copy}
          data-copied={copied}
          aria-label={`Copy install command: ${install.command}`}
        >
          <span className="cmd-ps" aria-hidden="true">
            {install.prompt}
          </span>
          <code className="cmd-t">{install.command}</code>
          <span className="cmd-copy" aria-live="polite">
            {copied ? 'copied' : 'copy'}
          </span>
        </button>
      </div>
    </div>
  );
}
