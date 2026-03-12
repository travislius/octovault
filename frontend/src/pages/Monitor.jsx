import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../api';

function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function latencyTone(latency) {
  if (latency == null) return 'text-gray-500';
  if (latency < 500) return 'text-green-400';
  if (latency <= 1000) return 'text-yellow-400';
  return 'text-red-400';
}

function statusBadge(site) {
  if (site.ok) {
    return {
      icon: CheckCircle2,
      text: 'Operational',
      className: 'bg-green-500/15 text-green-400 border border-green-500/30',
    };
  }

  return {
    icon: XCircle,
    text: 'Down',
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };
}

function SiteCard({ site }) {
  const badge = statusBadge(site);
  const StatusIcon = badge.icon;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
              <Globe className="w-4 h-4 text-gray-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white truncate">{site.name || site.id}</h2>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-500 hover:text-gray-300 transition break-all"
              >
                {site.url}
              </a>
            </div>
          </div>

          {site.error && (
            <div className="mt-4 inline-flex max-w-full items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words">{site.error}</span>
            </div>
          )}
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${badge.className}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{badge.text}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">HTTP Status</p>
          <p className="mt-1 text-lg font-semibold text-white">{site.status ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Latency</p>
          <p className={`mt-1 text-lg font-semibold ${latencyTone(site.latency_ms)}`}>
            {site.latency_ms != null ? `${site.latency_ms} ms` : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Site ID</p>
          <p className="mt-1 text-lg font-semibold text-white">{site.id || '—'}</p>
        </div>
      </div>
    </div>
  );
}

export default function Monitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHealth = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/system/health-check');
      setData(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setError(err.response?.data?.detail || err.message || 'Unable to load health check data.');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const intervalId = window.setInterval(() => {
      fetchHealth({ silent: true });
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchHealth]);

  const sites = data?.sites || [];
  const degradedCount = useMemo(() => sites.filter((site) => !site.ok).length, [sites]);
  const allOk = Boolean(data?.all_ok) && degradedCount === 0 && !error;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Checking system health…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${allOk ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
            {allOk ? (
              <ShieldCheck className="w-5 h-5 text-green-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-500">Production Monitor</p>
            </div>
            <h1 className={`text-2xl font-bold ${allOk ? 'text-white' : 'text-red-200'}`}>
              {allOk ? 'All Systems Operational' : `${degradedCount || sites.length || 1} site(s) degraded`}
            </h1>
          </div>
        </div>

        <button
          onClick={() => fetchHealth({ silent: true })}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh now
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className={`rounded-2xl border px-5 py-4 ${allOk ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
          <p className={`text-xs uppercase tracking-[0.2em] ${allOk ? 'text-green-400' : 'text-red-400'}`}>Summary</p>
          <p className={`mt-2 text-lg font-semibold ${allOk ? 'text-green-100' : 'text-red-100'}`}>
            {allOk ? 'All Systems Operational' : `${degradedCount || sites.length || 1} endpoint${(degradedCount || sites.length || 1) === 1 ? '' : 's'} need attention`}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Globe className="w-4 h-4" />
            <p className="text-xs uppercase tracking-[0.2em]">Sites Checked</p>
          </div>
          <p className="mt-2 text-lg font-semibold text-white">{sites.length}</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <p className="text-xs uppercase tracking-[0.2em]">Last Checked</p>
          </div>
          <p className="mt-2 text-sm font-medium text-white">{formatTimestamp(data?.checked_at)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {sites.map((site) => (
          <SiteCard key={site.id || site.url} site={site} />
        ))}

        {!sites.length && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-10 text-center text-gray-500">
            No health check results available.
          </div>
        )}
      </div>
    </div>
  );
}
