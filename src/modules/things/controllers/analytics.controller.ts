import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  async getStats() {
    return await this.analyticsService.getAdminStats();
  }
}