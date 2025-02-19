// src/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserRole } from '../entities/user.entity';
import { DashboardService } from './dashboard.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('volunteer/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VOLUNTEER)
  getVolunteerStats(@GetUser() user) {
    return this.dashboardService.getVolunteerStats(user.id);
  }
}