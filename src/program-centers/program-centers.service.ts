// src/program-centers/program-centers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramCenter } from '../entities/program-center.entity';
import { User } from '../entities/user.entity';
import { CreateProgramCenterDto } from './dto/create-program-center.dto';
import { UpdateProgramCenterDto } from './dto/update-program-center.dto';

@Injectable()
export class ProgramCentersService {
  constructor(
    @InjectRepository(ProgramCenter)
    private programCenterRepository: Repository<ProgramCenter>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProgramCenterDto: CreateProgramCenterDto): Promise<ProgramCenter> {
    // Check if coordinator exists
    const coordinator = await this.userRepository.findOne({
      where: { id: createProgramCenterDto.coordinatorId },
    });

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    // Check if center name already exists
    const existingCenter = await this.programCenterRepository.findOne({
      where: { name: createProgramCenterDto.name },
    });

    if (existingCenter) {
      throw new ConflictException('Program center with this name already exists');
    }

    const programCenter = this.programCenterRepository.create({
      name: createProgramCenterDto.name,
      location: createProgramCenterDto.location,
      coordinator: coordinator,
    });

    return this.programCenterRepository.save(programCenter);
  }

  async findAll(): Promise<ProgramCenter[]> {
    return this.programCenterRepository.find({
      relations: ['coordinator'],
    });
  }

  async findOne(id: number): Promise<ProgramCenter> {
    const programCenter = await this.programCenterRepository.findOne({
      where: { id },
      relations: ['coordinator'],
    });

    if (!programCenter) {
      throw new NotFoundException('Program center not found');
    }

    return programCenter;
  }

  async update(id: number, updateProgramCenterDto: UpdateProgramCenterDto): Promise<ProgramCenter> {
    const programCenter = await this.findOne(id);

    if (updateProgramCenterDto.coordinatorId) {
      const coordinator = await this.userRepository.findOne({
        where: { id: updateProgramCenterDto.coordinatorId },
      });

      if (!coordinator) {
        throw new NotFoundException('Coordinator not found');
      }

      programCenter.coordinator = coordinator;
    }

    if (updateProgramCenterDto.name) {
      programCenter.name = updateProgramCenterDto.name;
    }

    if (updateProgramCenterDto.location) {
      programCenter.location = updateProgramCenterDto.location;
    }

    return this.programCenterRepository.save(programCenter);
  }

  async remove(id: number): Promise<void> {
    const result = await this.programCenterRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Program center not found');
    }
  }

  async getStats(): Promise<{ totalCenters: number }> {
    const totalCenters = await this.programCenterRepository.count();
    return { totalCenters };
  }
}