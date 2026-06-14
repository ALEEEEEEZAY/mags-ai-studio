import { create } from 'zustand';
import { MetricAggregation, SystemMetric, PerformanceMetric } from '@/types/analytics';
import { metricsApi } from '@/services/metrics-api';

interface MetricsStore {
  userMetrics: Record<string, number>;
  projectMetrics: Record<string, number>;
  systemMetrics: Record<string, SystemMetric>;
  performanceMetrics: PerformanceMetric[];
  
  isLoading: boolean;
  error: string | null;

  fetchUserMetrics: (userId: string) => Promise<void>;
  fetchProjectMetrics: (projectId: string) => Promise<void>;
  fetchSystemMetrics: () => Promise<void>;
  fetchEndpointPerformance: (endpoint: string) => Promise<void>;
  getMetricTimeSeries: (
    dimensionType: string,
    dimensionId: string,
    metricName: string,
    bucketSize?: number,
  ) => Promise<any>;
  setError: (error: string | null) => void;
}

export const useMetricsStore = create<MetricsStore>((set) => ({
  userMetrics: {},
  projectMetrics: {},
  systemMetrics: {},
  performanceMetrics: [],
  isLoading: false,
  error: null,

  fetchUserMetrics: async (userId: string) => {
    set({ isLoading: true });
    try {
      const metrics = await metricsApi.getUserMetrics(userId);
      set({ userMetrics: metrics });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjectMetrics: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const metrics = await metricsApi.getProjectMetrics(projectId);
      set({ projectMetrics: metrics });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSystemMetrics: async () => {
    set({ isLoading: true });
    try {
      const metrics = await metricsApi.getSystemMetrics();
      set({ systemMetrics: metrics });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEndpointPerformance: async (endpoint: string) => {
    set({ isLoading: true });
    try {
      const metrics = await metricsApi.getEndpointPerformance(endpoint);
      set({ performanceMetrics: metrics });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  getMetricTimeSeries: async (
    dimensionType: string,
    dimensionId: string,
    metricName: string,
    bucketSize?: number,
  ) => {
    try {
      return await metricsApi.getMetricTimeSeries(
        dimensionType,
        dimensionId,
        metricName,
        bucketSize,
      );
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
