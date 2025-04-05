import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { FileTypeValidator } from '@nestjs/common/pipes/file/file-type.validator';
import { MaxFileSizeValidator } from '@nestjs/common/pipes/file/max-file-size.validator';
import { ParseFilePipe } from '@nestjs/common/pipes';
import { Request } from 'express';
import { MulterFile } from '../interfaces/multer-file.interface';

interface RequestWithFile extends Request {
  file?: MulterFile;
  files?: MulterFile[];
}

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly validators: FileValidator[] = [
    new FileTypeValidator({
      fileType: /(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt)$/,
    }),
    new MaxFileSizeValidator({
      maxSize: 10 * 1024 * 1024, // 10MB
    }),
  ];

  constructor(
    private options?: {
      maxCount?: number;
      maxSize?: number;
      allowedTypes?: RegExp;
    }
  ) {
    if (options) {
      this.validators = [];

      if (options.allowedTypes) {
        this.validators.push(new FileTypeValidator({ fileType: options.allowedTypes }));
      } else {
        this.validators.push(
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt)$/,
          })
        );
      }

      if (options.maxSize) {
        this.validators.push(new MaxFileSizeValidator({ maxSize: options.maxSize }));
      } else {
        this.validators.push(new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }));
      }
    }
  }

  // --- CHANGE any TO unknown ---
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // --- END CHANGE ---
    const request = context.switchToHttp().getRequest<RequestWithFile>();

    if (request.file) {
      await this.validateFile(request.file);
    } else if (request.files) {
      if (this.options?.maxCount && request.files.length > this.options.maxCount) {
        throw new BadRequestException(
          `Too many files. Maximum ${this.options.maxCount} files are allowed.`
        );
      }

      for (const file of request.files) {
        await this.validateFile(file);
      }
    }

    return next.handle();
  }

  private async validateFile(file: MulterFile): Promise<void> {
    try {
      const parseFilePipe = new ParseFilePipe({
        validators: this.validators,
      });

      await parseFilePipe.transform(file);
    } catch (error) {
      throw new BadRequestException(
        `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
