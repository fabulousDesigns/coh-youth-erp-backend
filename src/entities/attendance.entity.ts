// src/entities/attendance.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ProgramCenter } from './program-center.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent'
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  volunteer: User;

  @ManyToOne(() => ProgramCenter)
  programCenter: ProgramCenter;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus
  })
  status: AttendanceStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  markedBy: User;
}