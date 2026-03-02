import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth
  token: localStorage.getItem('octovault_token') || null,
  isAuthenticated: !!localStorage.getItem('octovault_token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('octovault_token', token);
    } else {
      localStorage.removeItem('octovault_token');
    }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('octovault_token');
    set({ token: null, isAuthenticated: false });
  },

  // Files
  files: [],
  setFiles: (files) => set({ files }),
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Tags
  tags: [],
  setTags: (tags) => set({ tags }),
  selectedTag: null,
  setSelectedTag: (selectedTag) => set({ selectedTag }),

  // View
  viewMode: localStorage.getItem('octovault_view') || 'grid',
  setViewMode: (viewMode) => {
    localStorage.setItem('octovault_view', viewMode);
    set({ viewMode });
  },

  // Search
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Stats
  stats: null,
  setStats: (stats) => set({ stats }),
}));
