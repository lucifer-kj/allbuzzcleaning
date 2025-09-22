import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardMetrics, ReviewTrend } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

// ------------------ User store ------------------
interface UserState {
  user: User | null;
  setUser: (u: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'user-storage' }
  )
);

// Business store removed for single-business mode

// ------------------ UI store ------------------
type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      theme: 'system',
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'ui-storage' }
  )
);

// ------------------ Analytics store ------------------
interface AnalyticsState {
  metrics: DashboardMetrics | null;
  trends: ReviewTrend[];
  loading: boolean;
  setMetrics: (m: DashboardMetrics) => void;
  setTrends: (t: ReviewTrend[]) => void;
  setLoading: (l: boolean) => void;
  refreshAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  metrics: null,
  trends: [],
  loading: false,
  setMetrics: (m) => set({ metrics: m }),
  setTrends: (t) => set({ trends: t }),
  setLoading: (l) => set({ loading: l }),
  refreshAnalytics: async () => {
    set({ loading: true });
    try {
      // Placeholder for API calls:
      // const metrics = await fetchAnalytics();
      // const trends = await fetchTrends();
      // set({ metrics, trends });
    } finally {
      set({ loading: false });
    }
  },
}));
