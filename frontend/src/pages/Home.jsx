import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Monitor, CalendarDays, Crosshair,
  Files, HardDrive, CheckCircle, AlertTriangle,
  Cpu, MemoryStick, Zap, Clock, ChevronRight
} from 'lucide-react';
import api from '../api';

function StatPill({ label, value, ok }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${ok === false ? 'bg-red-400' : ok === true ? 'bg-green-400' : 'bg-gray-600'}`} />
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-mono text-gray-300">{value}</span>
    </div>
  );
}

function MiniBar({ value, color = 'bg-ocean-500' }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const barColor = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : color;
  return (
    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
      <div className={`${barColor} h-1 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Tile({ icon: Icon, iconColor, title, subtitle, stats, badge, badgeColor, onClick, comingSoon }) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className={`relative flex flex-col text-left w-full bg-gray-900 border rounded-2xl p-5 transition group
        ${comingSoon ? 'border-gray-800 opacity-50 cursor-not-allowed' : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer'}`}
    >
      {comingSoon && (
        <span className="absolute top-4 right-4 text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">Coming soon</span>
      )}
      {!comingSoon && (
        <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Title + subtitle */}
      <h3 className="text-base font-bold text-white mb-0.5">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>

      {/* Stats */}
      {stats && (
        <div className="space-y-1.5 mt-auto">
          {stats}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {badge}
        </div>
      )}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [resources, setResources] = useState(null);
  const [cronData, setCronData]   = useState(null);
  const [fileStats, setFileStats] = useState(null);

  useEffect(() => {
    // Fetch all summaries in parallel
    api.get('/system/resources').then(r => setResources(r.data)).catch(() => {});
    api.get('/crons/jobs').then(r => setCronData(r.data)).catch(() => {});
    api.get('/stats').then(r => setFileStats(r.data)).catch(() => {});
  }, []);

  const cpu  = resources?.cpu;
  const mem  = resources?.memory;
  const disk = resources?.disks?.[0];
  const net  = resources?.network;
  const uptime = resources?.system?.uptime_human;

  const cronErrors = cronData?.by_status?.error ?? 0;
  const cronOk     = cronData?.by_status?.ok ?? 0;
  const nextCron   = cronData?.jobs?.find(j => j.next_run?.startsWith('in'));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Crosshair className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-gray-500">Tia's personal dashboard · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* File Vault */}
        <Tile
          icon={FolderOpen}
          iconColor="bg-ocean-500/20 text-ocean-400"
          title="File Vault"
          subtitle="Personal file storage with tags and search"
          onClick={() => navigate('/files')}
          stats={
            <>
              <StatPill label="Files" value={fileStats?.total_files ?? '—'} />
              <StatPill label="Storage" value={fileStats?.total_size
                ? (() => { let n = fileStats.total_size; for (const u of ['B','KB','MB','GB']) { if (n < 1024) return `${n.toFixed(1)} ${u}`; n /= 1024; } return `${n.toFixed(1)} TB`; })()
                : '—'} />
            </>
          }
          badge={<><Files className="w-3 h-3" /> Vault</>}
          badgeColor="bg-ocean-500/20 text-ocean-400"
        />

        {/* Machine Resources */}
        <Tile
          icon={Monitor}
          iconColor="bg-red-500/20 text-red-400"
          title="Machine Resources"
          subtitle="CPU, RAM, disk and network monitor"
          onClick={() => navigate('/resources')}
          stats={
            cpu && mem ? (
              <>
                <div>
                  <StatPill label="CPU" value={`${cpu.percent?.toFixed(1)}%`} ok={cpu.percent < 80} />
                  <MiniBar value={cpu.percent} color="bg-red-500" />
                </div>
                <div>
                  <StatPill label="RAM" value={`${mem.percent?.toFixed(1)}%`} ok={mem.percent < 80} />
                  <MiniBar value={mem.percent} color="bg-purple-500" />
                </div>
                {disk && <StatPill label="Disk /" value={`${disk.percent?.toFixed(1)}%`} ok={disk.percent < 80} />}
                {uptime && <StatPill label="Uptime" value={uptime} />}
              </>
            ) : <p className="text-xs text-gray-600 italic">Loading…</p>
          }
          badge={
            net?.download_speed?.human
              ? <><Zap className="w-3 h-3" />↓ {net.download_speed.human}/s</>
              : <><Monitor className="w-3 h-3" /> Live</>
          }
          badgeColor="bg-red-500/20 text-red-400"
        />

        {/* Tia's Schedule */}
        <Tile
          icon={CalendarDays}
          iconColor="bg-amber-500/20 text-amber-400"
          title="Tia's Schedule"
          subtitle="All cron jobs, live status, and edit"
          onClick={() => navigate('/calendar')}
          stats={
            cronData ? (
              <>
                <StatPill label="Total jobs" value={cronData.total} />
                <StatPill label="Running ok" value={cronOk} ok={true} />
                {cronErrors > 0 && <StatPill label="Errors" value={cronErrors} ok={false} />}
                {nextCron && <StatPill label="Next" value={`${nextCron.name.slice(0, 20)}… ${nextCron.next_run}`} />}
              </>
            ) : <p className="text-xs text-gray-600 italic">Loading…</p>
          }
          badge={
            cronErrors > 0
              ? <><AlertTriangle className="w-3 h-3" /> {cronErrors} error{cronErrors > 1 ? 's' : ''}</>
              : <><CheckCircle className="w-3 h-3" /> All ok</>
          }
          badgeColor={cronErrors > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
        />

        {/* Placeholder tiles for future modules */}
        <Tile
          icon={Cpu}
          iconColor="bg-gray-700 text-gray-500"
          title="Process Manager"
          subtitle="View and manage running processes"
          comingSoon
        />
        <Tile
          icon={Clock}
          iconColor="bg-gray-700 text-gray-500"
          title="Logs Viewer"
          subtitle="Tail live logs from any service"
          comingSoon
        />
        <Tile
          icon={HardDrive}
          iconColor="bg-gray-700 text-gray-500"
          title="Backups"
          subtitle="Manage and restore snapshots"
          comingSoon
        />

      </div>
    </div>
  );
}
