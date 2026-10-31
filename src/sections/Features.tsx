import CheckIllustration from '../illustrations/CheckIllustration';
import RotateIllustration from '../illustrations/RotateIllustration';
import ScrapeIllustration from '../illustrations/ScrapeIllustration';

export default function Features() {
  return (
    <section className="sec" id="features" aria-label="What Magpie does">
      <div className="wrap feat-grid">
        <article className="feat-col">
          <ScrapeIllustration />
          <h2 className="h3">Collect from anywhere</h2>
          <p className="p">
            Scrape public sources on a schedule, or import lists and provider endpoints. IPv4, IPv6, and hostnames
            all work.
          </p>
        </article>
        <article className="feat-col">
          <CheckIllustration />
          <h2 className="h3">Checked around the clock</h2>
          <p className="p">
            Continuous HTTP, HTTPS, SOCKS4, and SOCKS5 checks with rules per tag. Health, latency, uptime, and
            reputation are tracked for every route.
          </p>
        </article>
        <article className="feat-col">
          <RotateIllustration />
          <h2 className="h3">One endpoint, healthy upstreams</h2>
          <p className="p">
            Rotating proxies pick a healthy upstream for each request, filtered by reputation and uptime, over TCP,
            QUIC, or HTTP/3.
          </p>
        </article>
      </div>
    </section>
  );
}
