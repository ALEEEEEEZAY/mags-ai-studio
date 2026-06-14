'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ErrorLog } from '@/types/analytics';
import clsx from 'clsx';

interface RecentEventsProps {
  errors: ErrorLog[];
}

export function RecentEvents({ errors }: RecentEventsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur h-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
      <div className="space-y-3 overflow-y-auto max-h-96">
        {errors.length > 0 ? (
          errors.map((error, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
            >
              <div className="mt-1">
                {error.severity === 'CRITICAL' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : error.severity === 'ERROR' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{error.errorType}</p>
                <p className="text-xs text-gray-400 truncate">{error.errorMessage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(error.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No errors detected</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
