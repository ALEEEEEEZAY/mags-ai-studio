import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MetricsService } from './metrics/metrics.service';

@WebSocketGateway({
  namespace: '/analytics',
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(AnalyticsGateway.name);
  private dashboardSubscribers: Map<string, Set<string>> = new Map();
  private metricsSubscribers: Map<string, Set<string>> = new Map();

  constructor(private metricsService: MetricsService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Analytics client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Analytics client disconnected: ${client.id}`);
    this.dashboardSubscribers.forEach((subscribers) => {
      subscribers.delete(client.id);
    });
    this.metricsSubscribers.forEach((subscribers) => {
      subscribers.delete(client.id);
    });
  }

  @SubscribeMessage('subscribe-dashboard')
  async handleSubscribeDashboard(client: Socket, dashboardId: string): Promise<void> {
    if (!this.dashboardSubscribers.has(dashboardId)) {
      this.dashboardSubscribers.set(dashboardId, new Set());
    }
    this.dashboardSubscribers.get(dashboardId)!.add(client.id);
    client.emit('subscribed', { dashboardId });
  }

  @SubscribeMessage('unsubscribe-dashboard')
  handleUnsubscribeDashboard(client: Socket, dashboardId: string): void {
    this.dashboardSubscribers.get(dashboardId)?.delete(client.id);
  }

  @SubscribeMessage('subscribe-metrics')
  handleSubscribeMetrics(client: Socket, metricId: string): void {
    if (!this.metricsSubscribers.has(metricId)) {
      this.metricsSubscribers.set(metricId, new Set());
    }
    this.metricsSubscribers.get(metricId)!.add(client.id);
    client.emit('subscribed-metrics', { metricId });
  }

  broadcastDashboardUpdate(dashboardId: string, data: any): void {
    const subscribers = this.dashboardSubscribers.get(dashboardId);
    if (subscribers && subscribers.size > 0) {
      this.server.to(Array.from(subscribers)).emit('dashboard-update', data);
    }
  }

  broadcastMetricUpdate(metricId: string, data: any): void {
    const subscribers = this.metricsSubscribers.get(metricId);
    if (subscribers && subscribers.size > 0) {
      this.server.to(Array.from(subscribers)).emit('metric-update', { metricId, data });
    }
  }

  broadcastSystemAlert(alert: any): void {
    this.server.emit('system-alert', alert);
  }

  broadcastAnomalyDetected(anomaly: any): void {
    this.server.emit('anomaly-detected', anomaly);
  }
}
