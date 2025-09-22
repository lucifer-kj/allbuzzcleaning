import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardMetrics, ReviewTrend } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

// User store
interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

// Business store removed - using app_settings context instead

// UI store
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

// Analytics store
interface AnalyticsState {
  metrics: DashboardMetrics | null;
  trends: ReviewTrend[];
  loading: boolean;
  setMetrics: (metrics: DashboardMetrics) => void;
  setTrends: (trends: ReviewTrend[]) => void;
  setLoading: (loading: boolean) => void;
  refreshAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  metrics: null,
  trends: [],
  loading: false,
  setMetrics: (metrics) => set({ metrics }),
  setTrends: (trends) => set({ trends }),
  setLoading: (loading) => set({ loading }),
  refreshAnalytics: async () => {
    set({ loading: true });
    try {
      // This will be implemented when we create the analytics API
      // const metrics = await fetchAnalytics();
      // const trends = await fetchTrends();
      // set({ metrics, trends });
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
