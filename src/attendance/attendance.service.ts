// src/attendance/attendance.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { User } from '../entities/user.entity';
import { ProgramCenter } from '../entities/program-center.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProgramCenter)
    private programCenterRepository: Repository<ProgramCenter>,
  ) {}

// src/attendance/attendance.service.ts
async markAttendance(
  date: string,
  status: AttendanceStatus,
  userId: number
): Promise<Attendance> {
  const volunteer = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['programCenter']
  });

  if (!volunteer) {
    throw new NotFoundException('Volunteer not found');
  }

  if (!volunteer.programCenter) {
    throw new BadRequestException('Volunteer is not assigned to any program center');
  }

  const programCenter = await this.programCenterRepository.findOne({
    where: { id: volunteer.programCenter.id }
  });

  if (!programCenter) {
    throw new NotFoundException('Program center not found');
  }

  const existingAttendance = await this.attendanceRepository.findOne({
    where: {
      volunteer: { id: userId },
      date: new Date(date),
    },
  });

  if (existingAttendance) {
    existingAttendance.status = status;
    return this.attendanceRepository.save(existingAttendance);
  }

  const attendance = this.attendanceRepository.create({
    volunteer,
    programCenter,
    date: new Date(date),
    status,
  });

  return this.attendanceRepository.save(attendance);
}

  async getAttendanceReport(
    filters: AttendanceFilterDto,
  ): Promise<Attendance[]> {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.volunteer', 'volunteer')
      .leftJoinAndSelect('attendance.programCenter', 'programCenter')
      .leftJoinAndSelect('attendance.markedBy', 'markedBy');

    if (filters.programCenterId) {
      query.andWhere('programCenter.id = :programCenterId', {
        programCenterId: filters.programCenterId,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('attendance.date', 'DESC').getMany();
  }

  async getVolunteerAttendance(userId: number): Promise<Attendance[]> {
    const volunteer = await this.userRepository.findOne({
      where: { id: userId },
    });
  
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
  
    // Get the current month's start and end dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
    return this.attendanceRepository.find({
      where: {
        volunteer: { id: userId },
        date: Between(startOfMonth, endOfMonth)
      },
      order: {
        date: 'DESC'
      }
    });
  }

  async getAttendanceSummary(date: string, programCenterId: number) {
    const summary = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.date = :date', { date })
      .andWhere('attendance.programCenter = :programCenterId', { programCenterId })
      .select('attendance.status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    const total = summary.reduce((acc, curr) => acc + parseInt(curr.count), 0);
    const present = summary.find(s => s.status === AttendanceStatus.PRESENT)?.count || 0;
    const absent = summary.find(s => s.status === AttendanceStatus.ABSENT)?.count || 0;

    return {
      date,
      total,
      present,
      absent,
    };
  }
}