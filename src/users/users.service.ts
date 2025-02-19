// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllVolunteers() {
    return this.userRepository.find({
      where: { role: UserRole.VOLUNTEER },
      select: ['id', 'name', 'email'], // Only return necessary fields
      order: { name: 'ASC' },
    });
  }

  async getVolunteerStats() {
    const totalVolunteers = await this.userRepository.count({
      where: { role: UserRole.VOLUNTEER },
    });

    return { totalVolunteers };
  }
}