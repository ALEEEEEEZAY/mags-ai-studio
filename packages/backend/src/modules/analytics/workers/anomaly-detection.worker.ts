import { Injectable, Logger } from '@nestjs/common';
import { Worker, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '@/database/prisma.service';
import { SystemMetricsService } from '../system-metrics/system-metrics.service';
import { Severity } from '@prisma/client';

@Injectable()
export class AnomalyDetectionWorker {
  private readonly logger = new Logger(AnomalyDetectionWorker.name);
  private worker: Worker;

  private readonly thresholds = {
    cpuUsage: 85,
    memoryUsage: 85,
    errorRate: 0.05,
    apiLatency: 2000,
    queueDepth: 5000,
  };

  constructor(
    @InjectQueue('anomaly-detection') private anomalyQueue: Queue,
    private prisma: PrismaService,
    private systemMetricsService: SystemMetricsService,
  ) {
    this.setupWorker();
  }

  private setupWorker(): void {
    this.worker = new Worker(
      'anomaly-detection',
      async (job) => {
        if (job.name === 'detect') {
          return this.detectAnomalies(job.data);
        }
      },
      { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } },
    );

    this.worker.on('completed', (job) => {
      this.logger.debug(`Anomaly detection job ${job?.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Anomaly detection job ${job?.id} failed:`, err);
    });
  }

  private async detectAnomalies(data: any): Promise<void> {
    try {
      const latestMetrics = await this.systemMetricsService.getLatestMetrics();

      const anomalies: Array<{ metric: string; value: number; threshold: number; severity: Severity }> = [];

      // Check CPU usage
      const cpuMetrics = Object.values(latestMetrics).filter((m) => m.metricType === 'CPU_USAGE');
      for (const cpuMetric of cpuMetrics) {
        if (cpuMetric.value > this.thresholds.cpuUsage) {
          anomalies.push({
            metric: 'CPU_USAGE',
            value: cpuMetric.value,
            threshold: this.thresholds.cpuUsage,
            severity: cpuMetric.value > 95 ? Severity.CRITICAL : Severity.WARNING,
          });
        }
      }

      // Check memory usage
      const memoryMetrics = Object.values(latestMetrics).filter((m) => m.metricType === 'MEMORY_USAGE');
      for (const memMetric of memoryMetrics) {
        if (memMetric.value > this.thresholds.memoryUsage) {
          anomalies.push({
            metric: 'MEMORY_USAGE',
            value: memMetric.value,
            threshold: this.thresholds.memoryUsage,
            severity: memMetric.value > 95 ? Severity.CRITICAL : Severity.WARNING,
          });
        }
      }

      // Check error rate
      const errorMetrics = Object.values(latestMetrics).filter((m) => m.metricName === 'error_rate');
      for (const errMetric of errorMetrics) {
        if (errMetric.value > this.thresholds.errorRate) {
          anomalies.push({
            metric: 'ERROR_RATE',
            value: errMetric.value,
            threshold: this.thresholds.errorRate,
            severity: errMetric.value > 0.1 ? Severity.CRITICAL : Severity.ERROR,
          });
        }
      }

      if (anomalies.length > 0) {
        this.logger.warn(`Detected ${anomalies.length} anomalies`, anomalies);
        // Could trigger alerts or notifications here
      }
    } catch (error) {
      this.logger.error('Error detecting anomalies', error);
      throw error;
    }
  }
}
