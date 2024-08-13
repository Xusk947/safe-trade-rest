import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

const oneKb = 1000;
const oneMb = oneKb * 1000;

const maxFileSize = 15 * oneMb;

@Injectable()
export class FilePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (value.size < maxFileSize) {
            return value
        }

        return {
            "statusCode": HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            "error": "File too large",
        }
    }
}
