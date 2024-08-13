import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';
import { FileUpdateUserDto } from 'src/file/dtos/file.update.user.dto';
import { FilePipe } from 'src/file/pipes/file/file.pipe';
import { FileService } from 'src/file/services/file/file.service';
import * as fs from 'fs'
import * as path from 'path';

@Controller('file')
export class FileController {

    private logger = new Logger(FileController.name)
    constructor(
        private readonly fileService: FileService
    ) { }

    @Post('upload/:userId')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 15 * 1000 * 1000
        },
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                let id = req.params.userId

                const hasExtension = file.originalname.split('.').length > 1
                const extension = hasExtension ? file.originalname.split('.')[1] : 'unknown'
                const filename = Date.now();

                fs.access('./uploads/' + id, (err) => {
                    if (err) {
                        fs.mkdirSync('./uploads/' + id)
                        new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                            cb(null, id + "/" + filename + '.' + extension)
                        })
                    } else {
                        cb(null, id + "/" + filename + '.' + extension)
                    }
                })

                return filename.toString()
            }
        })
    }))
    async uploadFile(
        @UploadedFile(
            new FilePipe()
        )
        file: Express.Multer.File,
        @Param('userId') userId: string
    ) {
        const hasError = (file as any).error !== undefined
        if (hasError) {
            return file
        }

        let record = await this.fileService.saveFile(BigInt(userId), file)

        return record
    }

    @Get(':userId/:fileName')
    seeUploadedFile(@Param('userId') userId: string, @Param('fileName') fileName: string, @Res() res) {
        if (!this.isImageFile(fileName)) return new HttpException("Not an image file", 400)

        return res.sendFile(fileName, { root: `./uploads/${userId}` })
    }

    private isImageFile(file: string) {
        return file.endsWith('.jpg') || file.endsWith('.png') ||
            file.endsWith('.jpeg') || file.endsWith('.gif') ||
            file.endsWith('.webp') || file.endsWith('.svg')
    }
}
