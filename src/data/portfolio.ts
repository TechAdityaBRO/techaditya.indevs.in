export interface FeaturedProject {
  id: string;
  title: string;
  category: string;
  stack: string;
  year: string;
  summary: string;
  architecture: string[];
  url: string;
  image: string;
  imageAlt: string;
}

export interface DirectoryProject {
  name: string;
  url: string;
  displayUrl: string;
  category: string;
  description: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
}

export type OsintToolId =
  | 'ip'
  | 'dns'
  | 'whois'
  | 'subdomains'
  | 'headers'
  | 'cms'
  | 'expand'
  | 'mac'
  | 'email-breach'
  | 'email-osint'
  | 'social';

export interface OsintToolConfig {
  id: OsintToolId;
  name: string;
  group: 'Network' | 'Web' | 'Identity';
  description: string;
  placeholder: string;
  defaultTarget: string;
  endpoint: string;
  requiresTarget: boolean;
  actionLabel: string;
}

export const HERO_MEDIA = {
  image: '/src/assets/images/hero_developer_workspace_1794909230550.jpg',
  alt: 'Minimalist software engineering desk setup at night with dark matte surfaces and cobalt ambient lighting',
};

export const KEY_METRICS = [
  { value: '2022', label: 'Founded BRO GANG' },
  { value: '38', label: 'Community members' },
  { value: '11', label: 'Live OSINT utilities' },
  { value: '7+', label: 'Open-source builds' },
];

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'pglove',
    title: 'PGlove',
    category: 'Desktop Browser',
    stack: 'Rust · Tauri 2 · WebView2',
    year: '2025',
    summary:
      'An experimental desktop browser built with Tauri 2. Engineered for low memory overhead, rapid startup, and an uncluttered browsing surface.',
    architecture: [
      'Rust core process paired with native WebView2 rendering for minimal RAM footprint.',
      'Zero background telemetry services or bundled bloatware extensions.',
      'Keyboard-driven navigation workflows built for daily developer use.',
    ],
    url: 'https://pglove.jo3.org',
    image: '/src/assets/images/project_pglove_browser_1794909230200.jpg',
    imageAlt: 'Minimalist brushed gunmetal desktop browser hardware frame on dark background',
  },
  {
    id: 'aicli',
    title: 'Bro Gang AI CLI',
    category: 'Terminal Agent',
    stack: 'TypeScript · Llama 3.3 70B · Cloudflare Workers',
    year: '2025',
    summary:
      'A free-forever AI coding agent for the terminal. Zero API key setup and zero signup friction, routed through edge inference on Cloudflare Workers.',
    architecture: [
      'Runs directly in local shell workflows for code generation, refactoring, and debugging.',
      'Backed by Llama 3.3 70B inference hosted across Cloudflare edge workers.',
      'Lightweight TypeScript CLI distribution with instant streaming responses.',
    ],
    url: 'https://brogangaicli.pages.dev/',
    image: '/src/assets/images/project_aicli_terminal_1794909231152.jpg',
    imageAlt: 'Smoked glass monolith with geometric grid lines and cobalt beam on obsidian slate',
  },
  {
    id: 'nexa',
    title: 'Nexa Search',
    category: 'Search Engine',
    stack: 'JavaScript · Edge Routing · Zero Tracking',
    year: '2024',
    summary:
      'A privacy-first search engine built to return pure signal—no ad injection in results, no tracking pixels, and no behavioral profiling.',
    architecture: [
      'Stateless query execution with zero user cookies or search history persistence.',
      'Clean, fast result parsing focused on technical documentation and direct sources.',
      'Hosted on global edge infrastructure for sub-second query turnaround.',
    ],
    url: 'https://nexasearch.pages.dev/',
    image: '/src/assets/images/project_nexa_search_1794909232509.jpg',
    imageAlt: 'Precision optical glass prism refracting white and cobalt light across matte charcoal surface',
  },
  {
    id: 'proai',
    title: 'Pro AI & BRO GANG',
    category: 'Platform · Community',
    stack: 'Gemini 2.5 Pro · Cloudflare Workers · Web',
    year: '2022–2026',
    summary:
      'The flagship software collective and AI workspace connecting 38 builders, gamers, and designers across BRO GANG and D1M Studios.',
    architecture: [
      'Unified web portal linking community servers, AI experiments, and developer tools.',
      'Integrates Gemini 2.5 Pro workflows with community-run Cloudflare Workers.',
      'Active collaboration hub bridging engineering and design with Darshil (D1M Studios).',
    ],
    url: 'https://brogang.techaditya.workers.dev',
    image: '/src/assets/images/project_proai_studio_1794909232067.jpg',
    imageAlt: 'Dark anodized titanium geometric lattice sculpture under directional studio light',
  },
];

