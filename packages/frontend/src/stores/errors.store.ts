import { create } from 'zustand';
import { ErrorLog } from '@/types/analytics';
import { errorsApi } from '@/services/errors-api';

interface ErrorsStore {
  recentErrors: ErrorLog[];
  topErrors: Array<{ errorType: string; count: number; lastOccurred: Date }>;
  totalErrors: number;
  criticalCount: number;
  unresolvedCount: number;
  
  isLoading: boolean;
  error: string | null;

  fetchRecentErrors: (limit?: number) => Promise<void>;
  fetchErrorStats: (startDate?: Date, endDate?: Date) => Promise<void>;
  resolveError: (id: string) => Promise<void>;
  resolveErrorsByType: (errorType: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useErrorsStore = create<ErrorsStore>((set) => ({
  recentErrors: [],
  topErrors: [],
  totalErrors: 0,
  criticalCount: 0,
  unresolvedCount: 0,
  isLoading: false,
  error: null,

  fetchRecentErrors: async (limit?: number) => {
    set({ isLoading: true });
    try {
      const errors = await errorsApi.getRecentErrors(limit);
      set({ recentErrors: errors });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchErrorStats: async (startDate?: Date, endDate?: Date) => {
    set({ isLoading: true });
    try {
      const stats = await errorsApi.getErrorStats(startDate, endDate);
      set({
        topErrors: stats.topErrors,
        totalErrors: stats.totalErrors,
        criticalCount: stats.criticalCount,
        unresolvedCount: stats.unresolvedCount,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  resolveError: async (id: string) => {
    try {
      await errorsApi.resolveError(id);
      set((state) => ({
        recentErrors: state.recentErrors.map((e) =>
          e.id === id ? { ...e, resolved: true } : e,
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  resolveErrorsByType: async (errorType: string) => {
    try {
      await errorsApi.resolveErrorsByType(errorType);
      set((state) => ({
        recentErrors: state.recentErrors.map((e) =>
          e.errorType === errorType ? { ...e, resolved: true } : e,
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
