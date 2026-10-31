import { FAQS, LINKS } from '../content';

export default function FAQ() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div>
          <h2 id="faq-title" className="h2">
            Questions
          </h2>
          <p className="lead">
            More in the <a href="/docs/faq">documentation FAQ</a> or on <a href={LINKS.discord}>Discord</a>.
          </p>
        </div>
        <div className="faq">
          {FAQS.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
