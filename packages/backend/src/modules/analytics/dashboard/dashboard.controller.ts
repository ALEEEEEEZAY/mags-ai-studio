import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '@/decorators/current-user.decorator';

@Controller('analytics/dashboards')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post()
  async createDashboard(
    @Body()
    dto: {
      name: string;
      widgets: any[];
      projectId?: string;
      isDefault?: boolean;
    },
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.createDashboard(
      user.id,
      dto.name,
      dto.widgets,
      dto.projectId,
      dto.isDefault,
    );
  }

  @Get()
  async getUserDashboards(@CurrentUser() user: any) {
    return this.dashboardService.getUserDashboards(user.id);
  }

  @Get('default')
  async getDefaultDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getDefaultDashboard(user.id);
  }

  @Get(':id')
  async getDashboard(@Param('id') id: string) {
    return this.dashboardService.getDashboard(id);
  }

  @Put(':id')
  async updateDashboard(@Param('id') id: string, @Body() data: any) {
    return this.dashboardService.updateDashboard(id, data);
  }

  @Delete(':id')
  async deleteDashboard(@Param('id') id: string) {
    await this.dashboardService.deleteDashboard(id);
    return { success: true };
  }

  @Get('summary/analytics')
  async getAnalyticsSummary() {
    return this.dashboardService.getAnalyticsSummary();
  }

  @Get('summary/system')
  async getSystemDashboardData() {
    return this.dashboardService.getSystemDashboardData();
  }

  @Get('summary/user')
  async getUserAnalyticsSummary(@CurrentUser() user: any) {
    return this.dashboardService.getUserAnalyticsSummary(user.id);
  }

  @Get('project/:projectId/summary')
  async getProjectDashboardData(@Param('projectId') projectId: string) {
    return this.dashboardService.getProjectDashboardData(projectId);
  }
}
