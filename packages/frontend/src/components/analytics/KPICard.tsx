'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function KPICard({ title, value, change, trend = 'neutral', icon }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        {icon && <div className="text-slate-600">{icon}</div>}
      </div>

      {change && (
        <div
          className={clsx('flex items-center gap-1 text-sm', {
            'text-green-400': trend === 'up',
            'text-red-400': trend === 'down',
            'text-gray-400': trend === 'neutral',
          })}
        >
          {trend === 'up' && <TrendingUp size={16} />}
          {trend === 'down' && <TrendingDown size={16} />}
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
}
