'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ErrorLog } from '@/types/analytics';

interface EventsChartProps {
  events: ErrorLog[];
}

export function EventsChart({ events }: EventsChartProps) {
  const chartData = events.slice(0, 7).map((event, idx) => ({
    name: event.errorType.slice(0, 10),
    errors: idx + 1,
    timestamp: event.createdAt,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Error Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="errors"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorErrors)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
