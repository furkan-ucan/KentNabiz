import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { MinioService } from './minio.service';
import { ImageProcessorService } from './image-processor.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { MulterFile } from '../interfaces/multer-file.interface';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly minioService: MinioService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async uploadFile(file: MulterFile, isPublic: boolean = true): Promise<Media> {
    try {
      const type = this.determineFileType(file.mimetype);
      const bucketName = this.minioService.getBucketName(isPublic);

      let metadata: FileMetadata = {
        size: file.size,
        mimetype: file.mimetype,
        originalname: file.originalname,
      };

      let processedBuffer = file.buffer;
      let thumbnailUrl = '';

      if (type === MediaType.IMAGE && this.imageProcessorService.isImage(file.mimetype)) {
        const { buffer, metadata: imageMetadata } = await this.imageProcessorService.processImage(
          file.buffer,
          file.originalname,
          file.mimetype,
          {
            resize: { width: 1200 },
            quality: 80,
            format: 'jpeg',
          },
        );

        processedBuffer = buffer;
        metadata = { ...metadata, ...imageMetadata };

        const thumbnailBuffer = await this.imageProcessorService.generateThumbnail(file.buffer);
        const thumbnailName = `thumb_${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

        thumbnailUrl = await this.minioService.uploadFile(
          { ...file, buffer: thumbnailBuffer, size: thumbnailBuffer.length },
          bucketName,
          thumbnailName,
        );
      }

      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.originalname.split('.').pop()}`;
      const url = await this.minioService.uploadFile(
        { ...file, buffer: processedBuffer, size: processedBuffer.length },
        bucketName,
        filename,
      );

      const media = this.mediaRepository.create({
        filename,
        originalname: file.originalname,
        url,
        mimetype: file.mimetype,
        type,
        size: processedBuffer.length,
        metadata,
        thumbnailUrl,
        bucketName,
        width: metadata.width,
        height: metadata.height,
      });

      return this.mediaRepository.save(media);
    } catch (error) {
      this.logger.error(
        `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async uploadMultipleFiles(files: MulterFile[], isPublic: boolean = true): Promise<Media[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, isPublic)));
  }

  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) throw new BadRequestException(`Media with ID ${id} not found`);
    return media;
  }

  async getPresignedUrl(id: number, expiresIn = 3600): Promise<string> {
    const media = await this.findOne(id);
    const objectName = new URL(media.url).pathname.split('/').pop()!;
    return this.minioService.getPresignedUrl(media.bucketName || '', objectName, expiresIn);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);

    try {
      const objectName = new URL(media.url).pathname.split('/').pop()!;
      await this.minioService.deleteFile(media.bucketName || '', objectName);

      if (media.thumbnailUrl) {
        const thumbObjectName = new URL(media.thumbnailUrl).pathname.split('/').pop()!;
        await this.minioService.deleteFile(media.bucketName || '', thumbObjectName);
      }

      await this.mediaRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Error removing media: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to remove media: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private determineFileType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    if (
      mimetype === 'application/pdf' ||
      mimetype === 'application/msword' ||
      mimetype.includes('document')
    )
      return MediaType.DOCUMENT;
    return MediaType.OTHER;
  }
}
