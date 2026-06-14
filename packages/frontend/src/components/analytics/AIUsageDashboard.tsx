'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIUsageStore } from '@/stores/ai-usage.store';
import { KPICard } from './KPICard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AIUsageDashboardProps {
  userId: string;
}

export function AIUsageDashboard({ userId }: AIUsageDashboardProps) {
  const { userStats, topModels, dailyUsage, isLoading, fetchUserStats, fetchTopModels, fetchDailyUsage } =
    useAIUsageStore();

  useEffect(() => {
    fetchUserStats(userId);
    fetchTopModels(5);
    fetchDailyUsage(userId, 30);
  }, [userId, fetchUserStats, fetchTopModels, fetchDailyUsage]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">AI Usage Analytics</h1>
        <p className="text-gray-400 mt-1">Token usage, costs, and model performance</p>
      </motion.div>

      {/* KPI Cards */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KPICard
            title="Total Requests"
            value={userStats.totalRequests}
            icon="🔄"
          />
          <KPICard
            title="Total Tokens"
            value={userStats.totalTokens.toLocaleString()}
            icon="🎯"
          />
          <KPICard
            title="Total Cost"
            value={`$${userStats.totalCost.toFixed(2)}`}
            icon="💰"
          />
          <KPICard
            title="Success Rate"
            value={`${userStats.successRate.toFixed(1)}%`}
            trend="up"
            icon="✓"
          />
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Daily Usage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Daily Token Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Models */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Models by Cost</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topModels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="model" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="totalCost" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
