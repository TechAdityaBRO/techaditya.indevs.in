interface PagesContext {
  request: Request;
  params: {
    tool?: string;
  };
}

function isIpv4(input: string): boolean {
  const parts = input.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

function isIpAddress(input: string): boolean {
  if (isIpv4(input)) return true;
  return /^[0-9a-fA-F:]{2,45}$/.test(input) && input.includes(':');
}

function isPrivateOrBlockedIp(ip: string): boolean {
  if (!ip) return true;
  const cleaned = ip.replace(/^::ffff:/i, '').trim().toLowerCase();
  if (cleaned === '::1' || cleaned === '0:0:0:0:0:0:0:1' || cleaned === '::') return true;
  if (cleaned.startsWith('fe80:') || cleaned.startsWith('fc') || cleaned.startsWith('fd')) return true;
  if (isIpv4(cleaned)) {
    const [a, b] = cleaned.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

function sanitizeDomain(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/\.$/, '');
  if (!cleaned || cleaned.length > 253) return null;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned)) return null;
  return cleaned;
}

function sanitizePublicHttpUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProto);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      (isIpAddress(host) && isPrivateOrBlockedIp(host))
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'TechAditya-OSINT-Workbench/1.0',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status}`);
  }
  return res.json();
}

// Pure TypeScript MD5 for Gravatar lookup in Cloudflare Workers without nodejs_compat
function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << ((i % 4) * 8));
  }
  words[bytes.length >> 2] = (words[bytes.length >> 2] || 0) | (0x80 << ((bytes.length % 4) * 8));
  const bitLen = bytes.length * 8;
  const lenWords = (((bytes.length + 8) >>> 6) + 1) * 16;
  while (words.length < lenWords) words.push(0);
  words[lenWords - 2] = bitLen >>> 0;
  words[lenWords - 1] = Math.floor(bitLen / 0x100000000);

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let i = 0; i < lenWords; i += 16) {
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let j = 0; j < 64; j++) {
      let F = 0;
      let g = 0;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }
      const sum = (A + F + K[j] + (words[i + g] >>> 0)) >>> 0;
      const rotated = ((sum << s[j]) | (sum >>> (32 - s[j]))) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotated) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const toHex = (n: number) =>
    [0, 8, 16, 24]
      .map((shift) => ((n >>> shift) & 0xff).toString(16).padStart(2, '0'))
      .join('');
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const tool = String(context.params.tool || '').trim();
  const reqUrl = new URL(context.request.url);
  const target = String(reqUrl.searchParams.get('target') || '').trim();

  if (tool === 'ip') {
    const cfIp = context.request.headers.get('cf-connecting-ip') || '';
    const candidate = target || (cfIp && !isPrivateOrBlockedIp(cfIp) ? cfIp : '');
    if (candidate && !isIpAddress(candidate)) {
      return Response.json(
        { error: 'Enter a valid IPv4 or IPv6 address, or leave blank to inspect current edge IP.' },
        { status: 400 }
      );
    }
    try {
      const endpoint = candidate ? `https://ipwho.is/${encodeURIComponent(candidate)}` : 'https://ipwho.is/';
      const data = (await fetchJson(endpoint)) as Record<string, unknown>;
      if (data.success === false) {
        throw new Error(String(data.message || 'IP lookup failed'));
      }
      const conn = (data.connection as Record<string, unknown>) || {};
      const tz = (data.timezone as Record<string, unknown>) || {};
      return Response.json({
        ip: data.ip,
        type: data.type,
        location: [data.city, data.region, data.country].filter(Boolean).join(', '),
        countryCode: data.country_code,
        asn: conn.asn ? `AS${conn.asn}` : 'Unknown',
        org: conn.org || conn.isp || 'Unknown',
        timezone: tz.id || 'UTC',
        coordinates: `${data.latitude ?? '?'}, ${data.longitude ?? '?'}`,
        raw: data,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'IP lookup failed' }, { status: 502 });
    }
  }

  if (tool === 'dns') {
    const domain = sanitizeDomain(target);
    if (!domain) {
      return Response.json({ error: 'Enter a valid domain name (e.g. github.com).' }, { status: 400 });
    }
    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS'];
    try {
      const records = await Promise.all(
        recordTypes.map(async (type) => {
          const json = (await fetchJson(
            `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
          )) as { Answer?: Array<{ data: string; TTL: number }> };
          return {
            type,
            records: (json.Answer || []).map((a) => ({ data: a.data, ttl: a.TTL })),
          };
        })
      );
      return Response.json({ domain, records });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'DNS resolution failed' }, { status: 502 });
    }
  }

  if (tool === 'whois') {
    const domain = sanitizeDomain(target);
    if (!domain) {
      return Response.json({ error: 'Enter a valid domain name (e.g. google.com).' }, { status: 400 });
    }
    try {
      const data = (await fetchJson(`https://rdap.org/domain/${encodeURIComponent(domain)}`)) as {
        ldhName?: string;
        status?: string[];
        events?: Array<{ eventAction: string; eventDate: string }>;
        nameservers?: Array<{ ldhName: string }>;
        entities?: Array<{ roles?: string[]; vcardArray?: unknown[] }>;
      };
      const findEvent = (action: string) =>
        data.events?.find((e) => e.eventAction.toLowerCase().includes(action))?.eventDate || null;
      let registrar = 'Unknown';
      const registrarEntity = data.entities?.find((e) => e.roles?.includes('registrar'));
      if (registrarEntity && Array.isArray(registrarEntity.vcardArray) && Array.isArray(registrarEntity.vcardArray[1])) {
        const fnField = (registrarEntity.vcardArray[1] as Array<unknown>).find(
          (entry) => Array.isArray(entry) && entry[0] === 'fn'
        ) as Array<unknown> | undefined;
        if (fnField && typeof fnField[3] === 'string') {
          registrar = fnField[3];
        }
      }
      return Response.json({
        domain: data.ldhName || domain,
        registrar,
        registered: findEvent('registration'),
        expires: findEvent('expiration'),
        updated: findEvent('last changed'),
        status: data.status || [],
        nameservers: (data.nameservers || []).map((n) => n.ldhName),
        raw: data,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'RDAP lookup failed' }, { status: 502 });
    }
  }

  if (tool === 'subdomains') {
    const domain = sanitizeDomain(target);
    if (!domain) {
      return Response.json({ error: 'Enter a valid root domain (e.g. github.com).' }, { status: 400 });
    }
    try {
      const entries = (await fetchJson(
        `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
        10000
      )) as Array<{ name_value?: string }>;
      const unique = new Set<string>();
      for (const row of entries) {
        if (!row.name_value) continue;
        for (const name of row.name_value.split('\n')) {
          const cleaned = name.trim().toLowerCase().replace(/^\*\./, '');
          if (cleaned.endsWith(domain) && !cleaned.includes(' ')) {
            unique.add(cleaned);
          }
        }
      }
      const sorted = Array.from(unique).sort();
      return Response.json({
        domain,
        totalFound: sorted.length,
        subdomains: sorted.slice(0, 120),
      });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : 'Certificate transparency lookup timed out' },
        { status: 502 }
      );
    }
  }

  if (tool === 'headers') {
    const url = sanitizePublicHttpUrl(target);
    if (!url) {
      return Response.json({ error: 'Enter a valid public HTTP/HTTPS URL or domain.' }, { status: 400 });
    }
    try {
      const upstream = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'TechAditya-Header-Audit/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      const securityKeys = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'permissions-policy',
      ];
      const audit = securityKeys.map((key) => {
        const value = upstream.headers.get(key);
        return { header: key, present: Boolean(value), value: value || null };
      });
      const allHeaders: Record<string, string> = {};
      upstream.headers.forEach((v, k) => {
        allHeaders[k] = v;
      });
      const score = audit.filter((a) => a.present).length;
      return Response.json({
        url: upstream.url,
        status: upstream.status,
        server: upstream.headers.get('server') || 'Not disclosed',
        score: `${score}/${securityKeys.length}`,
        audit,
        headers: allHeaders,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Unable to fetch target headers' }, { status: 502 });
    }
  }

  if (tool === 'cms') {
    const url = sanitizePublicHttpUrl(target);
    if (!url) {
      return Response.json({ error: 'Enter a valid public URL or domain.' }, { status: 400 });
    }
    try {
      const upstream = await fetch(url.toString(), {
        redirect: 'follow',
        headers: { 'User-Agent': 'TechAditya-Tech-Detector/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      const html = (await upstream.text()).slice(0, 180000);
      const serverHeader = (upstream.headers.get('server') || '').toLowerCase();
      const poweredBy = (upstream.headers.get('x-powered-by') || '').toLowerCase();
      const detected: Array<{ name: string; category: string; evidence: string }> = [];
      const check = (cond: boolean, name: string, category: string, evidence: string) => {
        if (cond) detected.push({ name, category, evidence });
      };
      check(serverHeader.includes('cloudflare') || upstream.headers.has('cf-ray'), 'Cloudflare', 'CDN / Edge', 'Response header signature');
      check(serverHeader.includes('vercel') || upstream.headers.has('x-vercel-id'), 'Vercel', 'Hosting', 'Vercel edge header');
      check(serverHeader.includes('netlify') || upstream.headers.has('x-nf-request-id'), 'Netlify', 'Hosting', 'Netlify edge header');
      check(html.includes('wp-content/') || html.includes('wp-includes/') || /content="WordPress/i.test(html), 'WordPress', 'CMS', 'wp-content / generator signature');
      check(html.includes('__NEXT_DATA__') || html.includes('/_next/static'), 'Next.js', 'Framework', '__NEXT_DATA__ / _next assets');
      check(html.includes('astro-island') || html.includes('/_astro/'), 'Astro', 'Framework', 'Astro asset pattern');
      check(html.includes('cdn.shopify.com') || html.includes('Shopify.theme'), 'Shopify', 'E-Commerce', 'Shopify CDN & theme object');
      check(html.includes('data-wf-domain') || html.includes('webflow.com'), 'Webflow', 'Site Builder', 'Webflow DOM attributes');
      check(html.includes('wixstatic.com') || html.includes('X-Wix-'), 'Wix', 'Site Builder', 'Wix asset signature');
      check(html.includes('data-reactroot') || html.includes('__REACT_DEVTOOLS') || html.includes('/src/main.tsx'), 'React', 'UI Library', 'React bundle signature');
      check(poweredBy.includes('express'), 'Express', 'Backend', 'x-powered-by header');
      check(poweredBy.includes('php'), 'PHP', 'Runtime', 'x-powered-by header');
      const titleMatch = html.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
      return Response.json({
        url: upstream.url,
        status: upstream.status,
        pageTitle: titleMatch ? titleMatch[1].trim() : 'Untitled',
        server: upstream.headers.get('server') || 'Hidden',
        detected,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Unable to inspect website stack' }, { status: 502 });
    }
  }

  if (tool === 'expand') {
    const initialUrl = sanitizePublicHttpUrl(target);
    if (!initialUrl) {
      return Response.json({ error: 'Enter a valid short or redirect URL (e.g. https://bit.ly/...).' }, { status: 400 });
    }
    try {
      const hops: Array<{ step: number; url: string; status: number }> = [];
      let current = initialUrl.toString();
      for (let i = 1; i <= 10; i++) {
        const checked = sanitizePublicHttpUrl(current);
        if (!checked) break;
        const response = await fetch(checked.toString(), {
          method: 'HEAD',
          redirect: 'manual',
          headers: { 'User-Agent': 'TechAditya-URL-Expander/1.0' },
          signal: AbortSignal.timeout(5000),
        });
        hops.push({ step: i, url: checked.toString(), status: response.status });
        const location = response.headers.get('location');
        if (response.status >= 300 && response.status < 400 && location) {
          current = new URL(location, checked).toString();
        } else {
          break;
        }
      }
      return Response.json({
        originalUrl: initialUrl.toString(),
        finalUrl: hops[hops.length - 1]?.url || initialUrl.toString(),
        hopCount: hops.length,
        hops,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Redirect trace failed' }, { status: 502 });
    }
  }

  if (tool === 'mac') {
    const normalized = target.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (normalized.length < 6) {
      return Response.json(
        { error: 'Enter at least the first 6 hex characters (e.g. 00:1A:2B or 3C:22:FB:90:12:00).' },
        { status: 400 }
      );
    }
    try {
      const data = (await fetchJson(
        `https://api.maclookup.app/v2/macs/${encodeURIComponent(normalized.slice(0, 12))}`
      )) as Record<string, unknown>;
      return Response.json({
        mac: target.toUpperCase(),
        prefix: data.macPrefix || normalized.slice(0, 6),
        vendor: data.company || 'Unknown vendor',
        country: data.country || 'N/A',
        address: data.address || 'N/A',
        blockType: data.blockType || 'MA-L',
        raw: data,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'MAC lookup failed' }, { status: 502 });
    }
  }

  if (tool === 'email-breach') {
    const email = target.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    try {
      const upstream = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, {
        headers: { 'User-Agent': 'TechAditya-OSINT/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (upstream.status === 404) {
        return Response.json({ email, breached: false, breachCount: 0, breaches: [] });
      }
      if (!upstream.ok) {
        throw new Error(`Breach database returned ${upstream.status}`);
      }
      const data = (await upstream.json()) as { breaches?: string[][] | string[] };
      const flat = Array.isArray(data.breaches)
        ? data.breaches.flat().filter((v): v is string => typeof v === 'string')
        : [];
      return Response.json({ email, breached: flat.length > 0, breachCount: flat.length, breaches: flat });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Email breach check failed' }, { status: 502 });
    }
  }

  if (tool === 'email-osint') {
    const email = target.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const domain = email.split('@')[1];
    const md5 = md5Hex(email);
    try {
      const [mxRes, dispRes, gravRes] = await Promise.allSettled([
        fetchJson(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`),
        fetchJson(`https://open.kickbox.com/v1/disposable/${encodeURIComponent(domain)}`),
        fetch(`https://gravatar.com/${md5}.json`, { signal: AbortSignal.timeout(5000) }),
      ]);
      const mxAnswers =
        mxRes.status === 'fulfilled' && Array.isArray((mxRes.value as { Answer?: unknown[] }).Answer)
          ? ((mxRes.value as { Answer: Array<{ data: string }> }).Answer || []).map((a) => a.data)
          : [];
      const disposable =
        dispRes.status === 'fulfilled' ? Boolean((dispRes.value as { disposable?: boolean }).disposable) : null;
      let gravatarFound = false;
      let gravatarName: string | null = null;
      if (gravRes.status === 'fulfilled' && gravRes.value.ok) {
        gravatarFound = true;
        try {
          const gJson = (await gravRes.value.json()) as { entry?: Array<{ displayName?: string }> };
          gravatarName = gJson.entry?.[0]?.displayName || null;
        } catch {
          gravatarName = null;
        }
      }
      return Response.json({
        email,
        domain,
        mxValid: mxAnswers.length > 0,
        mxRecords: mxAnswers,
        disposable,
        gravatarFound,
        gravatarName,
        epieosUrl: `https://epieos.com/?q=${encodeURIComponent(email)}`,
      });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Email OSINT analysis failed' }, { status: 502 });
    }
  }

  if (tool === 'social') {
    const handle = target.replace(/^@/, '');
    if (!/^[a-zA-Z0-9_.-]{2,40}$/.test(handle)) {
      return Response.json(
        { error: 'Enter a valid handle (2–40 alphanumeric, dot, dash, or underscore characters).' },
        { status: 400 }
      );
    }
    const checks: Array<{
      platform: string;
      checkUrl: string;
      profileUrl: string;
      parseFound: (res: Response, body: unknown) => boolean;
    }> = [
      {
        platform: 'GitHub',
        checkUrl: `https://api.github.com/users/${encodeURIComponent(handle)}`,
        profileUrl: `https://github.com/${encodeURIComponent(handle)}`,
        parseFound: (r) => r.status === 200,
      },
      {
        platform: 'GitLab',
        checkUrl: `https://gitlab.com/api/v4/users?username=${encodeURIComponent(handle)}`,
        profileUrl: `https://gitlab.com/${encodeURIComponent(handle)}`,
        parseFound: (r, b) => r.ok && Array.isArray(b) && b.length > 0,
      },
      {
        platform: 'Dev.to',
        checkUrl: `https://dev.to/api/users/by_username?url=${encodeURIComponent(handle)}`,
        profileUrl: `https://dev.to/${encodeURIComponent(handle)}`,
        parseFound: (r) => r.status === 200,
      },
      {
        platform: 'Hacker News',
        checkUrl: `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(handle)}.json`,
        profileUrl: `https://news.ycombinator.com/user?id=${encodeURIComponent(handle)}`,
        parseFound: (r, b) => r.ok && b !== null && typeof b === 'object',
      },
      {
        platform: 'Lichess',
        checkUrl: `https://lichess.org/api/user/${encodeURIComponent(handle)}`,
        profileUrl: `https://lichess.org/@/${encodeURIComponent(handle)}`,
        parseFound: (r) => r.status === 200,
      },
      {
        platform: 'Chess.com',
        checkUrl: `https://api.chess.com/pub/player/${encodeURIComponent(handle.toLowerCase())}`,
        profileUrl: `https://www.chess.com/member/${encodeURIComponent(handle)}`,
        parseFound: (r) => r.status === 200,
      },
      {
        platform: 'Codeberg',
        checkUrl: `https://codeberg.org/api/v1/users/${encodeURIComponent(handle)}`,
        profileUrl: `https://codeberg.org/${encodeURIComponent(handle)}`,
        parseFound: (r) => r.status === 200,
      },
    ];

    const profiles = await Promise.all(
      checks.map(async (c) => {
        try {
          const upstream = await fetch(c.checkUrl, {
            headers: { 'User-Agent': 'TechAditya-Social-OSINT/1.0' },
            signal: AbortSignal.timeout(5500),
          });
          let parsed: unknown = null;
          if (upstream.headers.get('content-type')?.includes('application/json')) {
            parsed = await upstream.json().catch(() => null);
          }
          return {
            platform: c.platform,
            found: c.parseFound(upstream, parsed),
            url: c.profileUrl,
          };
        } catch {
          return { platform: c.platform, found: false, url: c.profileUrl, error: true };
        }
      })
    );

    return Response.json({
      username: handle,
      foundCount: profiles.filter((p) => p.found).length,
      totalChecked: profiles.length,
      profiles,
    });
  }

  return Response.json({ error: `Unknown OSINT tool: ${tool}` }, { status: 404 });
}
