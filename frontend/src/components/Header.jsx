import { Search, LayoutGrid, List, Upload, Octagon, LogOut } from 'lucide-react';
import { useStore } from '../store';

export default function Header({ onUploadClick }) {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, logout } = useStore();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <Octagon className="w-6 h-6 text-ocean-400" />
        <span className="text-lg font-bold text-white hidden sm:block">OctoVault</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500 transition"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title={viewMode === 'grid' ? 'List view' : 'Grid view'}
        >
          {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
        </button>

        {/* Upload */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
