import { apiClient } from './api-client';
import { MetricAggregation, SystemMetric, PerformanceMetric } from '@/types/analytics';

export const metricsApi = {
  getUserMetrics: async (userId: string): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>(
      `/analytics/metrics/user/${userId}`,
    );
    return response.data;
  },

  getProjectMetrics: async (projectId: string): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>(
      `/analytics/metrics/project/${projectId}`,
    );
    return response.data;
  },

  getSystemMetrics: async (): Promise<Record<string, SystemMetric>> => {
    const response = await apiClient.get<Record<string, SystemMetric>>(
      '/analytics/metrics/system',
    );
    return response.data;
  },

  getMetricTimeSeries: async (
    dimensionType: string,
    dimensionId: string,
    metricName: string,
    bucketSize?: number,
  ): Promise<Array<{ timestamp: Date; value: number }>> => {
    const response = await apiClient.get<Array<{ timestamp: Date; value: number }>>(
      `/analytics/metrics/${dimensionType}/${dimensionId}/${metricName}?bucketSize=${bucketSize || 60}`,
    );
    return response.data;
  },

  getMetricStats: async (
    dimensionType: string,
    dimensionId: string,
    metricName: string,
  ): Promise<{ min: number; max: number; avg: number; total: number; count: number }> => {
    const response = await apiClient.get(
      `/analytics/metrics/stats/${dimensionType}/${dimensionId}/${metricName}`,
    );
    return response.data;
  },

  getEndpointPerformance: async (endpoint: string): Promise<PerformanceMetric[]> => {
    const response = await apiClient.get<PerformanceMetric[]>(
      `/analytics/performance/endpoint/${endpoint}`,
    );
    return response.data;
  },

  getEndpointStats: async (endpoint: string): Promise<any> => {
    const response = await apiClient.get(
      `/analytics/performance/endpoint/${endpoint}/stats`,
    );
    return response.data;
  },

  getAllEndpointStats: async (): Promise<any[]> => {
    const response = await apiClient.get('/analytics/performance/all-endpoints');
    return response.data;
  },

  getSlowEndpoints: async (threshold?: number, limit?: number): Promise<PerformanceMetric[]> => {
    const response = await apiClient.get<PerformanceMetric[]>(
      `/analytics/performance/slow?threshold=${threshold || 1000}&limit=${limit || 10}`,
    );
    return response.data;
  },
};
