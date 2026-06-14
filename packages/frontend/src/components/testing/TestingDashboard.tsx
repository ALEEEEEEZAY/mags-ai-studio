'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTestingStore } from '@/stores/testing.store';
import { TestRunnerUI } from './TestRunnerUI';
import { TestResultsPanel } from './TestResultsPanel';
import { TestProgressBar } from './TestProgressBar';

export function TestingDashboard() {
  const {
    testSuites,
    currentTestRun,
    isRunning,
    progress,
    fetchTestSuites,
  } = useTestingStore();

  useEffect(() => {
    fetchTestSuites();
  }, [fetchTestSuites]);

  return (
    <div className="h-full flex flex-col bg-slate-900 space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Testing Center</h1>
        <p className="text-gray-400 mt-1">Automated testing & QA management</p>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Test Runner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1"
        >
          <TestRunnerUI testSuites={testSuites} />
        </motion.div>

        {/* Results & Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 space-y-4"
        >
          {isRunning && <TestProgressBar progress={progress} />}
          {currentTestRun && <TestResultsPanel testRun={currentTestRun} />}
        </motion.div>
      </div>
    </div>
  );
}