import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService, CreateEventDto } from './events.service';
import { CurrentUser } from '@/decorators/current-user.decorator';

@Controller('analytics/events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  async trackEvent(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.trackEvent({
      ...dto,
      userId: dto.userId || user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    });
  }

  @Post('batch')
  async batchTrackEvents(@Body() events: CreateEventDto[], @CurrentUser() user: any) {
    const enriched = events.map((e) => ({
      ...e,
      userId: e.userId || user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    }));
    return this.eventsService.batchTrackEvents(enriched);
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @Get('user/:userId')
  async getEventsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.eventsService.getEventsByUser(userId, { limit, offset });
  }

  @Get('project/:projectId')
  async getEventsByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.getEventsByProject(projectId, { limit });
  }

  @Get('stats/overview')
  async getEventStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.eventsService.getEventStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('search')
  async searchEvents(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.searchEvents(query, { limit });
  }
}
