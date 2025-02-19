// src/attendance/attendance.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '../entities/attendance.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  async markAttendance(
    @Body() body: { date: string; status: AttendanceStatus },
    @Req() req,
  ) {
    return this.attendanceService.markAttendance(
      body.date,
      body.status,
      req.user.id,
    );
  }

  @Get('volunteer')
  async getVolunteerAttendance(@Req() req) {
    return this.attendanceService.getVolunteerAttendance(req.user.id);
  }

  @Get('report')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAttendanceReport(
    @Query(ValidationPipe) filters: AttendanceFilterDto,
  ) {
    return this.attendanceService.getAttendanceReport(filters);
  }

  @Get('summary')
  async getAttendanceSummary(
    @Query('date') date: string,
    @Query('programCenterId') programCenterId: number,
  ) {
    return this.attendanceService.getAttendanceSummary(date, programCenterId);
  }
}
