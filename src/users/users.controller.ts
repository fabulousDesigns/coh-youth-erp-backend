// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserRole } from '../entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

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

  @Post('volunteers')
  async createVolunteer(@Body() createVolunteerDto: CreateVolunteerDto) {
    const volunteer =
      await this.usersService.createVolunteer(createVolunteerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = volunteer;
    return result;
  }

  @Get('volunteers/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getVolunteerStats() {
    return this.usersService.getVolunteerStats();
  }

  @Put('volunteers/:id')
  async updateVolunteer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    const volunteer = await this.usersService.updateVolunteer(
      id,
      updateVolunteerDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = volunteer;
    return result;
  }

  @Get('volunteers/:id')
  async getVolunteer(@Param('id', ParseIntPipe) id: number) {
    const volunteer = await this.usersService.findVolunteerById(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = volunteer;
    return result;
  }

  @Delete('volunteers/:id')
  async deleteVolunteer(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteVolunteer(id);
  }
}
