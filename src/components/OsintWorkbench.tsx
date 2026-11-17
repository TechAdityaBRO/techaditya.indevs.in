import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Play,
  Search,
  Shield,
  Terminal,
  UserCheck,
} from 'lucide-react';
import { OSINT_TOOLS, type OsintToolConfig, type OsintToolId } from '../data/portfolio';
import { uiSound } from '../utils/sound';

type ViewMode = 'structured' | 'json';

const GROUPS: Array<OsintToolConfig['group']> = ['Network', 'Web', 'Identity'];

export function OsintWorkbench() {
  const [selectedId, setSelectedId] = useState<OsintToolId>('dns');
  const [targets, setTargets] = useState<Record<OsintToolId, string>>(() => {
    const initial = {} as Record<OsintToolId, string>;
    for (const tool of OSINT_TOOLS) {
      initial[tool.id] = tool.defaultTarget;
    }
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('structured');
  const [copied, setCopied] = useState(false);

  const activeTool = OSINT_TOOLS.find((t) => t.id === selectedId) || OSINT_TOOLS[0];
  const currentTarget = targets[activeTool.id] ?? '';

  const selectTool = (tool: OsintToolConfig) => {
    uiSound.play('switch');
    setSelectedId(tool.id);
    setError(null);
    setResult(null);
  };

  const runScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = currentTarget.trim();
    if (activeTool.requiresTarget && !val) {
      uiSound.play('error');
      setError('Please enter a target value before running this scan.');
      return;
    }

    uiSound.play('scan');
    setLoading(true);
    setError(null);
    try {
      const url = val
        ? `${activeTool.endpoint}?target=${encodeURIComponent(val)}`
        : activeTool.endpoint;
      const res = await fetch(url);
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(String(json.error || `Request failed with status ${res.status}`));
      }
      setResult(json);
      uiSound.play('success');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Scan failed');
      uiSound.play('error');
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      uiSound.play('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      uiSound.play('error');
    }
  };

  const groupIcon = (group: OsintToolConfig['group']) => {
    if (group === 'Network') return <Globe className="h-3.5 w-3.5 text-zinc-400" />;
    if (group === 'Web') return <Shield className="h-3.5 w-3.5 text-zinc-400" />;
    return <UserCheck className="h-3.5 w-3.5 text-zinc-400" />;
  };

  return (
    <section id="osint" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-white/10">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs text-zinc-400 tabular-nums">02 · Playground</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
            Live OSINT Workbench
          </h2>
        </div>
        <p className="max-w-lg text-sm text-zinc-400">
          Eleven real reconnaissance utilities executed server-side with zero third-party CORS proxy drops.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left tool rail */}
        <aside
          aria-label="OSINT tools"
          className="rounded-2xl border border-white/10 bg-[#0E0E12] p-4 lg:col-span-4"
        >
          <div className="space-y-5">
            {GROUPS.map((group) => {
              const items = OSINT_TOOLS.filter((t) => t.group === group);
              return (
                <div key={group}>
                  <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold text-zinc-400">
                    {groupIcon(group)}
                    <span>{group}</span>
                  </div>
                  <div className="space-y-1">
                    {items.map((tool) => {
                      const active = tool.id === activeTool.id;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => selectTool(tool)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                            active
                              ? 'bg-[#2563EB]/20 text-white font-medium border border-[#3B82F6]/40'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                          }`}
                        >
                          <span className="truncate">{tool.name}</span>
                          {active ? (
                            <span className="font-mono text-[11px] text-[#60A5FA] shrink-0">Active</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right execution & inspector panel */}
        <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-6 lg:col-span-8">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{activeTool.group}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{activeTool.endpoint}</span>
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-white">{activeTool.name}</h3>
              <p className="mt-1.5 text-sm text-zinc-400">{activeTool.description}</p>
            </div>
          </div>

          <form onSubmit={runScan} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="osint-target-input" className="sr-only">
              Target input for {activeTool.name}
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="osint-target-input"
                type="text"
                value={currentTarget}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, [activeTool.id]: e.target.value }))
                }
                placeholder={activeTool.placeholder}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="h-11 w-full rounded-lg border border-white/12 bg-[#060608] pl-10 pr-4 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{activeTool.actionLabel}</span>
                </>
              )}
            </button>
          </form>

          {/* Output Toolbar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="inline-flex items-center gap-1 rounded-lg bg-[#060608] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('structured')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'structured'
                    ? 'bg-[#191922] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Structured
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'json'
                    ? 'bg-[#191922] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Raw JSON
              </button>
            </div>

            {result ? (
              <button
                type="button"
                onClick={() => void copyJson()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            ) : null}
          </div>

          {/* Result Area */}
          <div className="mt-4 min-h-[280px] rounded-xl border border-white/10 bg-[#060608] p-5">
            {loading ? (
              <div className="flex h-[240px] flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
                <p className="font-mono text-xs">Executing {activeTool.name} lookup...</p>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-100">Lookup Error</p>
                  <p className="mt-1 text-xs text-red-200/80">{error}</p>
                </div>
              </div>
            ) : !result ? (
              <div className="flex h-[240px] flex-col items-center justify-center gap-2.5 text-center">
                <Terminal className="h-6 w-6 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-300">Ready to run {activeTool.name}</p>
                <p className="max-w-sm text-xs text-zinc-500">
                  Adjust the target above or press "{activeTool.actionLabel}" to inspect live results.
                </p>
              </div>
            ) : viewMode === 'json' ? (
              <pre className="terminal-scroll max-h-[420px] overflow-auto font-mono text-xs leading-relaxed text-zinc-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <StructuredOutput toolId={activeTool.id} data={result} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function KeyValueGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="border-b border-white/8 pb-3">
          <dt className="text-xs text-zinc-500">{row.label}</dt>
          <dd className="mt-1 break-all font-mono text-sm text-zinc-100 tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StructuredOutput({
  toolId,
  data,
}: {
  toolId: OsintToolId;
  data: Record<string, unknown>;
}) {
  if (toolId === 'ip') {
    return (
      <KeyValueGrid
        rows={[
          { label: 'IP Address', value: String(data.ip || 'Unknown') },
          { label: 'Version', value: String(data.type || 'IPv4') },
          { label: 'Location', value: String(data.location || 'Unknown') },
          { label: 'ASN / Network', value: `${String(data.asn || '')} · ${String(data.org || '')}` },
          { label: 'Timezone', value: String(data.timezone || 'UTC') },
          { label: 'Coordinates', value: String(data.coordinates || 'N/A') },
        ]}
      />
    );
  }

  if (toolId === 'dns') {
    const groups = (data.records as Array<{ type: string; records: Array<{ data: string; ttl: number }> }>) || [];
    return (
      <div className="space-y-4">
        {groups.map((grp) => (
          <div key={grp.type} className="border-b border-white/8 pb-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#60A5FA]">{grp.type} Records</span>
              <span className="font-mono text-xs text-zinc-500 tabular-nums">{grp.records.length} found</span>
            </div>
            {grp.records.length === 0 ? (
              <p className="mt-1.5 font-mono text-xs text-zinc-500">None returned</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {grp.records.map((rec, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 font-mono text-xs text-zinc-200">
                    <span className="break-all">{rec.data}</span>
                    <span className="shrink-0 text-zinc-500 tabular-nums">TTL {rec.ttl}s</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (toolId === 'whois') {
    const ns = (data.nameservers as string[]) || [];
    const status = (data.status as string[]) || [];
    return (
      <div className="space-y-5">
        <KeyValueGrid
          rows={[
            { label: 'Domain', value: String(data.domain || '') },
            { label: 'Registrar', value: String(data.registrar || 'Unknown') },
            { label: 'Registered', value: data.registered ? String(data.registered).slice(0, 10) : 'N/A' },
            { label: 'Expires', value: data.expires ? String(data.expires).slice(0, 10) : 'N/A' },
          ]}
        />
        {ns.length > 0 ? (
          <div>
            <p className="text-xs text-zinc-500">Nameservers</p>
            <p className="mt-1 font-mono text-xs text-zinc-200">{ns.join(' · ')}</p>
          </div>
        ) : null}
        {status.length > 0 ? (
          <div>
            <p className="text-xs text-zinc-500">EPP Statuses</p>
            <p className="mt-1 font-mono text-xs text-zinc-300">{status.join(' · ')}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (toolId === 'subdomains') {
    const subs = (data.subdomains as string[]) || [];
    return (
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>Domain: {String(data.domain || '')}</span>
          <span className="font-mono tabular-nums">{String(data.totalFound ?? subs.length)} unique hosts</span>
        </div>
        {subs.length === 0 ? (
          <p className="font-mono text-xs text-zinc-500">No subdomains indexed in crt.sh logs.</p>
        ) : (
          <div className="terminal-scroll grid max-h-[300px] grid-cols-1 gap-1.5 overflow-auto sm:grid-cols-2">
            {subs.map((sub) => (
              <div key={sub} className="truncate font-mono text-xs text-zinc-200">
                {sub}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'headers') {
    const audit = (data.audit as Array<{ header: string; present: boolean; value: string | null }>) || [];
    return (
      <div className="space-y-4">
        <KeyValueGrid
          rows={[
            { label: 'Resolved URL', value: String(data.url || '') },
            { label: 'HTTP Status · Score', value: `${String(data.status)} · ${String(data.score)} headers present` },
          ]}
        />
        <div className="divide-y divide-white/8">
          {audit.map((item) => (
            <div key={item.header} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-zinc-200">{item.header}</span>
              <span
                className={`font-mono text-xs ${
                  item.present ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {item.present ? 'Present' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolId === 'cms') {
    const detected = (data.detected as Array<{ name: string; category: string; evidence: string }>) || [];
    return (
      <div className="space-y-4">
        <KeyValueGrid
          rows={[
            { label: 'Page Title', value: String(data.pageTitle || 'Untitled') },
            { label: 'Server Header', value: String(data.server || 'Hidden') },
          ]}
        />
        {detected.length === 0 ? (
          <p className="font-mono text-xs text-zinc-400">No well-known CMS or framework fingerprints matched.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {detected.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-4 py-2.5">
                <div>
                  <span className="text-sm font-medium text-white">{d.name}</span>
                  <span className="ml-2 text-xs text-zinc-500">· {d.category}</span>
                </div>
                <span className="font-mono text-xs text-zinc-400">{d.evidence}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'expand') {
    const hops = (data.hops as Array<{ step: number; url: string; status: number }>) || [];
    return (
      <div className="space-y-4">
        <KeyValueGrid
          rows={[
            { label: 'Final Destination', value: String(data.finalUrl || '') },
            { label: 'Total Hops', value: String(data.hopCount ?? hops.length) },
          ]}
        />
        <ol className="space-y-2">
          {hops.map((hop) => (
            <li key={hop.step} className="flex items-start gap-3 font-mono text-xs">
              <span className="text-zinc-500 tabular-nums">0{hop.step}.</span>
              <span className="text-[#60A5FA] tabular-nums">[{hop.status}]</span>
              <span className="break-all text-zinc-200">{hop.url}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (toolId === 'mac') {
    return (
      <KeyValueGrid
        rows={[
          { label: 'MAC / Prefix', value: `${String(data.mac || '')} (${String(data.prefix || '')})` },
          { label: 'Vendor / Manufacturer', value: String(data.vendor || 'Unknown') },
          { label: 'Registry Block', value: String(data.blockType || 'N/A') },
          { label: 'Country', value: String(data.country || 'N/A') },
        ]}
      />
    );
  }

  if (toolId === 'email-breach') {
    const breaches = (data.breaches as string[]) || [];
    const breached = Boolean(data.breached);
    return (
      <div className="space-y-4">
        <KeyValueGrid
          rows={[
            { label: 'Email Checked', value: String(data.email || '') },
            {
              label: 'Exposure Status',
              value: breached ? `${String(data.breachCount)} breach(es) indexed` : 'No indexed breaches found',
            },
          ]}
        />
        {breaches.length > 0 ? (
          <p className="font-mono text-xs leading-relaxed text-zinc-300">
            Indexed sources: {breaches.join(' · ')}
          </p>
        ) : null}
      </div>
    );
  }

  if (toolId === 'email-osint') {
    const mx = (data.mxRecords as string[]) || [];
    const epieosUrl = String(data.epieosUrl || '');
    return (
      <div className="space-y-4">
        <KeyValueGrid
          rows={[
            { label: 'Domain', value: String(data.domain || '') },
            { label: 'MX Mail Routing', value: data.mxValid ? `Valid (${mx.length} record${mx.length === 1 ? '' : 's'})` : 'No MX records' },
            {
              label: 'Disposable Check',
              value: data.disposable === null ? 'Unavailable' : data.disposable ? 'Disposable domain' : 'Standard provider',
            },
            {
              label: 'Gravatar Profile',
              value: data.gravatarFound
                ? `Found${data.gravatarName ? ` (${String(data.gravatarName)})` : ''}`
                : 'No public Gravatar',
            },
          ]}
        />
        {epieosUrl ? (
          <a
            href={epieosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#60A5FA] hover:underline"
          >
            <span>Open deep check on Epieos</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    );
  }

  // social
  const profiles = (data.profiles as Array<{ platform: string; found: boolean; url: string }>) || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Handle: @{String(data.username || '')}</span>
        <span className="font-mono tabular-nums">
          {String(data.foundCount ?? 0)} / {String(data.totalChecked ?? profiles.length)} matched
        </span>
      </div>
      <div className="divide-y divide-white/8">
        {profiles.map((p) => (
          <div key={p.platform} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-200">{p.platform}</span>
            {p.found ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-400 hover:underline"
              >
                <span>Found</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-mono text-xs text-zinc-500">Not found</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
