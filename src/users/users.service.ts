// src/users/users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import * as bcrypt from 'bcrypt';
import { ProgramCenter } from '../entities/program-center.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProgramCenter)
    private readonly programCenterRepository: Repository<ProgramCenter>,
  ) {}

  async findAllVolunteers() {
    return this.userRepository.find({
      where: { role: UserRole.VOLUNTEER },
      select: ['id', 'name', 'email', 'phone'],
      relations: ['programCenter'],
      order: { name: 'ASC' },
    });
  }

  async getVolunteerStats() {
    const totalVolunteers = await this.userRepository.count({
      where: { role: UserRole.VOLUNTEER },
    });

    return { totalVolunteers };
  }

  async createVolunteer(createVolunteerDto: CreateVolunteerDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createVolunteerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createVolunteerDto.password, 10);
    // Create user entity
    const volunteer = new User();
    volunteer.name = createVolunteerDto.name;
    volunteer.email = createVolunteerDto.email;
    volunteer.password = hashedPassword;
    volunteer.phone = createVolunteerDto.phone || null;
    volunteer.role = UserRole.VOLUNTEER;

    // Handle program center assignment
    if (createVolunteerDto.programCenterId) {
      const programCenter = await this.programCenterRepository.findOne({
        where: { id: createVolunteerDto.programCenterId },
      });
      if (!programCenter) {
        throw new NotFoundException('Program center not found');
      }
      volunteer.programCenter = programCenter;
      volunteer.programCenterId = programCenter.id;
    } else {
      volunteer.programCenter = null;
      volunteer.programCenterId = null;
    }

    return this.userRepository.save(volunteer);
  }

  async updateVolunteer(
    id: number,
    updateVolunteerDto: UpdateVolunteerDto,
  ): Promise<User> {
    const volunteer = await this.userRepository.findOne({
      where: { id, role: UserRole.VOLUNTEER },
      relations: ['programCenter'],
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    if (
      updateVolunteerDto.email &&
      updateVolunteerDto.email !== volunteer.email
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateVolunteerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update basic fields
    if (updateVolunteerDto.name) volunteer.name = updateVolunteerDto.name;
    if (updateVolunteerDto.email) volunteer.email = updateVolunteerDto.email;
    if (updateVolunteerDto.phone !== undefined)
      volunteer.phone = updateVolunteerDto.phone || null;

    // Handle program center update
    if (updateVolunteerDto.programCenterId !== undefined) {
      if (updateVolunteerDto.programCenterId) {
        const programCenter = await this.programCenterRepository.findOne({
          where: { id: updateVolunteerDto.programCenterId },
        });
        if (!programCenter) {
          throw new NotFoundException('Program center not found');
        }
        volunteer.programCenter = programCenter;
        volunteer.programCenterId = programCenter.id;
      } else {
        volunteer.programCenter = null;
        volunteer.programCenterId = null;
      }
    }

    return this.userRepository.save(volunteer);
  }

  async deleteVolunteer(id: number): Promise<void> {
    const result = await this.userRepository.delete({
      id,
      role: UserRole.VOLUNTEER,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Volunteer not found');
    }
  }

  async findVolunteerById(id: number): Promise<User> {
    const volunteer = await this.userRepository.findOne({
      where: { id, role: UserRole.VOLUNTEER },
      relations: ['programCenter'],
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    return volunteer;
  }
}
