// src/entities/library-material.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum MaterialType {
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  IMAGE = 'image',
  PRESENTATION = 'presentation'
}

@Entity('library_materials')
export class LibraryMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: MaterialType })
  type: MaterialType;

  @Column()
  filePath: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @ManyToOne(() => User)
  uploadedBy: User;

  @CreateDateColumn()
  uploadDate: Date;

  @Column({ type: 'bigint' })
  fileSize: number;
}