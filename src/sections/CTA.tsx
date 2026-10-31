import InstallCommand from '../components/InstallCommand';
import { LogoMark } from '../components/Logo';
import { LINKS } from '../content';

export default function CTA() {
  return (
    <section className="sec cta" aria-labelledby="cta-title">
      <LogoMark className="cta-mark" />
      <div className="wrap cta-grid">
        <div>
          <h2 id="cta-title" className="h2">
            Take flight
          </h2>
          <p className="lead">
            Run Magpie on your own machine in a few minutes, then follow the{' '}
            <a className="cta-link" href={LINKS.firstProxy}>
              first proxy guide
            </a>
            .
          </p>
        </div>
        <InstallCommand id="cta-install" />
      </div>
    </section>
  );
}
