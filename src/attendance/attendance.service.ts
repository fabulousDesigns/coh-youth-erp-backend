// src/attendance/attendance.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { User } from '../entities/user.entity';
import { ProgramCenter } from '../entities/program-center.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import * as ExcelJS from 'exceljs';

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

  async markAttendance(
    date: string,
    status: AttendanceStatus,
    userId: number,
    markedById: number,  // Add markedById parameter
  ): Promise<Attendance> {
    const volunteer = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['programCenter'],
    });
  
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
  
    if (!volunteer.programCenter) {
      throw new BadRequestException(
        'Volunteer is not assigned to any program center',
      );
    }
  
    const programCenter = await this.programCenterRepository.findOne({
      where: { id: volunteer.programCenter.id },
    });
  
    if (!programCenter) {
      throw new NotFoundException('Program center not found');
    }
  
    // Get the user who is marking attendance
    const markedBy = await this.userRepository.findOne({
      where: { id: markedById },
    });
  
    if (!markedBy) {
      throw new NotFoundException('User marking attendance not found');
    }
  
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        volunteer: { id: userId },
        date: new Date(date),
      },
    });
  
    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.markedBy = markedBy;  
      return this.attendanceRepository.save(existingAttendance);
    }
  
    const attendance = this.attendanceRepository.create({
      volunteer,
      programCenter,
      date: new Date(date),
      status,
      markedBy, 
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
        date: Between(startOfMonth, endOfMonth),
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async getAttendanceSummary(date: string, programCenterId: number) {
    const summary = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.date = :date', { date })
      .andWhere('attendance.programCenter = :programCenterId', {
        programCenterId,
      })
      .select('attendance.status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    const total = summary.reduce((acc, curr) => acc + parseInt(curr.count), 0);
    const present =
      summary.find((s) => s.status === AttendanceStatus.PRESENT)?.count || 0;
    const absent =
      summary.find((s) => s.status === AttendanceStatus.ABSENT)?.count || 0;

    return {
      date,
      total,
      present,
      absent,
    };
  }

  async generateAttendanceReport(
    startDate: string,
    endDate: string,
    programCenterId?: number,
  ): Promise<Buffer> {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Set up headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Volunteer Name', key: 'volunteerName', width: 25 },
      { header: 'Program Center', key: 'programCenter', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Marked By', key: 'markedBy', width: 25 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2B4162' }, // Navy blue
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Fetch attendance records
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.volunteer', 'volunteer')
      .leftJoinAndSelect('attendance.programCenter', 'programCenter')
      .leftJoinAndSelect('attendance.markedBy', 'markedBy')
      .where('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (programCenterId) {
      query.andWhere('programCenter.id = :programCenterId', {
        programCenterId,
      });
    }

    const records = await query
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('volunteer.name', 'ASC')
      .getMany();

    // Add data rows
    records.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        volunteerName: record.volunteer.name,
        programCenter: record.programCenter.name,
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
        markedBy: record.markedBy?.name || "Not Specified",
      });
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          if (cell.value === 'Present') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE8F5E9' }, // Light green
            };
          } else if (cell.value === 'Absent') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFCE7E7' }, // Light red
            };
          }
        });
      }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return await workbook.xlsx.writeBuffer();
  }
}
