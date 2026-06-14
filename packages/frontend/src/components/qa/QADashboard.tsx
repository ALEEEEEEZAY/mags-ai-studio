'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQAStore } from '@/stores/qa.store';
import { HealthMetrics } from './HealthMetrics';
import { CoverageChart } from './CoverageChart';
import { FailureHotspots } from './FailureHotspots';
import { SystemHealthScore } from './SystemHealthScore';

export function QADashboard() {
  const { qaMetrics, fetchDashboard } = useQAStore();

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return (
    <div className="h-full flex flex-col bg-slate-900 space-y-6 p-6">
      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 gap-4"
      >
        <SystemHealthScore score={qaMetrics?.healthScore || 0} />
        <HealthMetrics
          label="Pass Rate"
          value={`${qaMetrics?.passRate || 0}%`}
          color="green"
        />
        <HealthMetrics
          label="Failure Rate"
          value={`${qaMetrics?.failureRate || 0}%`}
          color="red"
        />
        <HealthMetrics
          label="Coverage"
          value={`${qaMetrics?.lineCoverage || 0}%`}
          color="blue"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        <CoverageChart coverage={qaMetrics?.coverage} />
        <FailureHotspots failures={qaMetrics?.failures} />
      </div>
    </div>
  );
}