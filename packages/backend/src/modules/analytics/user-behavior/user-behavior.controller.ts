import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserBehaviorService } from './user-behavior.service';

@Controller('analytics/user-behavior')
@UseGuards(AuthGuard('jwt'))
export class UserBehaviorController {
  constructor(private userBehaviorService: UserBehaviorService) {}

  @Get('user/:userId/session/:sessionId')
  async getUserSession(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.userBehaviorService.getUserSession(userId, sessionId);
  }

  @Get('user/:userId/sessions')
  async getUserSessions(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.userBehaviorService.getUserSessions(userId, limit || 50);
  }

  @Get('user/:userId/retention')
  async getUserRetention(
    @Param('userId') userId: string,
    @Query('days') days?: number,
  ) {
    return this.userBehaviorService.getUserRetention(userId, days || 30);
  }

  @Get('user/:userId/journey')
  async getUserJourney(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.userBehaviorService.getUserJourney(userId, limit || 100);
  }

  @Get('page/:page/analytics')
  async getPageAnalytics(@Param('page') page: string) {
    return this.userBehaviorService.getPageAnalytics(page);
  }

  @Get('funnel/:funnelName')
  async getFunnelMetrics(@Param('funnelName') funnelName: string) {
    return this.userBehaviorService.getFunnelMetrics(funnelName);
  }

  @Get('features')
  async getFeatureUsage(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userBehaviorService.getFeatureUsage(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
