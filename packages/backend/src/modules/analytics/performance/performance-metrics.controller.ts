import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PerformanceMetricsService } from './performance-metrics.service';

@Controller('analytics/performance')
@UseGuards(AuthGuard('jwt'))
export class PerformanceMetricsController {
  constructor(private performanceMetricsService: PerformanceMetricsService) {}

  @Get('endpoint/:endpoint')
  async getEndpointPerformance(
    @Param('endpoint') endpoint: string,
    @Query('limit') limit?: number,
  ) {
    return this.performanceMetricsService.getEndpointPerformance(endpoint, { limit });
  }

  @Get('endpoint/:endpoint/stats')
  async getEndpointStats(@Param('endpoint') endpoint: string) {
    return this.performanceMetricsService.getEndpointStats(endpoint);
  }

  @Get('all-endpoints')
  async getAllEndpointStats() {
    return this.performanceMetricsService.getAllEndpointStats();
  }

  @Get('slow')
  async getSlowEndpoints(
    @Query('threshold') threshold?: number,
    @Query('limit') limit?: number,
  ) {
    return this.performanceMetricsService.getSlowEndpoints(threshold || 1000, limit || 10);
  }
}
