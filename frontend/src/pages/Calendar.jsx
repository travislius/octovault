import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar as CalIcon, RefreshCw, X, Clock, AlertTriangle, CheckCircle, HelpCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_PX = 56; // pixels per hour
const TOTAL_H = 24 * HOUR_PX;

// ── category config ──────────────────────────────────────────────────────────
const CAT = {
  trading:  { label: 'Trading',  bg: 'bg-amber-500/20',   border: 'border-amber-500/50',  text: 'text-amber-300',  dot: 'bg-amber-400',  badge: 'bg-amber-500/30 text-amber-300' },
  youtube:  { label: 'YouTube',  bg: 'bg-purple-500/20',  border: 'border-purple-500/50', text: 'text-purple-300', dot: 'bg-purple-400', badge: 'bg-purple-500/30 text-purple-300' },
  email:    { label: 'Email',    bg: 'bg-blue-500/20',    border: 'border-blue-500/50',   text: 'text-blue-300',   dot: 'bg-blue-400',   badge: 'bg-blue-500/30 text-blue-300' },
  content:  { label: 'Content',  bg: 'bg-emerald-500/20', border: 'border-emerald-500/50',text: 'text-emerald-300',dot: 'bg-emerald-400',badge: 'bg-emerald-500/30 text-emerald-300' },
  projects: { label: 'Projects', bg: 'bg-ocean-500/20',   border: 'border-ocean-500/50',  text: 'text-ocean-300',  dot: 'bg-ocean-400',  badge: 'bg-ocean-500/30 text-ocean-300' },
  system:   { label: 'System',   bg: 'bg-gray-500/20',    border: 'border-gray-500/50',   text: 'text-gray-400',   dot: 'bg-gray-500',   badge: 'bg-gray-500/30 text-gray-400' },
};

function StatusIcon({ status, size = 'w-3 h-3' }) {
  if (status === 'ok')      return <CheckCircle  className={`${size} text-green-400 shrink-0`} />;
  if (status === 'error')   return <AlertTriangle className={`${size} text-red-400 shrink-0`} />;
  return                           <HelpCircle   className={`${size} text-gray-500 shrink-0`} />;
}

function fmtTime(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}

