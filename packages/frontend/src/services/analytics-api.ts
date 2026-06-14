import { apiClient } from './api-client';
import { AnalyticsEvent, Dashboard, AnalyticsSummary } from '@/types/analytics';

export const analyticsApi = {
  // Events
  trackEvent: async (event: any): Promise<AnalyticsEvent> => {
    const response = await apiClient.post<AnalyticsEvent>('/analytics/events', event);
    return response.data;
  },

  batchTrackEvents: async (events: any[]): Promise<AnalyticsEvent[]> => {
    const response = await apiClient.post<AnalyticsEvent[]>('/analytics/events/batch', events);
    return response.data;
  },

  getUserEvents: async (userId: string, limit?: number): Promise<AnalyticsEvent[]> => {
    const response = await apiClient.get<AnalyticsEvent[]>(
      `/analytics/events/user/${userId}?limit=${limit || 100}`,
    );
    return response.data;
  },

  getRecentEvents: async (limit?: number): Promise<AnalyticsEvent[]> => {
    const response = await apiClient.get<AnalyticsEvent[]>(
      `/analytics/events?limit=${limit || 50}`,
    );
    return response.data;
  },

  searchEvents: async (query: string, limit?: number): Promise<AnalyticsEvent[]> => {
    const response = await apiClient.get<AnalyticsEvent[]>(
      `/analytics/events/search?q=${query}&limit=${limit || 100}`,
    );
    return response.data;
  },

  // Dashboards
  getDashboards: async (): Promise<Dashboard[]> => {
    const response = await apiClient.get<Dashboard[]>('/analytics/dashboards');
    return response.data;
  },

  getDashboard: async (id: string): Promise<Dashboard> => {
    const response = await apiClient.get<Dashboard>(`/analytics/dashboards/${id}`);
    return response.data;
  },

  createDashboard: async (
    name: string,
    widgets: any[],
    projectId?: string,
  ): Promise<Dashboard> => {
    const response = await apiClient.post<Dashboard>('/analytics/dashboards', {
      name,
      widgets,
      projectId,
    });
    return response.data;
  },

  updateDashboard: async (id: string, data: any): Promise<Dashboard> => {
    const response = await apiClient.put<Dashboard>(`/analytics/dashboards/${id}`, data);
    return response.data;
  },

  deleteDashboard: async (id: string): Promise<void> => {
    await apiClient.delete(`/analytics/dashboards/${id}`);
  },

  // Summary
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get<AnalyticsSummary>('/analytics/dashboards/summary/analytics');
    return response.data;
  },

  getSystemSummary: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/dashboards/summary/system');
    return response.data;
  },

  getUserSummary: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/dashboards/summary/user');
    return response.data;
  },

  getProjectSummary: async (projectId: string): Promise<any> => {
    const response = await apiClient.get(
      `/analytics/dashboards/project/${projectId}/summary`,
    );
    return response.data;
  },
};
