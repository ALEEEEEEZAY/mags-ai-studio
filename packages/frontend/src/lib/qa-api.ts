import { apiClient } from './api-client';

export const qaApi = {
  getDashboard: async (): Promise<any> => {
    const response = await apiClient.get('/qa/dashboard');
    return response.data;
  },

  getBugReports: async (filters?: any): Promise<any> => {
    const response = await apiClient.get('/qa/bugs', {
      params: filters,
    });
    return response.data;
  },

  reportBug: async (bugData: any): Promise<any> => {
    const response = await apiClient.post('/qa/report-bug', bugData);
    return response.data;
  },

  getQAReport: async (reportType: string): Promise<any> => {
    const response = await apiClient.get(`/qa/report/${reportType}`);
    return response.data;
  },
};