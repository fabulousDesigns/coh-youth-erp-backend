// src/library/dto/create-material.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MaterialType } from '../../entities/library-material.entity';

export class CreateMaterialDto {
  @IsNotEmpty()
  originalName: string;

  @IsEnum(MaterialType)
  type: MaterialType;
}