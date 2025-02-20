// src/users/dto/update-volunteer.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateVolunteerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: any;

  @IsOptional()
  programCenterId?: number;
}
