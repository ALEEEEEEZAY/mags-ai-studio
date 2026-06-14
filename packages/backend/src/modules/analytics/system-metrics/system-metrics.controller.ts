import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SystemMetricsService } from './system-metrics.service';
import { SystemMetricType } from '@prisma/client';

@Controller('analytics/system-metrics')
@UseGuards(AuthGuard('jwt'))
export class SystemMetricsController {
  constructor(private systemMetricsService: SystemMetricsService) {}

  @Get('service/:service')
  async getServiceMetrics(@Param('service') service: string) {
    return this.systemMetricsService.getSystemMetrics(service);
  }

  @Get('service/:service/health')
  async getServiceHealth(@Param('service') service: string) {
    return this.systemMetricsService.getServiceHealth(service);
  }

  @Get('latest')
  async getLatestMetrics() {
    return this.systemMetricsService.getLatestMetrics();
  }

  @Get('all-services')
  async getAllServiceStatus() {
    return this.systemMetricsService.getAllServiceStatus();
  }

  @Get('trend/:metricType')
  async getMetricTrend(
    @Param('metricType') metricType: SystemMetricType,
    @Query('service') service?: string,
    @Query('limit') limit?: number,
  ) {
    return this.systemMetricsService.getMetricTrend(metricType, { service, limit });
  }

  @Get('stats/:metricType')
  async getMetricStats(
    @Param('metricType') metricType: SystemMetricType,
    @Query('service') service?: string,
  ) {
    return this.systemMetricsService.getMetricStats(metricType, { service });
  }
}