export const ALL_PROJECTS: DirectoryProject[] = [
  {
    name: 'PGlove',
    url: 'https://pglove.jo3.org',
    displayUrl: 'pglove.jo3.org',
    category: 'Browser',
    description: 'Lightweight desktop browser built with Tauri 2 and Rust',
  },
  {
    name: 'BRO GANG',
    url: 'https://brogang.techaditya.workers.dev',
    displayUrl: 'brogang.techaditya.workers.dev',
    category: 'Community',
    description: 'Independent developer and creator collective of 38 members',
  },
  {
    name: 'Bro Gang AI CLI',
    url: 'https://brogangaicli.pages.dev/',
    displayUrl: 'brogangaicli.pages.dev',
    category: 'AI · CLI',
    description: 'Zero-config terminal coding agent powered by Llama 3.3 70B',
  },
  {
    name: 'Nexa Search',
    url: 'https://nexasearch.pages.dev/',
    displayUrl: 'nexasearch.pages.dev',
    category: 'Search',
    description: 'Privacy-first search engine with zero ads or tracking',
  },
  {
    name: 'CODEWEBSITE',
    url: 'https://code.oops.wtf',
    displayUrl: 'code.oops.wtf',
    category: 'Playground',
    description: 'Browser-based code sandbox for rapid web prototyping',
  },
  {
    name: 'TickTackToe',
    url: 'https://ticktacktoe.site.je',
    displayUrl: 'ticktacktoe.site.je',
    category: 'Web Game',
    description: 'Minimalist browser tic-tac-toe experience',
  },
  {
    name: 'BroGangMC',
    url: 'https://brogangmc.minefort.com',
    displayUrl: 'brogangmc.minefort.com',
    category: 'Gaming',
    description: 'Community Minecraft survival multiplayer server',
  },
];

export const VIDEOS: VideoItem[] = [
  {
    id: 'lo3fC0ZkDc8',
    title: 'Bro Gang SMP',
    category: 'Minecraft · BRO GANG',
    duration: 'Showcase',
    description: 'Inside our community Minecraft survival multiplayer server.',
  },
  {
    id: '6ZvRoPs4BkI',
    title: 'Speed Tester',
    category: 'Short · Demo',
    duration: 'Demo',
    description: 'Quick walkthrough of the network speed tester utility.',
  },
  {
    id: 'jasPPPTPy1Q',
    title: 'Bro Gang AI CLI',
    category: 'Short · AI · CLI',
    duration: 'Demo',
    description: 'Free AI coding agent running directly inside the terminal.',
  },
  {
    id: 'edev5DkwGW8',
    title: 'Old Logo',
    category: 'Archive · Legacy',
    duration: 'Archive',
    description: 'The original BRO GANG identity before the studio redesign.',
  },
];

