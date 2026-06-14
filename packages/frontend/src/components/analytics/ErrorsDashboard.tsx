'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useErrorsStore } from '@/stores/errors.store';
import { KPICard } from './KPICard';
import { AlertCircle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function ErrorsDashboard() {
  const { recentErrors, topErrors, totalErrors, criticalCount, unresolvedCount, isLoading, fetchErrorStats, fetchRecentErrors } =
    useErrorsStore();

  useEffect(() => {
    fetchErrorStats();
    fetchRecentErrors(100);
  }, [fetchErrorStats, fetchRecentErrors]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16'];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Error Tracking</h1>
        <p className="text-gray-400 mt-1">Monitor and resolve system errors</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard title="Total Errors" value={totalErrors} change="+5.2%" trend="up" icon={<TrendingUp />} />
        <KPICard
          title="Critical"
          value={criticalCount}
          change={criticalCount > 0 ? '⚠️ Action needed' : 'All clear'}
          trend="neutral"
          icon={<AlertCircle />}
        />
        <KPICard
          title="Unresolved"
          value={unresolvedCount}
          change={unresolvedCount > 0 ? `${unresolvedCount} pending` : 'All resolved'}
          trend="neutral"
        />
        <KPICard title="Resolution Rate" value="94.2%" change="+2.1%" trend="up" />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Error Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Errors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topErrors.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="errorType" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Errors List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentErrors.slice(0, 10).map((error, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-slate-700/30 rounded border-l-2 border-red-500 hover:bg-slate-700/50 transition"
              >
                <p className="text-sm font-medium text-white">{error.errorType}</p>
                <p className="text-xs text-gray-400 truncate">{error.errorMessage}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
