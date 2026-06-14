import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PerformanceMetric } from '@prisma/client';

@Injectable()
export class PerformanceMetricsService {
  private readonly logger = new Logger(PerformanceMetricsService.name);

  constructor(private prisma: PrismaService) {}

  async recordPerformanceMetric(
    requestId: string,
    endpoint: string,
    duration: number,
    statusCode?: number,
    method?: string,
    dbQueryCount?: number,
    dbDuration?: number,
  ): Promise<PerformanceMetric> {
    return this.prisma.performanceMetric.create({
      data: {
        requestId,
        endpoint,
        method,
        duration,
        statusCode,
        dbQueryCount,
        dbDuration,
        timestamp: new Date(),
      },
    });
  }

  async getEndpointPerformance(
    endpoint: string,
    options?: { limit?: number; startDate?: Date },
  ): Promise<PerformanceMetric[]> {
    const startDate = options?.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.performanceMetric.findMany({
      where: {
        endpoint,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async getEndpointStats(endpoint: string): Promise<{
    endpoint: string;
    requestCount: number;
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
  }> {
    const metrics = await this.prisma.performanceMetric.findMany({
      where: { endpoint },
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    if (metrics.length === 0) {
      return {
        endpoint,
        requestCount: 0,
        avgDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
      };
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const errorCount = metrics.filter((m) => m.statusCode && m.statusCode >= 400).length;

    return {
      endpoint,
      requestCount: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      errorRate: (errorCount / metrics.length) * 100,
    };
  }

  async getAllEndpointStats(): Promise<
    Array<{
      endpoint: string;
      requestCount: number;
      avgDuration: number;
      p95: number;
      errorRate: number;
    }>
  > {
    const endpoints = new Set(
      (
        await this.prisma.performanceMetric.findMany({
          select: { endpoint: true },
          distinct: ['endpoint'],
        })
      ).map((m) => m.endpoint),
    );

    const stats = await Promise.all(
      Array.from(endpoints).map((endpoint) => this.getEndpointStats(endpoint)),
    );

    return stats
      .map((stat) => ({
        endpoint: stat.endpoint,
        requestCount: stat.requestCount,
        avgDuration: stat.avgDuration,
        p95: stat.p95,
        errorRate: stat.errorRate,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }

  async getSlowEndpoints(threshold: number = 1000, limit: number = 10): Promise<PerformanceMetric[]> {
    return this.prisma.performanceMetric.findMany({
      where: {
        duration: { gt: threshold },
      },
      orderBy: { duration: 'desc' },
      take: limit,
    });
  }
}
