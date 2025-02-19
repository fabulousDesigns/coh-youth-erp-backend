// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { ProgramCentersModule } from './program-centers/program-centers.module';
import { LibraryModule } from './library/library.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    ProgramCentersModule,
    LibraryModule,
    AttendanceModule,
    DashboardModule,
    UsersModule
  ],
})
export class AppModule {}