import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Injectable()
export class FileService {
    private logger = new Logger(FileService.name)

    constructor(
        private readonly prisma: PrismaService
    ) { }

    public async updateFileUser(userId: number, fileId: number) {
        this.prisma.fileInput.update({
            where: {
                id: fileId
            },
            data: {
                userId: userId
            }
        })
    }

    async saveFile(userId: bigint, file: Express.Multer.File) {
        const hasExtensions: boolean = file.originalname.split('.').length > 1

        const splited = hasExtensions ? file.originalname.split('.') : file.originalname
        const fileextension = hasExtensions ? splited[splited.length - 1] : 'unknown'
        const filename = splited[0]

        let record = await this.prisma.fileInput.create({
            data: {
                filename: filename,
                fileextension: fileextension,
                savename: file.filename,
                fileSize: file.size,
                userId: userId,
            }
        })

        this.logger.log(`Saved file record ${record.id} - ${record.filename}`)

        return record
    }
}
