import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AIUsageService } from './ai-usage.service';
import { AIType } from '@prisma/client';

@Controller('analytics/ai-usage')
@UseGuards(AuthGuard('jwt'))
export class AIUsageController {
  constructor(private aiUsageService: AIUsageService) {}

  @Get('user/:userId')
  async getUserAIUsage(
    @Param('userId') userId: string,
    @Query('aiType') aiType?: AIType,
    @Query('model') model?: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiUsageService.getUserAIUsage(userId, {
      aiType,
      model,
      limit,
    });
  }

  @Get('user/:userId/stats')
  async getUserAIUsageStats(
    @Param('userId') userId: string,
    @Query('aiType') aiType?: AIType,
  ) {
    return this.aiUsageService.getAIUsageStats(userId, aiType);
  }

  @Get('models')
  async getTopModels(@Query('limit') limit?: number) {
    return this.aiUsageService.getTopModels(limit || 5);
  }

  @Get('models/:model')
  async getModelStats(
    @Param('model') model: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.aiUsageService.getModelStats(model, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('types/stats')
  async getAITypeStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.aiUsageService.getAITypeStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('user/:userId/daily')
  async getUserDailyTokenUsage(
    @Param('userId') userId: string,
    @Query('days') days?: number,
  ) {
    return this.aiUsageService.getUserTokenUsageDaily(userId, days || 30);
  }
}
