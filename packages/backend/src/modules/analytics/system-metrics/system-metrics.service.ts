import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { SystemMetric, SystemMetricType, Severity } from '@prisma/client';

@Injectable()
export class SystemMetricsService {
  private readonly logger = new Logger(SystemMetricsService.name);

  constructor(private prisma: PrismaService) {}

  async recordSystemMetric(
    metricName: string,
    metricType: SystemMetricType,
    value: number,
    unit: string,
    service: string,
    component?: string,
  ): Promise<SystemMetric> {
    const severity = this.calculateSeverity(metricType, value);

    return this.prisma.systemMetric.create({
      data: {
        metricName,
        metricType,
        value,
        unit,
        service,
        component,
        severity,
        timestamp: new Date(),
      },
    });
  }

  async getSystemMetrics(
    service?: string,
    options?: { limit?: number; startDate?: Date },
  ): Promise<SystemMetric[]> {
    const startDate = options?.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.systemMetric.findMany({
      where: {
        ...(service && { service }),
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async getLatestMetrics(): Promise<Record<string, SystemMetric>> {
    const metrics = await this.prisma.systemMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    const latest: Record<string, SystemMetric> = {};

    for (const metric of metrics) {
      const key = `${metric.service}-${metric.metricName}`;
      if (!latest[key]) {
        latest[key] = metric;
      }
    }

    return latest;
  }

  async getServiceHealth(
    service: string,
  ): Promise<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: SystemMetric[];
    criticalAlerts: number;
    warningAlerts: number;
  }> {
    const metrics = await this.getSystemMetrics(service, { limit: 100 });

    const criticalAlerts = metrics.filter((m) => m.severity === Severity.CRITICAL).length;
    const warningAlerts = metrics.filter((m) => m.severity === Severity.WARNING).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (criticalAlerts > 5) status = 'unhealthy';
    else if (criticalAlerts > 0 || warningAlerts > 10) status = 'degraded';

    return {
      service,
      status,
      metrics: metrics.slice(0, 20),
      criticalAlerts,
      warningAlerts,
    };
  }

  async getMetricTrend(
    metricType: SystemMetricType,
    options?: { service?: string; limit?: number; startDate?: Date },
  ): Promise<SystemMetric[]> {
    const startDate = options?.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.systemMetric.findMany({
      where: {
        metricType,
        ...(options?.service && { service: options.service }),
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async getAllServiceStatus(): Promise<
    Array<{
      service: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      lastUpdate: Date;
      criticalCount: number;
    }>
  > {
    const services = new Set(
      (
        await this.prisma.systemMetric.findMany({
          select: { service: true },
          distinct: ['service'],
        })
      ).map((m) => m.service),
    );

    const statuses = await Promise.all(
      Array.from(services).map((service) => this.getServiceHealth(service)),
    );

    return statuses.map((s) => ({
      service: s.service,
      status: s.status,
      lastUpdate: s.metrics[0]?.timestamp || new Date(),
      criticalCount: s.criticalAlerts,
    }));
  }

  async getMetricStats(
    metricType: SystemMetricType,
    options?: { service?: string; startDate?: Date },
  ): Promise<{ min: number; max: number; avg: number; latest: number }> {
    const metrics = await this.getMetricTrend(metricType, options);

    if (metrics.length === 0) {
      return { min: 0, max: 0, avg: 0, latest: 0 };
    }

    const values = metrics.map((m) => m.value);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: metrics[0].value,
    };
  }

  private calculateSeverity(metricType: SystemMetricType, value: number): Severity {
    switch (metricType) {
      case SystemMetricType.CPU_USAGE:
        if (value > 90) return Severity.CRITICAL;
        if (value > 75) return Severity.ERROR;
        if (value > 50) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.MEMORY_USAGE:
        if (value > 90) return Severity.CRITICAL;
        if (value > 80) return Severity.ERROR;
        if (value > 70) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.ERROR_RATE:
        if (value > 0.1) return Severity.CRITICAL;
        if (value > 0.05) return Severity.ERROR;
        if (value > 0.01) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.API_LATENCY:
        if (value > 5000) return Severity.CRITICAL;
        if (value > 2000) return Severity.ERROR;
        if (value > 1000) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.QUEUE_DEPTH:
        if (value > 10000) return Severity.CRITICAL;
        if (value > 5000) return Severity.ERROR;
        if (value > 1000) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.DISK_USAGE:
        if (value > 90) return Severity.CRITICAL;
        if (value > 80) return Severity.ERROR;
        if (value > 70) return Severity.WARNING;
        return Severity.NORMAL;

      case SystemMetricType.ACTIVE_CONNECTIONS:
        if (value > 10000) return Severity.WARNING;
        return Severity.NORMAL;

      default:
        return Severity.NORMAL;
    }
  }
}
