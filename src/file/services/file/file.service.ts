import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { PrismaService } from 'src/prisma/services/prisma/prisma.service';

@Injectable()
export class FileService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    private async saveFileRecord(data: Prisma.FileInputCreateInput) {
        return this.prisma.fileInput.create({ data });
    }

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

    async saveFile(file: Express.Multer.File) {
        const hasExtensions: boolean = file.originalname.split('.').length > 1
        
        const fileextension = hasExtensions ? file.originalname.split('.')[1] : 'unknown'
        const filename = Date.now() + file.originalname
        console.log(filename, fileextension)

        let record = await this.saveFileRecord({
            fileextension: fileextension,
            filename: filename,
            fileSize: file.size,
        })

        return record
    }
}
