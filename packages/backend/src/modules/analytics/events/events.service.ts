import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AnalyticsEvent, EventType, EventCategory } from '@prisma/client';

export interface CreateEventDto {
  eventType: EventType;
  eventName: string;
  eventCategory: EventCategory;
  userId?: string;
  projectId?: string;
  chatId?: string;
  agentId?: string;
  appId?: string;
  deploymentId?: string;
  properties: Record<string, any>;
  metadata?: Record<string, any>;
  duration?: number;
  statusCode?: number;
  error?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('analytics-events') private eventsQueue: Queue,
    @InjectQueue('metrics-aggregation') private metricsQueue: Queue,
  ) {}

  async trackEvent(dto: CreateEventDto): Promise<AnalyticsEvent> {
    this.logger.debug(`Tracking event: ${dto.eventName}`);

    const event = await this.prisma.analyticsEvent.create({
      data: {
        eventType: dto.eventType,
        eventName: dto.eventName,
        eventCategory: dto.eventCategory,
        userId: dto.userId,
        projectId: dto.projectId,
        chatId: dto.chatId,
        agentId: dto.agentId,
        appId: dto.appId,
        deploymentId: dto.deploymentId,
        properties: dto.properties,
        metadata: dto.metadata,
        duration: dto.duration,
        statusCode: dto.statusCode,
        error: dto.error,
        sessionId: dto.sessionId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        timestamp: new Date(),
        createdAt: new Date(),
      },
    });

    // Queue for processing
    await this.eventsQueue.add('process', { eventId: event.id }, { removeOnComplete: true });

    // Queue metric aggregation
    await this.metricsQueue.add('aggregate', { eventId: event.id }, { removeOnComplete: true });

    return event;
  }

  async batchTrackEvents(events: CreateEventDto[]): Promise<AnalyticsEvent[]> {
    this.logger.debug(`Batch tracking ${events.length} events`);

    const created = await Promise.all(
      events.map((event) => this.trackEvent(event)),
    );

    return created;
  }

  async getEvent(id: string): Promise<AnalyticsEvent | null> {
    return this.prisma.analyticsEvent.findUnique({
      where: { id },
    });
  }

  async getEventsByUser(
    userId: string,
    options?: { limit?: number; offset?: number; startDate?: Date; endDate?: Date },
  ): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        ...(options?.startDate && { timestamp: { gte: options.startDate } }),
        ...(options?.endDate && { timestamp: { lte: options.endDate } }),
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });
  }

  async getEventsByProject(
    projectId: string,
    options?: { limit?: number; offset?: number; eventType?: EventType },
  ): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: {
        projectId,
        ...(options?.eventType && { eventType: options.eventType }),
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });
  }

  async getEventCount(
    filter?: { userId?: string; projectId?: string; eventType?: EventType; startDate?: Date; endDate?: Date },
  ): Promise<number> {
    return this.prisma.analyticsEvent.count({
      where: {
        ...(filter?.userId && { userId: filter.userId }),
        ...(filter?.projectId && { projectId: filter.projectId }),
        ...(filter?.eventType && { eventType: filter.eventType }),
        ...(filter?.startDate && { timestamp: { gte: filter.startDate } }),
        ...(filter?.endDate && { timestamp: { lte: filter.endDate } }),
      },
    });
  }

  async getRecentEvents(limit: number = 50): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getEventsByCategory(
    category: EventCategory,
    options?: { limit?: number; startDate?: Date; endDate?: Date },
  ): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: {
        eventCategory: category,
        ...(options?.startDate && { timestamp: { gte: options.startDate } }),
        ...(options?.endDate && { timestamp: { lte: options.endDate } }),
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async searchEvents(
    query: string,
    options?: { limit?: number; eventType?: EventType },
  ): Promise<AnalyticsEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: {
        ...(options?.eventType && { eventType: options.eventType }),
        OR: [
          { eventName: { contains: query, mode: 'insensitive' } },
          { error: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async getEventStats(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    errorCount: number;
  }> {
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        timestamp: { gte: start, lte: end },
      },
    });

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let errorCount = 0;

    for (const event of events) {
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
      byCategory[event.eventCategory] = (byCategory[event.eventCategory] || 0) + 1;
      if (event.error) errorCount++;
    }

    return {
      totalEvents: events.length,
      byType,
      byCategory,
      errorCount,
    };
  }
}
