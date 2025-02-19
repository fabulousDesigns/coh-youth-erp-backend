// src/program-centers/dto/update-program-center.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateProgramCenterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  coordinatorId?: number;
}