export const OSINT_TOOLS: OsintToolConfig[] = [
  {
    id: 'ip',
    name: 'IP Intelligence',
    group: 'Network',
    description: 'Inspect geolocation, ASN, ISP, and coordinates for an IPv4/IPv6 address or your current edge IP.',
    placeholder: 'Leave blank for your edge IP, or enter e.g. 1.1.1.1',
    defaultTarget: '1.1.1.1',
    endpoint: '/api/osint/ip',
    requiresTarget: false,
    actionLabel: 'Run IP Scan',
  },
  {
    id: 'dns',
    name: 'DNS Lookup',
    group: 'Network',
    description: 'Resolve live A, AAAA, MX, TXT, and NS records directly via DNS-over-HTTPS.',
    placeholder: 'e.g. github.com',
    defaultTarget: 'github.com',
    endpoint: '/api/osint/dns',
    requiresTarget: true,
    actionLabel: 'Resolve Records',
  },
  {
    id: 'whois',
    name: 'WHOIS (RDAP)',
    group: 'Network',
    description: 'Query structured RDAP registration dates, registrar identity, EPP statuses, and nameservers.',
    placeholder: 'e.g. google.com',
    defaultTarget: 'google.com',
    endpoint: '/api/osint/whois',
    requiresTarget: true,
    actionLabel: 'Query RDAP',
  },
  {
    id: 'subdomains',
    name: 'Subdomain Finder',
    group: 'Network',
    description: 'Enumerate SSL/TLS certificate transparency logs from crt.sh to discover subdomains.',
    placeholder: 'e.g. cloudflare.com',
    defaultTarget: 'indevs.in',
    endpoint: '/api/osint/subdomains',
    requiresTarget: true,
    actionLabel: 'Enumerate Subdomains',
  },
  {
    id: 'headers',
    name: 'Security Headers',
    group: 'Web',
    description: 'Audit HSTS, CSP, X-Frame-Options, Referrer-Policy, and server disclosure headers.',
    placeholder: 'e.g. https://github.com',
    defaultTarget: 'https://techaditya.indevs.in',
    endpoint: '/api/osint/headers',
    requiresTarget: true,
    actionLabel: 'Audit Headers',
  },
  {
    id: 'cms',
    name: 'Tech & CMS Detector',
    group: 'Web',
    description: 'Fingerprint frameworks, hosting edges, CDNs, and CMS signatures from live markup.',
    placeholder: 'e.g. https://wordpress.org',
    defaultTarget: 'https://wordpress.org',
    endpoint: '/api/osint/cms',
    requiresTarget: true,
    actionLabel: 'Detect Stack',
  },
  {
    id: 'expand',
    name: 'URL Expander',
    group: 'Web',
    description: 'Trace HTTP 3xx redirect chains hop-by-hop server-side to uncover the true destination.',
    placeholder: 'e.g. https://github.com',
    defaultTarget: 'http://github.com',
    endpoint: '/api/osint/expand',
    requiresTarget: true,
    actionLabel: 'Trace Redirects',
  },
  {
    id: 'mac',
    name: 'MAC Vendor Lookup',
    group: 'Web',
    description: 'Identify hardware manufacturer, OUI prefix, and registration block from a MAC address.',
    placeholder: 'e.g. 00:1A:2B or 3C:22:FB',
    defaultTarget: '3C:22:FB',
    endpoint: '/api/osint/mac',
    requiresTarget: true,
    actionLabel: 'Lookup Vendor',
  },
  {
    id: 'email-breach',
    name: 'Email Breach Check',
    group: 'Identity',
    description: 'Check whether an email address appears in indexed public data breaches via XposedOrNot.',
    placeholder: 'e.g. test@example.com',
    defaultTarget: 'test@example.com',
    endpoint: '/api/osint/email-breach',
    requiresTarget: true,
    actionLabel: 'Check Breaches',
  },
  {
    id: 'email-osint',
    name: 'Email OSINT',
    group: 'Identity',
    description: 'Verify domain MX records, disposable provider status, Gravatar profile, and Epieos link.',
    placeholder: 'e.g. chairmanaditya@brogang.jo3.org',
    defaultTarget: 'chairmanaditya@brogang.jo3.org',
    endpoint: '/api/osint/email-osint',
    requiresTarget: true,
    actionLabel: 'Analyze Email',
  },
  {
    id: 'social',
    name: 'Social Profile Finder',
    group: 'Identity',
    description: 'Check public username presence across GitHub, GitLab, Dev.to, Hacker News, Lichess, Chess.com, and Codeberg.',
    placeholder: 'e.g. TechAdityaBRO',
    defaultTarget: 'TechAdityaBRO',
    endpoint: '/api/osint/social',
    requiresTarget: true,
    actionLabel: 'Scan Profiles',
  },
];

export const CONTACT_INFO = {
  email: 'chairmanaditya@brogang.jo3.org',
  discord: 'https://discord.gg/TSWg34Zets',
  github: 'https://github.com/TechAdityaBRO',
  brogangGithub: 'https://github.com/BRO-GANG',
  x: 'https://x.com/ProGroupBroGang',
  instagram: 'https://www.instagram.com/progroup_24',
  brogangSite: 'https://brogang.techaditya.workers.dev',
};
