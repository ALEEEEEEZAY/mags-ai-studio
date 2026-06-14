import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UserBehaviorEvent } from '@prisma/client';

export interface CreateBehaviorEventDto {
  userId: string;
  sessionId: string;
  eventType: string;
  eventName: string;
  page: string;
  componentName?: string;
  section?: string;
  duration?: number;
  scrollDepth?: number;
  timeOnPage?: number;
  funnelStep?: string;
  funnelStepPosition?: number;
}

@Injectable()
export class UserBehaviorService {
  private readonly logger = new Logger(UserBehaviorService.name);

  constructor(private prisma: PrismaService) {}

  async trackBehaviorEvent(dto: CreateBehaviorEventDto): Promise<UserBehaviorEvent> {
    return this.prisma.userBehaviorEvent.create({
      data: {
        userId: dto.userId,
        sessionId: dto.sessionId,
        sessionStartTime: new Date(),
        eventType: dto.eventType,
        eventName: dto.eventName,
        page: dto.page,
        componentName: dto.componentName,
        section: dto.section,
        duration: dto.duration,
        scrollDepth: dto.scrollDepth,
        timeOnPage: dto.timeOnPage,
        funnelStep: dto.funnelStep,
        funnelStepPosition: dto.funnelStepPosition,
      },
    });
  }

  async getUserSession(
    userId: string,
    sessionId: string,
  ): Promise<{
    events: UserBehaviorEvent[];
    sessionDuration: number;
    pageCount: number;
    avgTimePerPage: number;
  }> {
    const events = await this.prisma.userBehaviorEvent.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) {
      return {
        events: [],
        sessionDuration: 0,
        pageCount: 0,
        avgTimePerPage: 0,
      };
    }

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const sessionDuration = lastEvent.createdAt.getTime() - firstEvent.createdAt.getTime();

    const uniquePages = new Set(events.map((e) => e.page)).size;
    const totalTimeOnPages = events.reduce((sum, e) => sum + (e.timeOnPage || 0), 0);
    const avgTimePerPage = events.length > 0 ? totalTimeOnPages / events.length : 0;

    return {
      events,
      sessionDuration,
      pageCount: uniquePages,
      avgTimePerPage,
    };
  }

  async getUserSessions(userId: string, limit: number = 50): Promise<
    Array<{
      sessionId: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      eventCount: number;
      pageCount: number;
    }>
  > {
    const events = await this.prisma.userBehaviorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const sessionMap: Record<string, UserBehaviorEvent[]> = {};

    for (const event of events) {
      if (!sessionMap[event.sessionId]) {
        sessionMap[event.sessionId] = [];
      }
      sessionMap[event.sessionId].push(event);
    }

    return Object.entries(sessionMap)
      .slice(0, limit)
      .map(([sessionId, sessionEvents]) => {
        const sorted = sessionEvents.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        const startTime = sorted[0].createdAt;
        const endTime = sorted[sorted.length - 1].createdAt;
        const duration = endTime.getTime() - startTime.getTime();
        const uniquePages = new Set(sessionEvents.map((e) => e.page)).size;

        return {
          sessionId,
          startTime,
          endTime,
          duration,
          eventCount: sessionEvents.length,
          pageCount: uniquePages,
        };
      })
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getUserRetention(
    userId: string,
    days: number = 30,
  ): Promise<{
    totalSessions: number;
    activeDays: number;
    avgSessionDuration: number;
    totalEvents: number;
    dayOfWeekDistribution: Record<string, number>;
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.userBehaviorEvent.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;
    const uniqueDays = new Set(
      events.map((e) => e.createdAt.toISOString().split('T')[0]),
    ).size;

    const totalSessionDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);
    const avgSessionDuration = uniqueSessions > 0 ? totalSessionDuration / uniqueSessions : 0;

    const dayOfWeekDistribution: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const event of events) {
      const dayName = dayNames[event.createdAt.getDay()];
      dayOfWeekDistribution[dayName]++;
    }

    return {
      totalSessions: uniqueSessions,
      activeDays: uniqueDays,
      avgSessionDuration,
      totalEvents: events.length,
      dayOfWeekDistribution,
    };
  }

  async getFeatureUsage(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Record<string, number>> {
    const events = await this.prisma.userBehaviorEvent.findMany({
      where: {
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    const usage: Record<string, number> = {};

    for (const event of events) {
      const key = `${event.page}-${event.eventName}`;
      usage[key] = (usage[key] || 0) + 1;
    }

    return usage;
  }

  async getPageAnalytics(page: string): Promise<{
    uniqueUsers: number;
    totalViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    topFeatures: Array<{ feature: string; count: number }>;
  }> {
    const events = await this.prisma.userBehaviorEvent.findMany({
      where: { page },
    });

    const uniqueUsers = new Set(events.map((e) => e.userId)).size;
    const avgTimeOnPage =
      events.length > 0
        ? events.reduce((sum, e) => sum + (e.timeOnPage || 0), 0) / events.length
        : 0;

    const featureCounts: Record<string, number> = {};
    for (const event of events) {
      if (event.eventName) {
        featureCounts[event.eventName] = (featureCounts[event.eventName] || 0) + 1;
      }
    }

    const topFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Simple bounce rate: sessions with only 1 event
    const sessions = new Map<string, UserBehaviorEvent[]>();
    for (const event of events) {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, []);
      }
      sessions.get(event.sessionId)!.push(event);
    }

    const bounceCount = Array.from(sessions.values()).filter((s) => s.length === 1).length;
    const bounceRate = sessions.size > 0 ? (bounceCount / sessions.size) * 100 : 0;

    return {
      uniqueUsers,
      totalViews: events.length,
      avgTimeOnPage,
      bounceRate,
      topFeatures,
    };
  }

  async getFunnelMetrics(
    funnelName: string,
  ): Promise<
    Array<{
      step: number;
      stepName?: string;
      count: number;
      dropoffRate: number;
      conversionRate: number;
    }>
  > {
    const events = await this.prisma.userBehaviorEvent.findMany({
      where: { funnelStep: funnelName },
      orderBy: { funnelStepPosition: 'asc' },
    });

    const stepMetrics: Record<number, number> = {};

    for (const event of events) {
      const key = event.funnelStepPosition || 0;
      stepMetrics[key] = (stepMetrics[key] || 0) + 1;
    }

    const sortedSteps = Object.entries(stepMetrics)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([step, count]) => parseInt(step));

    const maxCount = Math.max(...Object.values(stepMetrics), 1);

    return sortedSteps.map((step, index) => {
      const count = stepMetrics[step];
      const dropoffRate = ((maxCount - count) / maxCount) * 100;
      const conversionRate = index === 0 ? 100 : (count / maxCount) * 100;

      return {
        step,
        count,
        dropoffRate,
        conversionRate,
      };
    });
  }

  async getUserJourney(userId: string, limit: number = 100): Promise<UserBehaviorEvent[]> {
    return this.prisma.userBehaviorEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
