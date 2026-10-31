export const LINKS = {
  github: 'https://github.com/Magpie-Tools/magpie',
  docs: '/docs/',
  firstProxy: '/docs/learn/first-proxy',
  installation: '/docs/getting-started/installation',
  deployment: '/docs/operations/deployment',
  discord: 'https://discord.gg/7FWAGXzhkC',
  license: 'https://github.com/Magpie-Tools/magpie/blob/master/LICENSE',
  issues: 'https://github.com/Magpie-Tools/magpie/issues',
  author: 'https://github.com/Kuucheen',
} as const;

export type OperatingSystem = 'macos' | 'linux' | 'windows';

const UNIX_INSTALL =
  'curl -fsSL https://raw.githubusercontent.com/Magpie-Tools/magpie/refs/heads/master/scripts/install.sh | bash';
const WINDOWS_INSTALL =
  'iwr -useb https://raw.githubusercontent.com/Magpie-Tools/magpie/refs/heads/master/scripts/install.ps1 | iex';

export const INSTALL: Record<OperatingSystem, { label: string; command: string; prompt: string }> = {
  macos: { label: 'macOS', command: UNIX_INSTALL, prompt: '$' },
  linux: { label: 'Linux', command: UNIX_INSTALL, prompt: '$' },
  windows: { label: 'Windows', command: WINDOWS_INSTALL, prompt: 'PS>' },
};

export const OPERATING_SYSTEMS: OperatingSystem[] = ['macos', 'linux', 'windows'];

export function detectOperatingSystem(): OperatingSystem {
  if (typeof navigator === 'undefined') return 'linux';
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes('windows')) return 'windows';
  if (agent.includes('mac os') || agent.includes('macintosh')) return 'macos';
  return 'linux';
}

/* Keep in sync with the FAQPage JSON-LD in index.html. */
export const FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is Magpie?',
    answer:
      'Magpie is a self-hosted, multi-user proxy manager. It collects proxies from web sources and imports, checks which ones work, tracks their health and reputation, and serves the healthy ones through rotating proxy endpoints.',
  },
  {
    question: 'How do I install Magpie?',
    answer:
      'Run the one-command installer for macOS, Linux, or Windows PowerShell. It creates a magpie/ directory, generates credentials, and starts the stack with Docker Compose. You can also clone the repository and run Docker Compose yourself.',
  },
  {
    question: 'Does installing Magpie give me a working proxy pool?',
    answer:
      'No. Magpie manages the proxies you import or discover from sources you configure. It does not ship a proxy pool.',
  },
  {
    question: 'Which protocols are supported?',
    answer:
      'HTTP, HTTPS, SOCKS4, and SOCKS5 proxies. Rotating endpoints support TCP, QUIC, and HTTP/3 transports where applicable. IPv4, IPv6, and provider hostnames can be imported, checked, and rotated.',
  },
  {
    question: 'Can my team share one Magpie instance?',
    answer:
      'Yes. Accounts join workspaces with owner, admin, operator, or viewer roles. Workspaces own the proxies, rotating endpoints, and alert rules.',
  },
  {
    question: 'Why does PROXY_ENCRYPTION_KEY matter?',
    answer:
      'It encrypts proxy credentials stored in PostgreSQL. Keep it unchanged and backed up. If it changes or is lost, previously stored credentials cannot be decrypted.',
  },
  {
    question: 'Is Magpie open source?',
    answer: 'Yes. Magpie is licensed under the GNU Affero General Public License v3.0.',
  },
];
