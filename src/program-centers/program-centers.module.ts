// src/program-centers/program-centers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramCentersService } from './program-centers.service';
import { ProgramCentersController } from './program-centers.controller';
import { ProgramCenter } from '../entities/program-center.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramCenter, User]),
    AuthModule,
  ],
  controllers: [ProgramCentersController],
  providers: [ProgramCentersService],
  exports: [ProgramCentersService],
})
export class ProgramCentersModule {}