import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { FileUploadInterceptor } from '../interceptors/file-upload.interceptor';
import { UploadFileDto, UploadFilesDto } from '../dto/upload-file.dto';
import { Media } from '../entities/media.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { MulterFile } from '../interfaces/multer-file.interface';

@ApiTags('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded',
    type: Media,
  })
  @UseInterceptors(
    FileInterceptor('file'),
    new FileUploadInterceptor({
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: /(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt)$/,
    }),
  )
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('isPublic') isPublic: boolean = true,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.uploadFile(file, isPublic);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Files to upload',
    type: UploadFilesDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The files have been successfully uploaded',
    type: [Media],
  })
  @UseInterceptors(
    FilesInterceptor('files', 10),
    new FileUploadInterceptor({
      maxCount: 10,
      maxSize: 10 * 1024 * 1024,
      allowedTypes: /(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt)$/,
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: MulterFile[],
    @Query('isPublic') isPublic: boolean = true,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return this.mediaService.uploadMultipleFiles(files, isPublic);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({
    status: 200,
    description: 'List of all media files',
    type: [Media],
  })
  async findAll(): Promise<Media[]> {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({
    status: 200,
    description: 'The media record',
    type: Media,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Media> {
    return this.mediaService.findOne(id);
  }

  @Get(':id/presigned')
  @ApiOperation({ summary: 'Get a presigned URL for a private file' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL',
    schema: {
      example: {
        url: 'https://s3.bucket.com/media/abc.jpg?token=abc123',
      },
    },
  })
  async getPresignedUrl(
    @Param('id', ParseIntPipe) id: number,
    @Query('expiresIn') expiresIn: number = 3600,
  ): Promise<{ url: string }> {
    const url = await this.mediaService.getPresignedUrl(id, expiresIn);
    return { url };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully deleted',
    schema: {
      example: {
        success: true,
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.mediaService.remove(id);
    return { success: true };
  }
}
