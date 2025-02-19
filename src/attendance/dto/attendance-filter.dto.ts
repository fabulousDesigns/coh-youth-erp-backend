// src/attendance/dto/attendance-filter.dto.ts
import { IsOptional, IsDateString } from 'class-validator';

export class AttendanceFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  programCenterId?: number;
}