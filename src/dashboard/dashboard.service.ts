// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ProgramCenter } from '../entities/program-center.entity';
import { LibraryMaterial } from '../entities/library-material.entity';
import { Attendance } from '../entities/attendance.entity';
import { Activity } from './interface/activity.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProgramCenter)
    private programCenterRepository: Repository<ProgramCenter>,
    @InjectRepository(LibraryMaterial)
    private libraryRepository: Repository<LibraryMaterial>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async getAdminStats() {
    const [totalCenters, totalVolunteers, totalMaterials, recentActivities] =
      await Promise.all([
        this.programCenterRepository.count(),
        this.userRepository.count({ where: { role: UserRole.VOLUNTEER } }),
        this.libraryRepository.count(),
        this.getRecentActivities(),
      ]);

    return {
      totalCenters,
      totalVolunteers,
      totalMaterials,
      recentActivities,
    };
  }

  async getVolunteerStats(userId: number) {
    // First, get the assigned center
    const assignedCenter = await this.programCenterRepository.findOne({
      where: { coordinator: { id: userId } },
      select: {
        id: true,
        name: true,
        location: true,
        coordinator: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      relations: ['coordinator'],
    });

    const [
      attendanceRecords,
      libraryAccess,
      recentActivities,
      totalVolunteers,
    ] = await Promise.all([
      this.attendanceRepository.find({
        where: { volunteer: { id: userId } },
        order: { date: 'DESC' },
        take: 30,
      }),
      this.libraryRepository.count(),
      this.getVolunteerRecentActivities(userId),
      this.userRepository.count({
        where: {
          programCenter: { id: assignedCenter?.id },
          role: UserRole.VOLUNTEER,
        },
      }),
    ]);

    const totalAttendance = attendanceRecords.filter(
      (record) => record.status === 'present',
    ).length;

    return {
      assignedCenter: assignedCenter?.name || 'Not Assigned',
      programCenterId: assignedCenter?.id || null,
      location: assignedCenter?.location || 'N/A',
      coordinator: assignedCenter
        ? {
            name: assignedCenter.coordinator.name,
            email: assignedCenter.coordinator.email,
            phone: assignedCenter.coordinator.phone || 'N/A',
          }
        : null,
      totalVolunteers,
      operatingHours: '9:00 AM - 5:00 PM',
      totalAttendance,
      libraryAccess,
      recentActivities,
    };
  }

  private async getRecentActivities(): Promise<Activity[]> {
    const activities: Activity[] = [];

    // Get recent library uploads
    const recentUploads = await this.libraryRepository.find({
      relations: ['uploadedBy'],
      order: { uploadDate: 'DESC' },
      take: 5,
    });

    activities.push(
      ...recentUploads.map((upload) => ({
        action: `New material "${upload.name}" added to Library`,
        timestamp: upload.uploadDate,
        type: 'library',
      })),
    );

    // Get recent attendance records
    const recentAttendance = await this.attendanceRepository.find({
      relations: ['volunteer', 'programCenter'],
      order: { date: 'DESC' },
      take: 5,
    });

    activities.push(
      ...recentAttendance.map((record) => ({
        action: `Attendance marked for ${record.volunteer.name} at ${record.programCenter.name}`,
        timestamp: record.date,
        type: 'attendance',
      })),
    );

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);
  }

  private async getVolunteerRecentActivities(
    userId: number,
  ): Promise<Activity[]> {
    const activities: Activity[] = [];

    // Get volunteer's recent attendance
    const recentAttendance = await this.attendanceRepository.find({
      where: { volunteer: { id: userId } },
      relations: ['programCenter'],
      order: { date: 'DESC' },
      take: 5,
    });

    activities.push(
      ...recentAttendance.map((record) => ({
        action: `Marked ${record.status} at ${record.programCenter.name}`,
        timestamp: record.date,
        type: 'attendance',
      })),
    );

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);
  }
}
