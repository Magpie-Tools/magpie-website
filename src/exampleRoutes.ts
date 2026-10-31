/* Example routes use documentation address ranges (RFC 5737, RFC 3849). */

const PORTS = [80, 1080, 3128, 4145, 8000, 8080, 8443, 8888, 9050];
const PREFIXES = ['192.0.2', '198.51.100', '203.0.113'];
const PROTOCOLS = ['http', 'https', 'socks4', 'socks5'];
const SOURCES = ['list', 'source', 'import', 'provider'];

export interface ExampleRoute {
  address: string;
  protocol: string;
  source: string;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function randomRoute(): ExampleRoute {
  const roll = Math.random();
  let address: string;
  if (roll < 0.1) {
    address = `[2001:db8::${Math.floor(Math.random() * 0xffff).toString(16)}]:${pick(PORTS)}`;
  } else if (roll < 0.18) {
    address = `gw${1 + Math.floor(Math.random() * 9)}.provider.example:${pick(PORTS)}`;
  } else {
    address = `${pick(PREFIXES)}.${1 + Math.floor(Math.random() * 254)}:${pick(PORTS)}`;
  }
  return { address, protocol: pick(PROTOCOLS), source: pick(SOURCES) };
}
