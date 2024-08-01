import { Body, Controller, HttpStatus, Logger, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';
import { FileUpdateUserDto } from 'src/file/dtos/file.update.user.dto';
import { FilePipe } from 'src/file/pipes/file/file.pipe';
import { FileService } from 'src/file/services/file/file.service';
import * as fs from 'fs'

@Controller('file')
export class FileController {

    private logger = new Logger(FileController.name)
    constructor(
        private readonly fileService: FileService
    ) { }

    @Post('upload/:id')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 15 * 1000 * 1000
        },
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                let params = req.params
                let id = req.params.id

                const hasExtension = file.originalname.split('.').length > 1
                const extension = hasExtension ? file.originalname.split('.')[1] : 'unknown'

                fs.access('./uploads/' + id, (err) => {
                    if (err) {
                        fs.mkdirSync('./uploads/' + id)
                        new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                            cb(null, id + "/" + Date.now() + '.' + extension)
                        })
                    } else {
                        cb(null, id + "/" + Date.now() + '.' + extension)
                    }
                })
            }
        })
    }))
    async uploadFile(
        @UploadedFile(
            new FilePipe()
        )
        file: Express.Multer.File
    ) {
        const hasError = (file as any).error !== undefined
        if (hasError) {
            return file
        }

        let record = await this.fileService.saveFile(file)

        return record
    }
}
