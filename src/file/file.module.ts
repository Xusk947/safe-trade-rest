import { Module } from '@nestjs/common';
import { FileService } from './services/file/file.service';
import { FileController } from './controllers/file/file.controller';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Module({
  providers: [FileService, PrismaService],
  controllers: [FileController]
})
export class FileModule {}
