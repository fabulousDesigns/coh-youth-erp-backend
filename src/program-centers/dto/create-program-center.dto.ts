// src/program-centers/dto/create-program-center.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProgramCenterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  coordinatorId: number;
}