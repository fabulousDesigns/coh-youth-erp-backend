// src/users/users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserRole } from '../entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('volunteers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getVolunteers() {
    return this.usersService.findAllVolunteers();
  }

  @Get('volunteers/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getVolunteerStats() {
    return this.usersService.getVolunteerStats();
  }
}