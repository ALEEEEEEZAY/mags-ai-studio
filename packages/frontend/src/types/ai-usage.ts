export interface AIUsageLog {
  id: string;
  userId: string;
  aiType: 'CHAT' | 'AGENT' | 'APP_BUILDER';
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  duration: number;
  success: boolean;
  qualityScore?: number;
  completionTime: Date;
}

export interface ModelStats {
  model: string;
  requests: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
  successRate: number;
  avgQualityScore: number;
}

export interface AITypeStats {
  type: 'CHAT' | 'AGENT' | 'APP_BUILDER';
  requests: number;
  totalTokens: number;
  totalCost: number;
  avgQualityScore: number;
}

export interface DailyTokenUsage {
  date: string;
  tokens: number;
  cost: number;
}
