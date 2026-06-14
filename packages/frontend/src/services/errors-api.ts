import { apiClient } from './api-client';
import { ErrorLog } from '@/types/analytics';

export const errorsApi = {
  getRecentErrors: async (limit?: number): Promise<ErrorLog[]> => {
    const response = await apiClient.get<ErrorLog[]>(
      `/analytics/errors/recent?limit=${limit || 50}`,
    );
    return response.data;
  },

  getErrorStats: async (startDate?: Date, endDate?: Date): Promise<any> => {
    let url = '/analytics/errors/stats';
    const params = [];
    if (startDate) params.push(`startDate=${startDate.toISOString()}`);
    if (endDate) params.push(`endDate=${endDate.toISOString()}`);
    if (params.length) url += '?' + params.join('&');

    const response = await apiClient.get(url);
    return response.data;
  },

  getErrorsByUser: async (userId: string, limit?: number): Promise<ErrorLog[]> => {
    const response = await apiClient.get<ErrorLog[]>(
      `/analytics/errors/user/${userId}?limit=${limit || 50}`,
    );
    return response.data;
  },

  getErrorsByProject: async (projectId: string, limit?: number): Promise<ErrorLog[]> => {
    const response = await apiClient.get<ErrorLog[]>(
      `/analytics/errors/project/${projectId}?limit=${limit || 50}`,
    );
    return response.data;
  },

  resolveError: async (id: string): Promise<void> => {
    await apiClient.post(`/analytics/errors/${id}/resolve`);
  },

  resolveErrorsByType: async (errorType: string): Promise<void> => {
    await apiClient.post(`/analytics/errors/resolve-by-type/${errorType}`);
  },

  getErrorGrouping: async (
    groupBy: 'errorType' | 'endpoint' | 'userId',
  ): Promise<Array<{ group: string; count: number; severity: string }>> => {
    const response = await apiClient.get(
      `/analytics/errors/grouping/${groupBy}`,
    );
    return response.data;
  },
};
