import { apiClient } from './api-client';
import { TestSuite, TestRun, TestResult } from '@/types/testing';

export const testingApi = {
  getTestSuites: async (): Promise<TestSuite[]> => {
    const response = await apiClient.get<TestSuite[]>('/tests/suites');
    return response.data;
  },

  runTestSuite: async (suiteId: string): Promise<TestRun> => {
    const response = await apiClient.post<TestRun>('/tests/run', {
      suiteId,
      parallel: true,
    });
    return response.data;
  },

  getTestRunResults: async (runId: string): Promise<TestResult[]> => {
    const response = await apiClient.get<TestResult[]>(`/tests/results/${runId}`);
    return response.data;
  },

  cancelTestRun: async (runId: string): Promise<void> => {
    await apiClient.post(`/tests/${runId}/cancel`);
  },

  generateTests: async (modulePath: string): Promise<any> => {
    const response = await apiClient.post('/tests/generate', {
      modulePath,
    });
    return response.data;
  },
};