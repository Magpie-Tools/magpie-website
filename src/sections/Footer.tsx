import { Logo } from '../components/Logo';
import { LINKS } from '../content';

interface FooterProps {
  onManageAnalytics?: () => void;
}

const COLUMNS = [
  {
    title: 'product',
    links: [
      { label: 'Documentation', href: LINKS.docs },
      { label: 'First proxy', href: LINKS.firstProxy },
      { label: 'Installation', href: LINKS.installation },
      { label: 'Deployment', href: LINKS.deployment },
    ],
  },
  {
    title: 'community',
    links: [
      { label: 'GitHub', href: LINKS.github },
      { label: 'Discord', href: LINKS.discord },
      { label: 'Issues', href: LINKS.issues },
      { label: 'License', href: LINKS.license },
    ],
  },
];

export default function Footer({ onManageAnalytics }: FooterProps) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Logo href="#top" />
            <p>Self-hosted proxy management for you and your team.</p>
          </div>
          <div className="foot-cols">
            {COLUMNS.map((column) => (
              <div className="foot-col" key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map((link) => {
                    const external = link.href.startsWith('http');
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                  {column.title === 'community' && onManageAnalytics ? (
                    <li>
                      <button type="button" className="foot-btn" onClick={onManageAnalytics}>
                        Privacy choices
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Magpie · AGPL-3.0</span>
          <span>
            made by{' '}
            <a href={LINKS.author} target="_blank" rel="noopener noreferrer">
              Kuucheen
            </a>{' '}
            and contributors
          </span>
        </div>
      </div>
    </footer>
  );
}
