import { create } from 'zustand';
import { AnalyticsEvent, AnalyticsSummary, Dashboard } from '@/types/analytics';
import { analyticsApi } from '@/services/analytics-api';
import { io, Socket } from 'socket.io-client';

interface AnalyticsStore {
  // Events
  events: AnalyticsEvent[];
  isLoadingEvents: boolean;
  
  // Metrics
  summary: AnalyticsSummary | null;
  isLoadingSummary: boolean;
  
  // Dashboards
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  
  // Real-time
  socket: Socket | null;
  isConnected: boolean;
  
  // Error handling
  error: string | null;

  // Actions
  fetchEvents: (userId?: string, limit?: number) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchDashboards: () => Promise<void>;
  createDashboard: (name: string, widgets: any[], projectId?: string) => Promise<void>;
  updateDashboard: (id: string, data: any) => Promise<void>;
  selectDashboard: (id: string) => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  subscribeToMetrics: (metricId: string) => void;
  setError: (error: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  events: [],
  isLoadingEvents: false,
  summary: null,
  isLoadingSummary: false,
  dashboards: [],
  currentDashboard: null,
  socket: null,
  isConnected: false,
  error: null,

  fetchEvents: async (userId?: string, limit?: number) => {
    set({ isLoadingEvents: true });
    try {
      const events = userId
        ? await analyticsApi.getUserEvents(userId, limit)
        : await analyticsApi.getRecentEvents(limit);
      set({ events });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoadingEvents: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoadingSummary: true });
    try {
      const summary = await analyticsApi.getAnalyticsSummary();
      set({ summary });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  fetchDashboards: async () => {
    try {
      const dashboards = await analyticsApi.getDashboards();
      set({ dashboards });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createDashboard: async (name: string, widgets: any[], projectId?: string) => {
    try {
      const dashboard = await analyticsApi.createDashboard(name, widgets, projectId);
      set((state) => ({
        dashboards: [dashboard, ...state.dashboards],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateDashboard: async (id: string, data: any) => {
    try {
      const updated = await analyticsApi.updateDashboard(id, data);
      set((state) => ({
        dashboards: state.dashboards.map((d) => (d.id === id ? updated : d)),
        currentDashboard: state.currentDashboard?.id === id ? updated : state.currentDashboard,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  selectDashboard: async (id: string) => {
    try {
      const dashboard = await analyticsApi.getDashboard(id);
      set({ currentDashboard: dashboard });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  connectWebSocket: () => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('dashboard-update', (data) => {
      set((state) => ({
        summary: data,
      }));
    });

    socket.on('metric-update', (data) => {
      set((state) => ({
        summary: state.summary ? { ...state.summary, ...data } : null,
      }));
    });

    socket.on('system-alert', (alert) => {
      set({ error: alert.message });
    });

    set({ socket });
  },

  disconnectWebSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  subscribeToMetrics: (metricId: string) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('subscribe-metrics', metricId);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
