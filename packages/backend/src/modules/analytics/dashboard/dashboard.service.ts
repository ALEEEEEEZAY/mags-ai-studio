import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AnalyticsDashboard } from '@prisma/client';
import { MetricsService } from '../metrics/metrics.service';
import { SystemMetricsService } from '../system-metrics/system-metrics.service';
import { AIUsageService } from '../ai-usage/ai-usage.service';
import { UserBehaviorService } from '../user-behavior/user-behavior.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private metricsService: MetricsService,
    private systemMetricsService: SystemMetricsService,
    private aiUsageService: AIUsageService,
    private userBehaviorService: UserBehaviorService,
  ) {}

  async createDashboard(
    userId: string,
    name: string,
    widgets: any[],
    projectId?: string,
    isDefault: boolean = false,
  ): Promise<AnalyticsDashboard> {
    return this.prisma.analyticsDashboard.create({
      data: {
        userId,
        projectId,
        name,
        widgets,
        isDefault,
      },
    });
  }

  async getDashboard(id: string): Promise<AnalyticsDashboard | null> {
    return this.prisma.analyticsDashboard.findUnique({
      where: { id },
    });
  }

  async getUserDashboards(userId: string): Promise<AnalyticsDashboard[]> {
    return this.prisma.analyticsDashboard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDefaultDashboard(userId: string): Promise<AnalyticsDashboard | null> {
    return this.prisma.analyticsDashboard.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async updateDashboard(
    id: string,
    data: Partial<AnalyticsDashboard>,
  ): Promise<AnalyticsDashboard> {
    return this.prisma.analyticsDashboard.update({
      where: { id },
      data,
    });
  }

  async deleteDashboard(id: string): Promise<void> {
    await this.prisma.analyticsDashboard.delete({
      where: { id },
    });
  }

  async getAnalyticsSummary(projectId?: string): Promise<any> {
    const systemMetrics = await this.systemMetricsService.getLatestMetrics();
    const serviceStatus = await this.systemMetricsService.getAllServiceStatus();

    return {
      timestamp: new Date(),
      system: {
        services: serviceStatus,
        metrics: Object.fromEntries(
          Object.entries(systemMetrics)
            .slice(0, 10)
            .map(([k, v]) => [k, v.value]),
        ),
      },
    };
  }

  async getProjectDashboardData(projectId: string): Promise<any> {
    const [userMetrics, systemMetrics] = await Promise.all([
      this.metricsService.getProjectMetrics(projectId),
      this.systemMetricsService.getLatestMetrics(),
    ]);

    return {
      timestamp: new Date(),
      project: projectId,
      metrics: userMetrics,
      system: systemMetrics,
    };
  }

  async getUserAnalyticsSummary(userId: string): Promise<any> {
    const [userMetrics, aiStats, retention] = await Promise.all([
      this.metricsService.getUserMetrics(userId),
      this.aiUsageService.getAIUsageStats(userId),
      this.userBehaviorService.getUserRetention(userId),
    ]);

    return {
      timestamp: new Date(),
      user: userId,
      metrics: userMetrics,
      ai: aiStats,
      behavior: retention,
    };
  }

  async getSystemDashboardData(): Promise<any> {
    const [allServices, latestMetrics] = await Promise.all([
      this.systemMetricsService.getAllServiceStatus(),
      this.systemMetricsService.getLatestMetrics(),
    ]);

    return {
      timestamp: new Date(),
      services: allServices,
      metrics: latestMetrics,
    };
  }
}
