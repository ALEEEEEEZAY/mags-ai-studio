import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { AIUsageController } from './ai-usage/ai-usage.controller';
import { AIUsageService } from './ai-usage/ai-usage.service';
import { UserBehaviorController } from './user-behavior/user-behavior.controller';
import { UserBehaviorService } from './user-behavior/user-behavior.service';
import { SystemMetricsController } from './system-metrics/system-metrics.controller';
import { SystemMetricsService } from './system-metrics/system-metrics.service';
import { ErrorTrackingController } from './error-tracking/error-tracking.controller';
import { ErrorTrackingService } from './error-tracking/error-tracking.service';
import { PerformanceMetricsController } from './performance/performance-metrics.controller';
import { PerformanceMetricsService } from './performance/performance-metrics.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { AggregationWorker } from './workers/aggregation.worker';
import { AnomalyDetectionWorker } from './workers/anomaly-detection.worker';
import { AnalyticsGateway } from './analytics.gateway';
import { PrismaService } from '@/database/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'analytics-events' },
      { name: 'metrics-aggregation' },
      { name: 'anomaly-detection' },
      { name: 'user-behavior' },
      { name: 'error-tracking' },
      { name: 'performance-metrics' },
    ),
  ],
  controllers: [
    EventsController,
    MetricsController,
    AIUsageController,
    UserBehaviorController,
    SystemMetricsController,
    ErrorTrackingController,
    PerformanceMetricsController,
    DashboardController,
  ],
  providers: [
    EventsService,
    MetricsService,
    AIUsageService,
    UserBehaviorService,
    SystemMetricsService,
    ErrorTrackingService,
    PerformanceMetricsService,
    DashboardService,
    AggregationWorker,
    AnomalyDetectionWorker,
    AnalyticsGateway,
    PrismaService,
  ],
  exports: [
    EventsService,
    MetricsService,
    AIUsageService,
    UserBehaviorService,
    SystemMetricsService,
    ErrorTrackingService,
    PerformanceMetricsService,
    DashboardService,
  ],
})
export class AnalyticsModule {}
