'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MetricsOverviewProps {
  metrics: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
  };
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const metricCards = [
    {
      label: 'Avg Latency',
      value: `${metrics.avgLatency}ms`,
      status: metrics.avgLatency < 200 ? 'good' : metrics.avgLatency < 500 ? 'warning' : 'critical',
    },
    {
      label: 'P95 Latency',
      value: `${metrics.p95Latency}ms`,
      status: metrics.p95Latency < 500 ? 'good' : metrics.p95Latency < 1000 ? 'warning' : 'critical',
    },
    {
      label: 'Error Rate',
      value: `${(metrics.errorRate * 100).toFixed(2)}%`,
      status: metrics.errorRate < 0.01 ? 'good' : metrics.errorRate < 0.05 ? 'warning' : 'critical',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-3 gap-4">
        {metricCards.map((metric, idx) => (
          <div
            key={idx}
            className={clsx(
              'p-4 rounded-lg border',
              metric.status === 'good'
                ? 'bg-green-900/20 border-green-700/50'
                : metric.status === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-700/50'
                  : 'bg-red-900/20 border-red-700/50',
            )}
          >
            <p className="text-sm text-gray-400 mb-2">{metric.label}</p>
            <p
              className={clsx(
                'text-2xl font-bold',
                metric.status === 'good'
                  ? 'text-green-400'
                  : metric.status === 'warning'
                    ? 'text-yellow-400'
                    : 'text-red-400',
              )}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