function fmtDuration(ms) {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ job, onClose }) {
  const c = CAT[job.category] || CAT.system;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 ${c.bg} border-b border-gray-800`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
                <StatusIcon status={job.status} />
                <span className={`text-xs ${job.status === 'ok' ? 'text-green-400' : job.status === 'error' ? 'text-red-400' : 'text-gray-500'}`}>
                  {job.status}
                </span>
              </div>
              <h2 className={`text-lg font-bold ${c.text} leading-tight`}>{job.name}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Schedule */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Time</p>
                <p className="text-sm font-mono text-white">{fmtTime(job.hour, job.minute)}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Days</p>
                <div className="flex gap-1">
                  {DAYS.map((d, i) => (
                    <span key={i} className={`text-xs font-mono px-1 rounded ${job.days.includes(i) ? `${c.badge} font-bold` : 'text-gray-600'}`}>
                      {d[0]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Next run</p>
                <p className="text-sm text-white">{job.next_run ?? '—'}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Last run</p>
                <p className="text-sm text-white">{job.last_run ?? '—'}</p>
              </div>
              {job.duration_ms && (
                <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                  <p className="text-sm text-white">{fmtDuration(job.duration_ms)}</p>
                </div>
              )}
              {job.timeout_s && (
                <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">Timeout</p>
                  <p className="text-sm text-white">{job.timeout_s}s</p>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded font-mono">{job.expr}</code>
              {job.tz !== 'system' && <span className="text-xs text-gray-600">{job.tz}</span>}
            </div>
          </div>

          {/* Error */}
          {job.status === 'error' && job.last_error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
              <p className="text-xs text-red-400 font-semibold mb-1">Last error ({job.consecutive_errors} consecutive)</p>
              <p className="text-xs text-red-300 font-mono break-words">{job.last_error}</p>
            </div>
          )}

          {/* Task */}
          {job.task_preview && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition mb-2"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Task description
              </button>
              {expanded && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{job.task_preview}</p>
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span>source: {job.source}</span>
            <span>·</span>
            <span>target: {job.target}</span>
            {job.id && <span className="font-mono truncate max-w-[180px]">id: {job.id}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cron Tile ────────────────────────────────────────────────────────────────
function CronTile({ job, onClick, stacked = false }) {
  const c = CAT[job.category] || CAT.system;
  return (
    <button
      onClick={() => onClick(job)}
      className={`absolute left-0.5 right-0.5 ${c.bg} ${c.border} border rounded-lg px-1.5 py-1 text-left hover:brightness-125 transition cursor-pointer overflow-hidden group`}
      style={{
        top: `${(job.hour * 60 + job.minute) / 60 * HOUR_PX}px`,
        minHeight: '26px',
        zIndex: stacked ? 2 : 1,
      }}
    >
      <div className="flex items-center gap-1">
        <StatusIcon status={job.status} size="w-2.5 h-2.5" />
        <span className={`text-xs font-medium ${c.text} truncate leading-tight`}>{job.name}</span>
      </div>
      <p className="text-xs text-gray-500 leading-none mt-0.5">{fmtTime(job.hour, job.minute)}</p>
    </button>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────────
function Legend({ summary }) {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(CAT).map(([key, c]) => {
        const count = summary.by_category?.[key] || 0;
        if (!count) return null;
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <span className="text-xs text-gray-400">{c.label}</span>
            <span className="text-xs text-gray-600">{count}</span>
          </div>
        );
      })}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-400" /><span className="text-xs text-gray-400">{summary.by_status?.ok ?? 0} ok</span></div>
        <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-red-400" /><span className="text-xs text-gray-400">{summary.by_status?.error ?? 0} errors</span></div>
      </div>
    </div>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const gridRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/crons/jobs');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll to first active hour on load
  useEffect(() => {
    if (data && gridRef.current) {
      const firstHour = Math.min(...(data.jobs || []).map(j => j.hour));
      const scrollTo = Math.max(0, (firstHour - 1) * HOUR_PX);
      setTimeout(() => gridRef.current?.scrollTo({ top: scrollTo, behavior: 'smooth' }), 100);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading schedule…
      </div>
    );
  }

  if (!data) return null;

  const jobs = data.jobs || [];

  // Build per-day job lists
  const byDay = DAYS.map((_, di) => jobs.filter(j => j.days.includes(di)));

  // Compute stacking: jobs within 20min of each other on same day
  const isStacked = (job, dayJobs) =>
    dayJobs.some(j => j !== job && Math.abs((j.hour * 60 + j.minute) - (job.hour * 60 + job.minute)) < 20);

  // Today's day index (0=Mon)
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalIcon className="w-5 h-5 text-red-400" />
              Tia's Schedule
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{data.total} cron jobs · America/Los_Angeles · click any tile for details</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <Legend summary={data} />
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {/* Day header row */}
        <div className="flex shrink-0 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <div className="w-14 shrink-0 border-r border-gray-800" /> {/* time gutter */}
          {DAYS.map((day, i) => (
            <div key={i} className={`flex-1 min-w-0 py-2 text-center border-r border-gray-800 last:border-0 ${i === todayIdx ? 'bg-ocean-900/30' : ''}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${i === todayIdx ? 'text-ocean-400' : 'text-gray-500'}`}>{day}</p>
              {i === todayIdx && <div className="w-1.5 h-1.5 rounded-full bg-ocean-400 mx-auto mt-0.5" />}
              <p className="text-xs text-gray-600 mt-0.5">{byDay[i].length} jobs</p>
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div className="flex flex-1 overflow-y-auto" ref={gridRef}>
          {/* Time gutter */}
          <div className="w-14 shrink-0 border-r border-gray-800 relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute w-full flex items-center justify-end pr-2"
                style={{ top: `${h * HOUR_PX}px`, height: `${HOUR_PX}px` }}
              >
                <span className="text-xs text-gray-600 font-mono">{h === 0 ? '12A' : h < 12 ? `${h}A` : h === 12 ? '12P' : `${h - 12}P`}</span>
              </div>
            ))}
            <div style={{ height: `${TOTAL_H}px` }} />
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIdx) => (
            <div
              key={dayIdx}
              className={`flex-1 min-w-0 relative border-r border-gray-800 last:border-0 ${dayIdx === todayIdx ? 'bg-ocean-900/10' : ''}`}
              style={{ height: `${TOTAL_H}px` }}
            >
              {/* Hour grid lines */}
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className={`absolute w-full border-t ${h % 6 === 0 ? 'border-gray-700' : 'border-gray-800/60'}`}
                  style={{ top: `${h * HOUR_PX}px` }}
                />
              ))}

              {/* Cron tiles */}
              {byDay[dayIdx].map((job) => (
                <CronTile
                  key={job.id}
                  job={job}
                  onClick={setSelected}
                  stacked={isStacked(job, byDay[dayIdx])}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && <DetailModal job={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
