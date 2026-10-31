import FlockCanvas from '../components/FlockCanvas';
import InstallCommand from '../components/InstallCommand';
import { Logo } from '../components/Logo';
import { LINKS } from '../content';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <header className="wrap head">
        <Logo />
        <nav className="nav" aria-label="Main">
          <a className="nav-hide" href="#how-it-works">
            How it works
          </a>
          <a href={LINKS.docs}>Docs</a>
          <a className="btn btn-cream btn-sm" href={LINKS.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <div className="wrap hero-copy">
        <h1 id="hero-title" className="h1">
          Collect, check and rotate <br />
          proxies on your own servers
        </h1>
        <p className="hero-sub">
          Magpie gathers proxies from sources and imports, keeps checking which ones work, and serves the healthy
          ones through stable rotating endpoints. Open source, multi-user, and self-hosted with Docker Compose.
        </p>
        <InstallCommand id="hero-install" />
        <p className="install-note">
          Needs Docker. Read the <a href={LINKS.installation}>installation guide</a> before exposing Magpie publicly.
        </p>
      </div>

      <FlockCanvas />
    </section>
  );
}
