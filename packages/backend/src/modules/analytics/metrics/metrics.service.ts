import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { MetricAggregation, MetricDimension, TimeGranularity, MetricType } from '@prisma/client';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  async recordMetric(
    dimensionType: MetricDimension,
    dimensionId: string,
    metricName: string,
    value: number,
    metricType: MetricType = MetricType.COUNT,
    tags: string[] = [],
  ): Promise<MetricAggregation> {
    const now = new Date();
    const timeBucket = this.truncateToMinute(now);

    try {
      return await this.prisma.metricAggregation.upsert({
        where: {
          dimensionType_dimensionId_metricName_metricType_timeBucket_granularity: {
            dimensionType,
            dimensionId,
            metricName,
            metricType,
            timeBucket,
            granularity: TimeGranularity.MINUTE,
          },
        },
        update: {
          value: metricType === MetricType.COUNT ? { increment: value } : value,
          updatedAt: new Date(),
        },
        create: {
          dimensionType,
          dimensionId,
          metricName,
          metricType,
          value,
          timeBucket,
          granularity: TimeGranularity.MINUTE,
          tags,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record metric: ${metricName}`, error);
      throw error;
    }
  }

  async getMetric(
    dimensionType: MetricDimension,
    dimensionId: string,
    metricName: string,
    options?: { startDate?: Date; endDate?: Date; granularity?: TimeGranularity },
  ): Promise<MetricAggregation[]> {
    const startDate = options?.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = options?.endDate || new Date();

    return this.prisma.metricAggregation.findMany({
      where: {
        dimensionType,
        dimensionId,
        metricName,
        timeBucket: {
          gte: startDate,
          lte: endDate,
        },
        ...(options?.granularity && { granularity: options.granularity }),
      },
      orderBy: { timeBucket: 'asc' },
    });
  }

  async getMetrics(
    dimensionType: MetricDimension,
    dimensionId: string,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<MetricAggregation[]> {
    const startDate = options?.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = options?.endDate || new Date();

    return this.prisma.metricAggregation.findMany({
      where: {
        dimensionType,
        dimensionId,
        timeBucket: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [{ timeBucket: 'asc' }, { metricName: 'asc' }],
    });
  }

  async aggregateMetrics(
    dimensionType: MetricDimension,
    dimensionId: string,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<Record<string, number>> {
    const metrics = await this.getMetrics(dimensionType, dimensionId, options);

    const aggregated: Record<string, number> = {};

    for (const metric of metrics) {
      if (!aggregated[metric.metricName]) {
        aggregated[metric.metricName] = 0;
      }
      aggregated[metric.metricName] += metric.value;
    }

    return aggregated;
  }

  async getUserMetrics(userId: string): Promise<Record<string, any>> {
    return this.aggregateMetrics(MetricDimension.USER, userId);
  }

  async getProjectMetrics(projectId: string): Promise<Record<string, any>> {
    return this.aggregateMetrics(MetricDimension.PROJECT, projectId);
  }

  async getSystemMetrics(): Promise<Record<string, number>> {
    const metrics = await this.prisma.metricAggregation.findMany({
      where: {
        dimensionType: MetricDimension.SYSTEM,
      },
      orderBy: { timeBucket: 'desc' },
      take: 100,
    });

    const aggregated: Record<string, number> = {};
    for (const metric of metrics) {
      if (!aggregated[metric.metricName]) {
        aggregated[metric.metricName] = 0;
      }
      aggregated[metric.metricName] = Math.max(aggregated[metric.metricName], metric.value);
    }

    return aggregated;
  }

  async getMetricTimeSeries(
    dimensionType: MetricDimension,
    dimensionId: string,
    metricName: string,
    bucketSizeMinutes: number = 60,
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    const metrics = await this.getMetric(dimensionType, dimensionId, metricName);

    const grouped: Record<string, number> = {};

    for (const metric of metrics) {
      const bucket = new Date(
        Math.floor(metric.timeBucket.getTime() / (bucketSizeMinutes * 60 * 1000)) *
          bucketSizeMinutes *
          60 *
          1000,
      );
      const key = bucket.toISOString();
      grouped[key] = (grouped[key] || 0) + metric.value;
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, value]) => ({
        timestamp: new Date(timestamp),
        value,
      }));
  }

  async getMetricStats(
    dimensionType: MetricDimension,
    dimensionId: string,
    metricName: string,
  ): Promise<{ min: number; max: number; avg: number; total: number; count: number }> {
    const metrics = await this.getMetric(dimensionType, dimensionId, metricName);

    if (metrics.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0, count: 0 };
    }

    const values = metrics.map((m) => m.value);
    const total = values.reduce((sum, v) => sum + v, 0);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: total / values.length,
      total,
      count: values.length,
    };
  }

  private truncateToMinute(date: Date): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }

  private truncateToHour(date: Date): Date {
    const d = new Date(date);
    d.setMinutes(0, 0, 0);
    return d;
  }

  private truncateToDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
