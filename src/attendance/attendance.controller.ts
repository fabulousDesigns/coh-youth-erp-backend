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
  Res,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { AttendanceStatus } from '../entities/attendance.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Response } from 'express';

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  @Get('report/download')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async downloadReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('programCenterId') programCenterId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.attendanceService.generateAttendanceReport(
      startDate,
      endDate,
      programCenterId ? parseInt(programCenterId) : undefined,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="attendance-report-${startDate}-to-${endDate}.xlsx"`,
    });

    res.send(buffer);
  }
}
