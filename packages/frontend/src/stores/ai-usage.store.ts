import { create } from 'zustand';
import { AIUsageStats, ModelStats, AITypeStats, DailyTokenUsage } from '@/types/ai-usage';
import { aiUsageApi } from '@/services/ai-usage-api';

interface AIUsageStore {
  userStats: AIUsageStats | null;
  topModels: ModelStats[];
  aiTypeStats: AITypeStats | null;
  dailyUsage: DailyTokenUsage[];
  
  isLoading: boolean;
  error: string | null;

  fetchUserStats: (userId: string, aiType?: string) => Promise<void>;
  fetchTopModels: (limit?: number) => Promise<void>;
  fetchAITypeStats: () => Promise<void>;
  fetchDailyUsage: (userId: string, days?: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAIUsageStore = create<AIUsageStore>((set) => ({
  userStats: null,
  topModels: [],
  aiTypeStats: null,
  dailyUsage: [],
  isLoading: false,
  error: null,

  fetchUserStats: async (userId: string, aiType?: string) => {
    set({ isLoading: true });
    try {
      const stats = await aiUsageApi.getUserStats(userId, aiType);
      set({ userStats: stats });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTopModels: async (limit?: number) => {
    set({ isLoading: true });
    try {
      const models = await aiUsageApi.getTopModels(limit);
      set({ topModels: models });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAITypeStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await aiUsageApi.getAITypeStats();
      set({ aiTypeStats: stats });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDailyUsage: async (userId: string, days?: number) => {
    set({ isLoading: true });
    try {
      const usage = await aiUsageApi.getDailyUsage(userId, days);
      set({ dailyUsage: usage });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
