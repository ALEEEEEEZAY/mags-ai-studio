import { apiClient } from './api-client';
import { AIUsageStats, ModelStats, AITypeStats, DailyTokenUsage } from '@/types/ai-usage';

export const aiUsageApi = {
  getUserStats: async (userId: string, aiType?: string): Promise<AIUsageStats> => {
    const url = `/analytics/ai-usage/user/${userId}/stats${aiType ? `?aiType=${aiType}` : ''}`;
    const response = await apiClient.get<AIUsageStats>(url);
    return response.data;
  },

  getTopModels: async (limit?: number): Promise<ModelStats[]> => {
    const response = await apiClient.get<ModelStats[]>(
      `/analytics/ai-usage/models?limit=${limit || 5}`,
    );
    return response.data;
  },

  getModelStats: async (model: string): Promise<ModelStats> => {
    const response = await apiClient.get<ModelStats>(`/analytics/ai-usage/models/${model}`);
    return response.data;
  },

  getAITypeStats: async (): Promise<Record<string, AITypeStats>> => {
    const response = await apiClient.get<Record<string, AITypeStats>>(
      '/analytics/ai-usage/types/stats',
    );
    return response.data;
  },

  getDailyUsage: async (userId: string, days?: number): Promise<DailyTokenUsage[]> => {
    const response = await apiClient.get<DailyTokenUsage[]>(
      `/analytics/ai-usage/user/${userId}/daily?days=${days || 30}`,
    );
    return response.data;
  },
};
