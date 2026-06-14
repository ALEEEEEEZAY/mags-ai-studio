import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorTrackingService } from './error-tracking.service';
import { Severity } from '@prisma/client';

@Controller('analytics/errors')
@UseGuards(AuthGuard('jwt'))
export class ErrorTrackingController {
  constructor(private errorTrackingService: ErrorTrackingService) {}

  @Get()
  async getErrors(
    @Query('errorType') errorType?: string,
    @Query('severity') severity?: Severity,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.errorTrackingService.getErrors({
      errorType,
      severity,
      limit,
      offset,
    });
  }

  @Get('recent')
  async getRecentErrors(@Query('limit') limit?: number) {
    return this.errorTrackingService.getRecentErrors(limit || 50);
  }

  @Get('user/:userId')
  async getErrorsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.errorTrackingService.getErrorsByUser(userId, limit || 50);
  }

  @Get('project/:projectId')
  async getErrorsByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
  ) {
    return this.errorTrackingService.getErrorsByProject(projectId, limit || 50);
  }

  @Get('stats')
  async getErrorStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.errorTrackingService.getErrorStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('grouping/:groupBy')
  async getErrorGrouping(
    @Param('groupBy') groupBy: 'errorType' | 'endpoint' | 'userId',
  ) {
    return this.errorTrackingService.getErrorGrouping(groupBy);
  }

  @Post(':id/resolve')
  async resolveError(@Param('id') id: string) {
    return this.errorTrackingService.markErrorAsResolved(id);
  }

  @Post('resolve-by-type/:errorType')
  async resolveErrorsByType(@Param('errorType') errorType: string) {
    return this.errorTrackingService.markErrorsAsResolved(errorType);
  }
}
