import { Tag, HardDrive, FolderOpen } from 'lucide-react';
import { useStore } from '../store';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Sidebar() {
  const { tags, selectedTag, setSelectedTag, stats } = useStore();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
      {/* Tags */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
        <button
          onClick={() => setSelectedTag(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
            !selectedTag ? 'bg-ocean-600/20 text-ocean-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          All Files
        </button>
        <div className="mt-1 space-y-0.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                selectedTag === tag.id
                  ? 'bg-ocean-600/20 text-ocean-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" style={{ color: tag.color }} />
              <span className="truncate">{tag.name}</span>
            </button>
          ))}
          {tags.length === 0 && (
            <p className="text-gray-600 text-xs px-3 py-2">No tags yet</p>
          )}
        </div>
      </div>

      {/* Storage Stats */}
      {stats && (
        <div className="mt-auto p-4 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Storage</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <HardDrive className="w-4 h-4 shrink-0" />
            <span>{formatBytes(stats.total_size)}</span>
          </div>
          <p className="text-gray-600 text-xs mt-1">{stats.total_files ?? 0} files</p>
        </div>
      )}
    </aside>
  );
}
