import FlockCanvas from '../components/FlockCanvas';

export default function HowItWorks() {
  return (
    <section className="sec sec-plume flow" id="how-it-works" aria-labelledby="flow-title">
      <div className="wrap flow-head">
        <h2 id="flow-title" className="h2">
          From scraped list to working endpoint
        </h2>
        <p className="lead">
          Proxies stream in from your sources, the checker tests every one, and only the live ones are served
          behind a single rotating port.
        </p>
      </div>
      <div className="flow-stage">
        <FlockCanvas />
      </div>
    </section>
  );
}
