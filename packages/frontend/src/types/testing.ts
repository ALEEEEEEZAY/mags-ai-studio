export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  suiteType: 'unit' | 'integration' | 'e2e' | 'api' | 'load';
  targetModule?: string;
  testCount: number;
  isActive: boolean;
  isAutomated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  suiteId: string;
  name: string;
  description?: string;
  testCode: string;
  caseType: 'happy_path' | 'error_case' | 'edge_case' | 'regression';
  expectedResult: Record<string, any>;
  isAIGenerated: boolean;
}

export interface TestRun {
  id: string;
  userId: string;
  suiteId: string;
  runType: 'manual' | 'scheduled' | 'ci_cd';
  status: 'running' | 'completed' | 'failed' | 'aborted';
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
}

export interface TestResult {
  id: string;
  runId: string;
  caseId: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  errorMessage?: string;
  duration?: number;
  logs?: string;
}

export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'fixed' | 'wontfix';
  source: 'automated' | 'manual' | 'user_report';
  suggestedFix?: string;
  createdAt: Date;
}

export interface QAReport {
  id: string;
  userId: string;
  name: string;
  reportType: 'daily' | 'weekly' | 'release' | 'custom';
  passRate: number;
  failureRate: number;
  systemHealthScore?: number;
  lineCoverage?: number;
  createdAt: Date;
}