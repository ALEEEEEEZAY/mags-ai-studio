import { Injectable, Logger } from '@nestjs/common';
import { Worker, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '@/database/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { MetricDimension, EventType } from '@prisma/client';

@Injectable()
export class AggregationWorker {
  private readonly logger = new Logger(AggregationWorker.name);
  private worker: Worker;

  constructor(
    @InjectQueue('metrics-aggregation') private metricsQueue: Queue,
    private prisma: PrismaService,
    private metricsService: MetricsService,
  ) {
    this.setupWorker();
  }

  private setupWorker(): void {
    this.worker = new Worker(
      'metrics-aggregation',
      async (job) => {
        if (job.name === 'aggregate') {
          return this.processAggregation(job.data);
        }
      },
      { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } },
    );

    this.worker.on('completed', (job) => {
      this.logger.debug(`Aggregation job ${job?.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Aggregation job ${job?.id} failed:`, err);
    });
  }

  private async processAggregation(data: any): Promise<void> {
    try {
      const { eventId } = data;

      const event = await this.prisma.analyticsEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) return;

      // Aggregate by user
      if (event.userId) {
        await this.metricsService.recordMetric(
          MetricDimension.USER,
          event.userId,
          `events.${event.eventType}`,
          1,
        );

        // Track specific event categories
        await this.metricsService.recordMetric(
          MetricDimension.USER,
          event.userId,
          `category.${event.eventCategory}`,
          1,
        );
      }

      // Aggregate by project
      if (event.projectId) {
        await this.metricsService.recordMetric(
          MetricDimension.PROJECT,
          event.projectId,
          `events.${event.eventType}`,
          1,
        );
      }

      // Aggregate by AI resource
      if (event.agentId) {
        await this.metricsService.recordMetric(
          MetricDimension.AI_RESOURCE,
          event.agentId,
          'ai.executions',
          1,
        );
      }

      // Record duration metric if available
      if (event.duration) {
        await this.metricsService.recordMetric(
          MetricDimension.SYSTEM,
          'global',
          'request.duration',
          event.duration,
        );
      }

      // Record error metrics
      if (event.error) {
        await this.metricsService.recordMetric(
          MetricDimension.SYSTEM,
          'global',
          'errors.total',
          1,
        );
      }

      this.logger.debug(`Aggregated metrics for event ${eventId}`);
    } catch (error) {
      this.logger.error('Error processing aggregation', error);
      throw error;
    }
  }
}
