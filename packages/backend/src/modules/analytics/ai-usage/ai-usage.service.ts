import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AIUsageLog, AIType } from '@prisma/client';

export interface CreateAIUsageDto {
  userId: string;
  aiType: AIType;
  resourceId: string;
  chatId?: string;
  agentId?: string;
  appId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  success?: boolean;
  errorMessage?: string;
  qualityScore?: number;
  userFeedback?: string;
}

@Injectable()
export class AIUsageService {
  private readonly logger = new Logger(AIUsageService.name);

  private readonly tokenPricing = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-2': { input: 0.008, output: 0.024 },
    'llama-2-70b': { input: 0.001, output: 0.001 },
  };

  constructor(private prisma: PrismaService) {}

  async logAIUsage(dto: CreateAIUsageDto): Promise<AIUsageLog> {
    const totalTokens = dto.inputTokens + dto.outputTokens;
    const estimatedCost = this.calculateCost(dto.model, dto.inputTokens, dto.outputTokens);

    return this.prisma.aIUsageLog.create({
      data: {
        userId: dto.userId,
        aiType: dto.aiType,
        resourceId: dto.resourceId,
        chatId: dto.chatId,
        agentId: dto.agentId,
        appId: dto.appId,
        model: dto.model,
        inputTokens: dto.inputTokens,
        outputTokens: dto.outputTokens,
        totalTokens,
        estimatedCost,
        duration: dto.duration,
        success: dto.success !== false,
        errorMessage: dto.errorMessage,
        qualityScore: dto.qualityScore,
        userFeedback: dto.userFeedback,
        completionTime: new Date(),
      },
    });
  }

  async getUserAIUsage(
    userId: string,
    options?: { startDate?: Date; endDate?: Date; aiType?: AIType; model?: string; limit?: number },
  ): Promise<AIUsageLog[]> {
    return this.prisma.aIUsageLog.findMany({
      where: {
        userId,
        ...(options?.startDate && { completionTime: { gte: options.startDate } }),
        ...(options?.endDate && { completionTime: { lte: options.endDate } }),
        ...(options?.aiType && { aiType: options.aiType }),
        ...(options?.model && { model: options.model }),
      },
      orderBy: { completionTime: 'desc' },
      take: options?.limit || 100,
    });
  }

  async getAIUsageStats(
    userId: string,
    aiType?: AIType,
  ): Promise<{
    totalRequests: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    avgDuration: number;
    successRate: number;
    averageQualityScore: number;
  }> {
    const logs = await this.getUserAIUsage(userId, { aiType });

    if (logs.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        avgDuration: 0,
        successRate: 0,
        averageQualityScore: 0,
      };
    }

    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const inputTokens = logs.reduce((sum, log) => sum + log.inputTokens, 0);
    const outputTokens = logs.reduce((sum, log) => sum + log.outputTokens, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
    const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length;
    const successCount = logs.filter((log) => log.success).length;
    const successRate = (successCount / logs.length) * 100;
    const qualityScores = logs.filter((log) => log.qualityScore).map((log) => log.qualityScore!);
    const averageQualityScore =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;

    return {
      totalRequests: logs.length,
      totalTokens,
      inputTokens,
      outputTokens,
      totalCost,
      avgDuration,
      successRate,
      averageQualityScore,
    };
  }

  async getModelStats(model: string, options?: { startDate?: Date; endDate?: Date }): Promise<any> {
    const logs = await this.prisma.aIUsageLog.findMany({
      where: {
        model,
        ...(options?.startDate && { completionTime: { gte: options.startDate } }),
        ...(options?.endDate && { completionTime: { lte: options.endDate } }),
      },
    });

    if (logs.length === 0) return null;

    return {
      model,
      requests: logs.length,
      totalTokens: logs.reduce((sum, log) => sum + log.totalTokens, 0),
      totalInputTokens: logs.reduce((sum, log) => sum + log.inputTokens, 0),
      totalOutputTokens: logs.reduce((sum, log) => sum + log.outputTokens, 0),
      totalCost: logs.reduce((sum, log) => sum + log.estimatedCost, 0),
      avgTokens: logs.reduce((sum, log) => sum + log.totalTokens, 0) / logs.length,
      avgDuration: logs.reduce((sum, log) => sum + log.duration, 0) / logs.length,
      successRate: (logs.filter((log) => log.success).length / logs.length) * 100,
      avgQualityScore: this.getAverageQualityScore(logs),
    };
  }

  async getTopModels(limit: number = 5, options?: { startDate?: Date; endDate?: Date }): Promise<any[]> {
    const logs = await this.prisma.aIUsageLog.findMany({
      where: {
        ...(options?.startDate && { completionTime: { gte: options.startDate } }),
        ...(options?.endDate && { completionTime: { lte: options.endDate } }),
      },
      orderBy: { completionTime: 'desc' },
      take: 10000,
    });

    const modelStats: Record<string, any> = {};

    for (const log of logs) {
      if (!modelStats[log.model]) {
        modelStats[log.model] = {
          model: log.model,
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgDuration: 0,
          successCount: 0,
          logs: [],
        };
      }
      modelStats[log.model].requests++;
      modelStats[log.model].totalTokens += log.totalTokens;
      modelStats[log.model].totalCost += log.estimatedCost;
      modelStats[log.model].avgDuration += log.duration;
      if (log.success) modelStats[log.model].successCount++;
      modelStats[log.model].logs.push(log);
    }

    return Object.values(modelStats)
      .map((stats: any) => ({
        ...stats,
        avgDuration: stats.avgDuration / stats.requests,
        successRate: (stats.successCount / stats.requests) * 100,
        avgQualityScore: this.getAverageQualityScore(stats.logs),
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  async getAITypeStats(options?: { startDate?: Date; endDate?: Date }): Promise<Record<AIType, any>> {
    const logs = await this.prisma.aIUsageLog.findMany({
      where: {
        ...(options?.startDate && { completionTime: { gte: options.startDate } }),
        ...(options?.endDate && { completionTime: { lte: options.endDate } }),
      },
    });

    const stats: Record<string, any> = {};

    for (const log of logs) {
      if (!stats[log.aiType]) {
        stats[log.aiType] = {
          type: log.aiType,
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          logs: [],
        };
      }
      stats[log.aiType].requests++;
      stats[log.aiType].totalTokens += log.totalTokens;
      stats[log.aiType].totalCost += log.estimatedCost;
      stats[log.aiType].logs.push(log);
    }

    return Object.fromEntries(
      Object.entries(stats).map(([type, data]: any) => [
        type,
        {
          ...data,
          avgTokens: data.totalTokens / data.requests,
          avgCost: data.totalCost / data.requests,
          avgQualityScore: this.getAverageQualityScore(data.logs),
        },
      ]),
    );
  }

  async getUserTokenUsageDaily(userId: string, days: number = 30): Promise<Array<{ date: string; tokens: number; cost: number }>> {
    const logs = await this.getUserAIUsage(userId, {
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    });

    const daily: Record<string, { tokens: number; cost: number }> = {};

    for (const log of logs) {
      const date = log.completionTime.toISOString().split('T')[0];
      if (!daily[date]) {
        daily[date] = { tokens: 0, cost: 0 };
      }
      daily[date].tokens += log.totalTokens;
      daily[date].cost += log.estimatedCost;
    }

    return Object.entries(daily)
      .map(([date, { tokens, cost }]) => ({ date, tokens, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing =
      this.tokenPricing[model as keyof typeof this.tokenPricing] || {
        input: 0.001,
        output: 0.001,
      };

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;

    return inputCost + outputCost;
  }

  private getAverageQualityScore(logs: AIUsageLog[]): number {
    const qualityScores = logs
      .filter((log) => log.qualityScore)
      .map((log) => log.qualityScore!);
    return qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0;
  }
}
