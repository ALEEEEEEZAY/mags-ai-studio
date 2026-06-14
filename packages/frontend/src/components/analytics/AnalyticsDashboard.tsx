'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { KPICard } from './KPICard';
import { EventsChart } from './EventsChart';
import { MetricsOverview } from './MetricsOverview';
import { RecentEvents } from './RecentEvents';

export function AnalyticsDashboard() {
  const {
    summary,
    isLoadingSummary,
    error,
    fetchSummary,
    connectWebSocket,
    disconnectWebSocket,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchSummary();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [fetchSummary, connectWebSocket, disconnectWebSocket]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time system insights and metrics</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {summary && (
          <>
            <KPICard
              title="Total Events"
              value={summary.totalEvents.toLocaleString()}
              change="+12.5%"
              trend="up"
            />
            <KPICard
              title="Active Users"
              value={summary.activeUsers.toLocaleString()}
              change="+8.2%"
              trend="up"
            />
            <KPICard
              title="Avg Latency"
              value={`${summary.performanceMetrics.avgLatency}ms`}
              change="-5.1%"
              trend="down"
            />
            <KPICard
              title="Error Rate"
              value={`${(summary.performanceMetrics.errorRate * 100).toFixed(2)}%`}
              change="-2.3%"
              trend="down"
            />
          </>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column - Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-2 space-y-6 overflow-y-auto"
        >
          {summary && <EventsChart events={summary.topErrors} />}
          {summary && <MetricsOverview metrics={summary.performanceMetrics} />}
        </motion.div>

        {/* Right Column - Recent Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 overflow-y-auto"
        >
          {summary && <RecentEvents errors={summary.topErrors} />}
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
