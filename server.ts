import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

function isPrivateOrBlockedIp(ip: string): boolean {
  if (!ip) return true;
  const cleaned = ip.replace(/^::ffff:/i, '').trim();
  if (cleaned === '::1' || cleaned === '0:0:0:0:0:0:0:1' || cleaned === '::') return true;
  if (cleaned.toLowerCase().startsWith('fe80:') || cleaned.toLowerCase().startsWith('fc') || cleaned.toLowerCase().startsWith('fd')) {
    return true;
  }
  const parts = cleaned.split('.').map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
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
      (net.isIP(host) !== 0 && isPrivateOrBlockedIp(host))
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function fetchJsonWithTimeout(url: string, headers: Record<string, string> = {}, timeoutMs = 8000): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'TechAditya-OSINT-Workbench/1.0',
      Accept: 'application/json',
      ...headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status}`);
  }
  return res.json();
}

// In-memory cache for GitHub profile + repos (5 minutes TTL)
interface CacheEntry {
  expiresAt: number;
  data: unknown;
}
const apiCache = new Map<string, CacheEntry>();

app.get('/api/github/:username', async (req: Request, res: Response) => {
  const username = String(req.params.username || '').trim();
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    res.status(400).json({ error: 'Invalid GitHub username' });
    return;
  }

  const cacheKey = `gh:${username.toLowerCase()}`;
  const cached = apiCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    res.json(cached.data);
    return;
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TechAditya-Portfolio',
    };
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        signal: AbortSignal.timeout(7000),
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`, {
        headers,
        signal: AbortSignal.timeout(7000),
      }),
    ]);

    if (!profileRes.ok) {
      throw new Error(`GitHub profile API returned ${profileRes.status}`);
    }

    const profile = (await profileRes.json()) as Record<string, unknown>;
    const rawRepos = reposRes.ok ? ((await reposRes.json()) as Array<Record<string, unknown>>) : [];

    const languageCounts = new Map<string, number>();
    const repos = rawRepos
      .filter((r) => !r.fork)
      .slice(0, 6)
      .map((r) => {
        if (typeof r.language === 'string' && r.language) {
          languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
        }
        return {
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          updatedAt: r.updated_at,
        };
      });

    for (const r of rawRepos.slice(6)) {
      if (typeof r.language === 'string' && r.language) {
        languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
      }
    }

    const totalLangRepos = Array.from(languageCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const languages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalLangRepos) * 100),
      }));

    const payload = {
      login: profile.login,
      name: profile.name || profile.login,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      htmlUrl: profile.html_url,
      publicRepos: Number(profile.public_repos ?? 0),
      followers: Number(profile.followers ?? 0),
      following: Number(profile.following ?? 0),
      createdAt: profile.created_at,
      languages,
      repos,
    };

    apiCache.set(cacheKey, { expiresAt: Date.now() + 5 * 60 * 1000, data: payload });
    res.json(payload);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Unable to fetch GitHub activity',
    });
  }
});

// 1. IP Intelligence
app.get('/api/osint/ip', async (req: Request, res: Response) => {
  const queryIp = String(req.query.target || '').trim();
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const candidate = queryIp || (forwarded && !isPrivateOrBlockedIp(forwarded) ? forwarded : '');

  if (candidate && net.isIP(candidate) === 0) {
    res.status(400).json({ error: 'Enter a valid IPv4 or IPv6 address, or leave blank to inspect current edge IP.' });
    return;
  }

  try {
    const endpoint = candidate ? `https://ipwho.is/${encodeURIComponent(candidate)}` : 'https://ipwho.is/';
    const data = (await fetchJsonWithTimeout(endpoint)) as Record<string, unknown>;
    if (data.success === false) {
      throw new Error(String(data.message || 'IP lookup failed'));
    }
    const conn = (data.connection as Record<string, unknown>) || {};
    const tz = (data.timezone as Record<string, unknown>) || {};
    res.json({
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
    res.status(502).json({ error: err instanceof Error ? err.message : 'IP lookup failed' });
  }
});

// 2. DNS Lookup (A, AAAA, MX, TXT, NS)
app.get('/api/osint/dns', async (req: Request, res: Response) => {
  const domain = sanitizeDomain(String(req.query.target || ''));
  if (!domain) {
    res.status(400).json({ error: 'Enter a valid domain name (e.g. github.com).' });
    return;
  }

  const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS'];
  try {
    const results = await Promise.all(
      recordTypes.map(async (type) => {
        const json = (await fetchJsonWithTimeout(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
        )) as { Answer?: Array<{ data: string; TTL: number }> };
        return {
          type,
          records: (json.Answer || []).map((a) => ({ data: a.data, ttl: a.TTL })),
        };
      })
    );
    res.json({ domain, records: results });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'DNS resolution failed' });
  }
});

