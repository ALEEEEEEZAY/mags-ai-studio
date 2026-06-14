'use client';

import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AIUsageDashboard } from './AIUsageDashboard';
import { ErrorsDashboard } from './ErrorsDashboard';
import { PerformanceDashboard } from './PerformanceDashboard';

export type DashboardType = 'analytics' | 'ai-usage' | 'errors' | 'performance';

interface AnalyticsDashboardViewProps {
  type: DashboardType;
  userId?: string;
  endpoint?: string;
}

export function AnalyticsDashboardView({ type, userId, endpoint }: AnalyticsDashboardViewProps) {
  switch (type) {
    case 'analytics':
      return <AnalyticsDashboard />;
    case 'ai-usage':
      return userId ? <AIUsageDashboard userId={userId} /> : <div>User ID required</div>;
    case 'errors':
      return <ErrorsDashboard />;
    case 'performance':
      return <PerformanceDashboard endpoint={endpoint} />;
    default:
      return <AnalyticsDashboard />;
  }
}
