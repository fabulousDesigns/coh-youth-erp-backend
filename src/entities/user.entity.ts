// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ProgramCenter } from './program-center.entity';

export enum UserRole {
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOLUNTEER,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => ProgramCenter, { nullable: true })
  programCenter: ProgramCenter;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
