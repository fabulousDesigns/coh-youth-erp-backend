// src/program-centers/program-centers.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ProgramCentersService } from './program-centers.service';
  import { CreateProgramCenterDto } from './dto/create-program-center.dto';
  import { UpdateProgramCenterDto } from './dto/update-program-center.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
 
  import { UserRole } from '../entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
  
  @Controller('program-centers')
  @UseGuards(JwtAuthGuard)
  export class ProgramCentersController {
    constructor(private readonly programCentersService: ProgramCentersService) {}
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createProgramCenterDto: CreateProgramCenterDto) {
      return this.programCentersService.create(createProgramCenterDto);
    }
  
    @Get()
    findAll() {
      return this.programCentersService.findAll();
    }
  
    @Get('stats')
    getStats() {
      return this.programCentersService.getStats();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.programCentersService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateProgramCenterDto: UpdateProgramCenterDto,
    ) {
      return this.programCentersService.update(id, updateProgramCenterDto);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.programCentersService.remove(id);
    }
  }