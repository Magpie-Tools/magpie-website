import { Fragment } from 'react';
import Frame from '../components/Frame';

const ROWS: { label: string; values: string[] }[] = [
  { label: 'protocols', values: ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'] },
  { label: 'transports', values: ['TCP', 'QUIC', 'HTTP/3'] },
  { label: 'routes', values: ['IPv4', 'IPv6', 'provider hostnames', 'credentials'] },
  { label: 'reputation', values: ['good', 'neutral', 'poor'] },
  { label: 'organize', values: ['tags', 'search', 'filters', 'exports', 'blacklists'] },
  { label: 'roles', values: ['owner', 'admin', 'operator', 'viewer'] },
  { label: 'alerts', values: ['email', 'Slack', 'Discord', 'webhook'] },
  { label: 'API', values: ['REST', 'GraphQL'] },
  { label: 'runs on', values: ['Docker Compose', 'PostgreSQL', 'Redis'] },
];

export default function Capabilities() {
  return (
    <section className="sec sec-tint" aria-labelledby="cap-title">
      <div className="wrap cap-grid">
        <div>
          <span className="kicker">Under the hood</span>
          <h2 id="cap-title" className="h2">
            Built for pools of millions
          </h2>
          <p className="p">
            A Go backend schedules checks through Redis and keeps PostgreSQL as the system of record, with proxy
            credentials encrypted at rest. Run one instance for yourself or share it across a team.
          </p>
          <p className="link-row">
            <a href="/docs/backend/">How the backend works</a>
            <a href="/docs/reference/architecture">Architecture</a>
          </p>
        </div>
        <Frame caption="magpie · capabilities" captionEnd="AGPL-3.0">
          <table className="spec">
            <caption className="sr-only">Magpie capabilities</caption>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    {row.values.map((value, index) => (
                      <Fragment key={value}>
                        {index > 0 ? (
                          <>
                            {' '}
                            <span className="sep" aria-hidden="true">
                              ·
                            </span>{' '}
                          </>
                        ) : null}
                        <span className="nw">{value}</span>
                        {index < row.values.length - 1 ? <span className="sr-only">, </span> : null}
                      </Fragment>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Frame>
      </div>
    </section>
  );
}
