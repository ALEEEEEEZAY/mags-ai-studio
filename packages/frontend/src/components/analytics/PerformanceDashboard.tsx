'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMetricsStore } from '@/stores/metrics.store';
import { KPICard } from './KPICard';
import { Activity, Zap } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceDashboardProps {
  endpoint?: string;
}

export function PerformanceDashboard({ endpoint }: PerformanceDashboardProps) {
  const { performanceMetrics, isLoading, fetchEndpointPerformance } = useMetricsStore();

  useEffect(() => {
    if (endpoint) {
      fetchEndpointPerformance(endpoint);
    }
  }, [endpoint, fetchEndpointPerformance]);

  const avgDuration =
    performanceMetrics.length > 0
      ? performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length
      : 0;
  const maxDuration = performanceMetrics.length > 0 ? Math.max(...performanceMetrics.map((m) => m.duration)) : 0;
  const errorCount = performanceMetrics.filter((m) => m.statusCode && m.statusCode >= 400).length;
  const errorRate = performanceMetrics.length > 0 ? (errorCount / performanceMetrics.length) * 100 : 0;

  const chartData = performanceMetrics.map((m, idx) => ({
    time: idx,
    duration: m.duration,
    statusCode: m.statusCode || 200,
  }));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Performance Metrics</h1>
        <p className="text-gray-400 mt-1">{endpoint ? `Endpoint: ${endpoint}` : 'System-wide performance'}</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard title="Avg Duration" value={`${avgDuration.toFixed(0)}ms`} icon={<Zap />} />
        <KPICard title="Max Duration" value={`${maxDuration.toFixed(0)}ms`} icon={<Activity />} />
        <KPICard title="Error Rate" value={`${errorRate.toFixed(2)}%`} change="-1.2%" trend="down" />
        <KPICard title="Requests" value={performanceMetrics.length.toLocaleString()} />
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-hidden"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Request Duration Timeline</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Area type="monotone" dataKey="duration" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDuration)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