// 3. WHOIS via RDAP
app.get('/api/osint/whois', async (req: Request, res: Response) => {
  const domain = sanitizeDomain(String(req.query.target || ''));
  if (!domain) {
    res.status(400).json({ error: 'Enter a valid domain name (e.g. google.com).' });
    return;
  }

  try {
    const data = (await fetchJsonWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`)) as {
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

    res.json({
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
    res.status(502).json({ error: err instanceof Error ? err.message : 'RDAP lookup failed' });
  }
});

// 4. Subdomain Checker via crt.sh
app.get('/api/osint/subdomains', async (req: Request, res: Response) => {
  const domain = sanitizeDomain(String(req.query.target || ''));
  if (!domain) {
    res.status(400).json({ error: 'Enter a valid root domain (e.g. github.com).' });
    return;
  }

  try {
    const entries = (await fetchJsonWithTimeout(
      `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      {},
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
    res.json({
      domain,
      totalFound: sorted.length,
      subdomains: sorted.slice(0, 120),
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Certificate transparency lookup timed out' });
  }
});

// 5. Security Header Scanner
app.get('/api/osint/headers', async (req: Request, res: Response) => {
  const url = sanitizePublicHttpUrl(String(req.query.target || ''));
  if (!url) {
    res.status(400).json({ error: 'Enter a valid public HTTP/HTTPS URL or domain.' });
    return;
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
      return {
        header: key,
        present: Boolean(value),
        value: value || null,
      };
    });

    const allHeaders: Record<string, string> = {};
    upstream.headers.forEach((v, k) => {
      allHeaders[k] = v;
    });

    const score = audit.filter((a) => a.present).length;
    res.json({
      url: upstream.url,
      status: upstream.status,
      server: upstream.headers.get('server') || 'Not disclosed',
      score: `${score}/${securityKeys.length}`,
      audit,
      headers: allHeaders,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Unable to fetch target headers' });
  }
});

// 6. Site Builder / Tech Stack Detector
app.get('/api/osint/cms', async (req: Request, res: Response) => {
  const url = sanitizePublicHttpUrl(String(req.query.target || ''));
  if (!url) {
    res.status(400).json({ error: 'Enter a valid public URL or domain.' });
    return;
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

    res.json({
      url: upstream.url,
      status: upstream.status,
      pageTitle: titleMatch ? titleMatch[1].trim() : 'Untitled',
      server: upstream.headers.get('server') || 'Hidden',
      detected,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Unable to inspect website stack' });
  }
});

// 7. URL Expander (hop-by-hop redirect tracer)
app.get('/api/osint/expand', async (req: Request, res: Response) => {
  const initialUrl = sanitizePublicHttpUrl(String(req.query.target || ''));
  if (!initialUrl) {
    res.status(400).json({ error: 'Enter a valid short or redirect URL (e.g. https://bit.ly/...).' });
    return;
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

    res.json({
      originalUrl: initialUrl.toString(),
      finalUrl: hops[hops.length - 1]?.url || initialUrl.toString(),
      hopCount: hops.length,
      hops,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Redirect trace failed' });
  }
});

// 8. MAC Vendor Lookup
app.get('/api/osint/mac', async (req: Request, res: Response) => {
  const raw = String(req.query.target || '').trim();
  const normalized = raw.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (normalized.length < 6) {
    res.status(400).json({ error: 'Enter at least the first 6 hex characters (e.g. 00:1A:2B or 3C:22:FB:90:12:00).' });
    return;
  }

  try {
    const data = (await fetchJsonWithTimeout(
      `https://api.maclookup.app/v2/macs/${encodeURIComponent(normalized.slice(0, 12))}`
    )) as Record<string, unknown>;
    res.json({
      mac: raw.toUpperCase(),
      prefix: data.macPrefix || normalized.slice(0, 6),
      vendor: data.company || 'Unknown vendor',
      country: data.country || 'N/A',
      address: data.address || 'N/A',
      blockType: data.blockType || 'MA-L',
      raw: data,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'MAC lookup failed' });
  }
});

// 9. Email Breach Lookup (XposedOrNot)
app.get('/api/osint/email-breach', async (req: Request, res: Response) => {
  const email = String(req.query.target || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  try {
    const upstream = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, {
      headers: { 'User-Agent': 'TechAditya-OSINT/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (upstream.status === 404) {
      res.json({ email, breached: false, breachCount: 0, breaches: [] });
      return;
    }
    if (!upstream.ok) {
      throw new Error(`Breach database returned ${upstream.status}`);
    }
    const data = (await upstream.json()) as { breaches?: string[][] | string[] };
    const flat = Array.isArray(data.breaches)
      ? data.breaches.flat().filter((v): v is string => typeof v === 'string')
      : [];
    res.json({
      email,
      breached: flat.length > 0,
      breachCount: flat.length,
      breaches: flat,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Email breach check failed' });
  }
});

// 10. Email OSINT (MX, Disposable, Gravatar)
app.get('/api/osint/email-osint', async (req: Request, res: Response) => {
  const email = String(req.query.target || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  const domain = email.split('@')[1];
  const md5 = crypto.createHash('md5').update(email).digest('hex');

  try {
    const [mxRes, dispRes, gravRes] = await Promise.allSettled([
      fetchJsonWithTimeout(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`),
      fetchJsonWithTimeout(`https://open.kickbox.com/v1/disposable/${encodeURIComponent(domain)}`),
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

    res.json({
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
    res.status(502).json({ error: err instanceof Error ? err.message : 'Email OSINT analysis failed' });
  }
});

// 11. Social Profile Finder
app.get('/api/osint/social', async (req: Request, res: Response) => {
  const handle = String(req.query.target || '').trim().replace(/^@/, '');
  if (!/^[a-zA-Z0-9_.-]{2,40}$/.test(handle)) {
    res.status(400).json({ error: 'Enter a valid handle (2–40 alphanumeric, dot, dash, or underscore characters).' });
    return;
  }

  const checks: Array<{
    platform: string;
    checkUrl: string;
    profileUrl: string;
    parseFound: (res: globalThis.Response, body: unknown) => boolean;
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

  const results = await Promise.all(
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
        return {
          platform: c.platform,
          found: false,
          url: c.profileUrl,
          error: true,
        };
      }
    })
  );

  res.json({
    username: handle,
    foundCount: results.filter((r) => r.found).length,
    totalChecked: results.length,
    profiles: results,
  });
});

async function startServer() {
  app.use((req, _res, next) => {
    if (req.path === '/brogang.html' || req.path === '/d1m.html') {
      req.url = '/';
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
