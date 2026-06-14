import { create } from 'zustand';
import { testingApi } from '@/lib/testing-api';
import { TestRun, TestResult, TestSuite } from '@/types/testing';

interface TestingStore {
  testSuites: TestSuite[];
  currentTestRun: TestRun | null;
  testResults: TestResult[];
  isRunning: boolean;
  progress: number;
  error: string | null;

  fetchTestSuites: () => Promise<void>;
  runTestSuite: (suiteId: string) => Promise<TestRun>;
  getTestRunResults: (runId: string) => Promise<TestResult[]>;
  cancelTestRun: (runId: string) => Promise<void>;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const useTestingStore = create<TestingStore>((set) => ({
  testSuites: [],
  currentTestRun: null,
  testResults: [],
  isRunning: false,
  progress: 0,
  error: null,

  fetchTestSuites: async () => {
    try {
      const suites = await testingApi.getTestSuites();
      set({ testSuites: suites });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  runTestSuite: async (suiteId: string) => {
    set({ isRunning: true, progress: 0, error: null });
    try {
      const testRun = await testingApi.runTestSuite(suiteId);
      set({ currentTestRun: testRun });
      return testRun;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isRunning: false });
    }
  },

  getTestRunResults: async (runId: string) => {
    try {
      const results = await testingApi.getTestRunResults(runId);
      set({ testResults: results });
      return results;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  cancelTestRun: async (runId: string) => {
    try {
      await testingApi.cancelTestRun(runId);
      set({ isRunning: false });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setProgress: (progress: number) => {
    set({ progress: Math.min(progress, 100) });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));