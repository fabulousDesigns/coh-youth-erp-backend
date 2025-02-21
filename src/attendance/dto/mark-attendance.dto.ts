// dto/mark-attendance.dto.ts
import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from 'src/entities/attendance.entity';

export class MarkAttendanceDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
