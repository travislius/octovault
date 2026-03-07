import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, CheckSquare, Square, FolderKanban } from 'lucide-react';
import api from '../api';

function timeAgo(ms) {
  if (!ms) return '—';
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// Map status emoji to color classes
const STATUS_COLORS = {
  '🟢': 'text-green-400 bg-green-500/10 border-green-500/20',
  '🟡': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  '🔴': 'text-red-400 bg-red-500/10 border-red-500/20',
  '🔵': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  '⏸️': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  '⏳': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  '⛔': 'text-red-400 bg-red-500/10 border-red-500/20',
};

function renderMarkdown(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H2
    if (line.startsWith('## ')) {
      const title = line.slice(3);
      // Extract status emoji if present (e.g. "🟢 ACTIVE")
      const statusMatch = title.match(/\|\s*\*\*Status:\*\*\s*(🟢|🟡|🔴|🔵|⏸️|⏳|⛔)/);
      elements.push(
        <div key={key++} className="mt-8 mb-3 border-b border-gray-800 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {title}
          </h2>
        </div>
      );
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-gray-300 mt-4 mb-2 uppercase tracking-wider">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-xl font-bold text-white mb-1">{line.slice(2)}</h1>
      );
      continue;
    }

    // Italic/meta lines
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={key++} className="text-xs text-gray-600 italic mb-2">{line.replace(/\*/g, '')}</p>
      );
      continue;
    }

    // Checklist items
    if (line.match(/^- \[[ x]\]/)) {
      const checked = line.includes('- [x]');
      const text = line.replace(/^- \[[ x]\]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      elements.push(
        <div key={key++} className={`flex items-start gap-2 py-1 text-sm ${checked ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
          {checked
            ? <CheckSquare className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
            : <Square className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />}
          <span dangerouslySetInnerHTML={{ __html: text
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-ocean-400 px-1 rounded text-xs">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        </div>
      );
      continue;
    }

    // Bullet items
    if (line.startsWith('- ')) {
      const text = line.slice(2);
      elements.push(
        <div key={key++} className="flex items-start gap-2 py-0.5 text-sm text-gray-400">
          <span className="text-gray-600 mt-1 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: text
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-ocean-400 px-1 rounded text-xs">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-300">$1</strong>')
            .replace(/✅/g, '<span class="text-green-400">✅</span>')
            .replace(/⚠️/g, '<span class="text-yellow-400">⚠️</span>')
            .replace(/🔨/g, '<span>🔨</span>') }} />
        </div>
      );
      continue;
    }

    // Table rows — render as subtle pill list
    if (line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      // Skip separator rows
      if (cells.every(c => c.match(/^[-:]+$/))) continue;
      // Header row (bold cells)
      if (cells.some(c => c.startsWith('**'))) continue; // skip, already shown in context
      if (cells.length >= 2) {
        elements.push(
          <div key={key++} className="flex items-center gap-3 py-1 text-sm border-b border-gray-800/50 last:border-0">
            <span className="text-gray-500 w-32 shrink-0 truncate">{cells[0]}</span>
            <span className="text-gray-300 flex-1" dangerouslySetInnerHTML={{ __html: (cells[1] || '')
              .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-ocean-400 px-1 rounded text-xs">$1</code>')
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </div>
        );
      }
      continue;
    }

    // Status line
    if (line.includes('**Status:**')) {
      const statusMatch = line.match(/(🟢|🟡|🔴|🔵|⏸️|⏳|⛔)\s*(\w+)/);
      if (statusMatch) {
        const emoji = statusMatch[1];
        const label = statusMatch[2];
        const colorClass = STATUS_COLORS[emoji] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        elements.push(
          <div key={key++} className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
              {emoji} {label}
            </span>
            {line.replace(/.*?\*\*Status:\*\*.*?([\|·]|$)/, '').split('|').slice(1).map((part, i) => {
              const p = part.trim();
              if (!p) return null;
              return <span key={i} className="text-xs text-gray-500">{p}</span>;
            })}
          </div>
        );
        continue;
      }
    }

    // Horizontal rule
    if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="border-gray-800 my-4" />);
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={key++} className="text-sm text-gray-400 py-0.5"
          dangerouslySetInnerHTML={{ __html: line
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-ocean-400 px-1 rounded text-xs">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-gray-500">$1</em>') }} />
      );
      continue;
    }

    // Empty line
    elements.push(<div key={key++} className="h-1" />);
  }

  return elements;
}

export default function Projects() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (bg = false) => {
    if (!bg) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/system/projects');
      setData(res.data);
      setError(null);
    } catch (e) {
      if (!bg) setError(e.response?.data?.detail || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading projects…
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400">{error}</div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-ocean-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-xs text-gray-500">
              ~/clawd/PROJECTS.md · updated {timeAgo(data?.updated_at)}
            </p>
          </div>
        </div>
        <button onClick={() => fetchData(true)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {renderMarkdown(data?.content)}
      </div>
    </div>
  );
}
