export type EventType = 
  | 'USER_ACTION'
  | 'AI_REQUEST'
  | 'SYSTEM_EVENT'
  | 'SECURITY_EVENT'
  | 'DEPLOYMENT_EVENT'
  | 'PERFORMANCE_EVENT'
  | 'ERROR_EVENT';

export type EventCategory =
  | 'USER_LOGIN'
  | 'USER_SIGNUP'
  | 'USER_LOGOUT'
  | 'PROFILE_UPDATE'
  | 'CHAT_START'
  | 'CHAT_MESSAGE'
  | 'CHAT_END'
  | 'AGENT_EXECUTION'
  | 'AGENT_ERROR'
  | 'APP_GENERATION'
  | 'APP_DEPLOYMENT'
  | 'SYSTEM_START'
  | 'HEALTH_CHECK'
  | 'LOGIN_ATTEMPT'
  | 'PERMISSION_DENIED'
  | 'FEATURE_USAGE'
  | 'PAGE_VIEW'
  | 'API_CALL'
  | 'ERROR'
  | 'SUCCESS';

export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  eventName: string;
  eventCategory: EventCategory;
  userId?: string;
  projectId?: string;
  properties: Record<string, any>;
  duration?: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

export interface MetricAggregation {
  id: string;
  dimensionType: 'USER' | 'PROJECT' | 'AI_RESOURCE' | 'SYSTEM';
  dimensionId: string;
  metricName: string;
  value: number;
  timestamp: Date;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  avgDuration: number;
  successRate: number;
  averageQualityScore: number;
}

export interface UserBehaviorEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: string;
  eventName: string;
  page: string;
  duration?: number;
  timeOnPage?: number;
  scrollDepth?: number;
  createdAt: Date;
}

export interface SystemMetric {
  id: string;
  metricName: string;
  metricType: string;
  value: number;
  unit: string;
  service: string;
  severity: 'NORMAL' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
}

export interface ErrorLog {
  id: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  userId?: string;
  projectId?: string;
  endpoint?: string;
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  resolved: boolean;
  createdAt: Date;
}

export interface PerformanceMetric {
  id: string;
  endpoint: string;
  method?: string;
  duration: number;
  statusCode?: number;
  dbQueryCount?: number;
  dbDuration?: number;
  timestamp: Date;
}

export interface Dashboard {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'timeline';
  title: string;
  metricName: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface AnalyticsSummary {
  timestamp: Date;
  totalEvents: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  topErrors: ErrorLog[];
  performanceMetrics: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
  };
}
