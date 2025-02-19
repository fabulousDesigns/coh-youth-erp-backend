// src/library/library.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryMaterial, MaterialType } from '../entities/library-material.entity';
import { User } from '../entities/user.entity';
import { FileUpload } from './interfaces/file-upload.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryMaterial)
    private libraryRepository: Repository<LibraryMaterial>,
  ) {}

  private getFileType(filename: string): MaterialType {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
      case '.doc':
      case '.docx':
        return MaterialType.DOCUMENT;
      case '.xls':
      case '.xlsx':
        return MaterialType.SPREADSHEET;
      case '.jpg':
      case '.jpeg':
      case '.png':
        return MaterialType.IMAGE;
      case '.ppt':
      case '.pptx':
        return MaterialType.PRESENTATION;
      default:
        throw new BadRequestException('Unsupported file type');
    }
  }

  async uploadMaterial(
    file: FileUpload,
    user: User,
  ): Promise<LibraryMaterial> {
    const type = this.getFileType(file.originalname);
    
    const material = this.libraryRepository.create({
      name: file.originalname,
      type,
      filePath: file.path,
      originalName: file.originalname,
      fileSize: file.size,
      uploadedBy: user,
    });

    return this.libraryRepository.save(material);
  }

  async findAll(): Promise<LibraryMaterial[]> {
    return this.libraryRepository.find({
      relations: ['uploadedBy'],
      order: { uploadDate: 'DESC' },
    });
  }

  async findRecentMaterials(): Promise<LibraryMaterial[]> {
    return this.libraryRepository.find({
      relations: ['uploadedBy'],
      order: { uploadDate: 'DESC' },
      take: 5,
    });
  }

  async findOne(id: number): Promise<LibraryMaterial> {
    const material = await this.libraryRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);

    try {
      await fs.promises.unlink(material.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.libraryRepository.remove(material);
  }

  async getStats(): Promise<{ totalMaterials: number }> {
    const totalMaterials = await this.libraryRepository.count();
    return { totalMaterials };
  }

  async downloadFile(id: number): Promise<{ file: Buffer; filename: string }> {
    const material = await this.findOne(id);
  
    try {
      const fileContent = await fs.promises.readFile(material.filePath);
      return {
        file: fileContent,
        filename: material.originalName || material.name,
      };
    } catch (error) {
      console.error('Error reading file:', error);
      throw new NotFoundException('File not found');
    }
  }

  
}