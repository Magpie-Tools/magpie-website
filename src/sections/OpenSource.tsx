import { LINKS } from '../content';

const MARKS = [
  { name: 'magpie', description: 'Install, Compose, updates', href: LINKS.github },
  { name: 'magpie-backend', description: 'Go API, checker, rotation', href: 'https://github.com/Magpie-Tools/magpie-backend' },
  { name: 'magpie-frontend', description: 'Angular dashboard', href: 'https://github.com/Magpie-Tools/magpie-frontend' },
  { name: 'magpie-docs', description: 'Guides and API reference', href: 'https://github.com/Magpie-Tools/magpie-docs' },
  { name: 'discord', description: 'Questions and discussion', href: LINKS.discord },
  { name: 'issues', description: 'Report a bug', href: LINKS.issues },
];

export default function OpenSource() {
  return (
    <section className="sec sec-plume" aria-labelledby="oss-title">
      <div className="wrap os-grid">
        <div>
          <span className="kicker">Open source · AGPL-3.0</span>
          <h2 id="oss-title" className="os-big">
            Your proxies, your servers, your code to read.
          </h2>
          <p className="lead">
            There is no hosted service and no account to create. You run the whole stack, and every line of it is on
            GitHub.
          </p>
        </div>
        <ul className="marks" aria-label="Repositories and community">
          {MARKS.map((mark) => (
            <li key={mark.name}>
              <a className="mark" href={mark.href} target="_blank" rel="noopener noreferrer">
                <span className="mark-n">{mark.name} ↗</span>
                <span className="mark-d">{mark.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
