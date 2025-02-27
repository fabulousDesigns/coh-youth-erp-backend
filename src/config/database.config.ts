// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ProgramCenter } from '../entities/program-center.entity';
import { LibraryMaterial } from '../entities/library-material.entity';
import { Attendance } from '../entities/attendance.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'cohuser',
  password: '12345678',
  database: 'coh_youth_erp',
  entities: [User, ProgramCenter, LibraryMaterial, Attendance],
  synchronize: true,
  logging: true,
};
