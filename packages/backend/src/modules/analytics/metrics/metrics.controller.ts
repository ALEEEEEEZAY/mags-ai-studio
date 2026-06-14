import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { MetricDimension } from '@prisma/client';

@Controller('analytics/metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('user/:userId')
  async getUserMetrics(@Param('userId') userId: string) {
    return this.metricsService.getUserMetrics(userId);
  }

  @Get('project/:projectId')
  async getProjectMetrics(@Param('projectId') projectId: string) {
    return this.metricsService.getProjectMetrics(projectId);
  }

  @Get('system')
  async getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  @Get(':dimensionType/:dimensionId/:metricName')
  async getMetricTimeSeries(
    @Param('dimensionType') dimensionType: MetricDimension,
    @Param('dimensionId') dimensionId: string,
    @Param('metricName') metricName: string,
    @Query('bucketSize') bucketSize?: number,
  ) {
    return this.metricsService.getMetricTimeSeries(
      dimensionType,
      dimensionId,
      metricName,
      bucketSize || 60,
    );
  }

  @Get('stats/:dimensionType/:dimensionId/:metricName')
  async getMetricStats(
    @Param('dimensionType') dimensionType: MetricDimension,
    @Param('dimensionId') dimensionId: string,
    @Param('metricName') metricName: string,
  ) {
    return this.metricsService.getMetricStats(dimensionType, dimensionId, metricName);
  }
}
