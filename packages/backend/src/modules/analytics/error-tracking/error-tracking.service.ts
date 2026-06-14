import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ErrorLog, Severity } from '@prisma/client';

export interface CreateErrorLogDto {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  userId?: string;
  projectId?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  severity?: Severity;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name);

  constructor(private prisma: PrismaService) {}

  async logError(dto: CreateErrorLogDto): Promise<ErrorLog> {
    return this.prisma.errorLog.create({
      data: {
        errorType: dto.errorType,
        errorMessage: dto.errorMessage,
        stackTrace: dto.stackTrace,
        userId: dto.userId,
        projectId: dto.projectId,
        endpoint: dto.endpoint,
        method: dto.method,
        requestId: dto.requestId,
        severity: dto.severity || Severity.WARNING,
        userAgent: dto.userAgent,
        ipAddress: dto.ipAddress,
        metadata: dto.metadata,
        createdAt: new Date(),
      },
    });
  }

  async getErrors(
    options?: { errorType?: string; severity?: Severity; limit?: number; offset?: number },
  ): Promise<ErrorLog[]> {
    return this.prisma.errorLog.findMany({
      where: {
        ...(options?.errorType && { errorType: options.errorType }),
        ...(options?.severity && { severity: options.severity }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });
  }

  async getRecentErrors(limit: number = 50): Promise<ErrorLog[]> {
    return this.prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getErrorsByUser(userId: string, limit: number = 50): Promise<ErrorLog[]> {
    return this.prisma.errorLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getErrorsByProject(projectId: string, limit: number = 50): Promise<ErrorLog[]> {
    return this.prisma.errorLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getErrorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalErrors: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    unresolvedCount: number;
    topErrors: Array<{ errorType: string; count: number; lastOccurred: Date }>;
    errorTrend: Array<{ date: string; count: number }>;
  }> {
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const allErrors = await this.prisma.errorLog.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const criticalCount = allErrors.filter((e) => e.severity === Severity.CRITICAL).length;
    const errorCount = allErrors.filter((e) => e.severity === Severity.ERROR).length;
    const warningCount = allErrors.filter((e) => e.severity === Severity.WARNING).length;
    const unresolvedCount = allErrors.filter((e) => !e.resolved).length;

    const errorTypeCounts: Record<string, { count: number; lastOccurred: Date }> = {};
    for (const error of allErrors) {
      if (!errorTypeCounts[error.errorType]) {
        errorTypeCounts[error.errorType] = { count: 0, lastOccurred: error.createdAt };
      }
      errorTypeCounts[error.errorType].count++;
      if (error.createdAt > errorTypeCounts[error.errorType].lastOccurred) {
        errorTypeCounts[error.errorType].lastOccurred = error.createdAt;
      }
    }

    const topErrors = Object.entries(errorTypeCounts)
      .map(([errorType, { count, lastOccurred }]) => ({
        errorType,
        count,
        lastOccurred,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error trend by day
    const errorTrend: Record<string, number> = {};
    for (const error of allErrors) {
      const date = error.createdAt.toISOString().split('T')[0];
      errorTrend[date] = (errorTrend[date] || 0) + 1;
    }

    return {
      totalErrors: allErrors.length,
      criticalCount,
      errorCount,
      warningCount,
      unresolvedCount,
      topErrors,
      errorTrend: Object.entries(errorTrend)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async markErrorAsResolved(errorId: string): Promise<ErrorLog> {
    return this.prisma.errorLog.update({
      where: { id: errorId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  async markErrorsAsResolved(errorType: string): Promise<number> {
    const result = await this.prisma.errorLog.updateMany({
      where: {
        errorType,
        resolved: false,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    return result.count;
  }

  async getErrorGrouping(
    groupBy: 'errorType' | 'endpoint' | 'userId',
  ): Promise<Array<{ group: string; count: number; severity: string }>> {
    const errors = await this.prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const grouped: Record<string, { count: number; severities: Severity[] }> = {};

    for (const error of errors) {
      const key =
        groupBy === 'errorType'
          ? error.errorType
          : groupBy === 'endpoint'
            ? error.endpoint || 'unknown'
            : error.userId || 'unknown';

      if (!grouped[key]) {
        grouped[key] = { count: 0, severities: [] };
      }
      grouped[key].count++;
      grouped[key].severities.push(error.severity);
    }

    return Object.entries(grouped)
      .map(([group, { count, severities }]) => ({
        group,
        count,
        severity: this.getMostSeverity(severities),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getMostSeverity(severities: Severity[]): string {
    const severityOrder = [Severity.CRITICAL, Severity.ERROR, Severity.WARNING, Severity.NORMAL];
    for (const severity of severityOrder) {
      if (severities.includes(severity)) {
        return severity;
      }
    }
    return Severity.NORMAL;
  }
}
