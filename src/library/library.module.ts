// src/library/library.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryMaterial } from '../entities/library-material.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryMaterial]),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}