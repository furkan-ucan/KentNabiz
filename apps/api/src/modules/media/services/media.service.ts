import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { MinioService } from './minio.service';
import { ImageProcessorService } from './image-processor.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly minioService: MinioService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async uploadFile(file: Express.Multer.File, isPublic: boolean = true): Promise<Media> {
    try {
      // Determine file type
      const type = this.determineFileType(file.mimetype);
      const bucketName = this.minioService.getBucketName(isPublic);
      let metadata: FileMetadata = {
        size: file.size,
        mimetype: file.mimetype,
        originalname: file.originalname,
      };

      let processedBuffer = file.buffer;
      let thumbnailUrl = '';

      // If it's an image, process it and generate thumbnail
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

        // Generate and upload thumbnail
        const thumbnailBuffer = await this.imageProcessorService.generateThumbnail(file.buffer);
        const thumbnailName = `thumb_${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
        thumbnailUrl = await this.minioService.uploadFile(
          { ...file, buffer: thumbnailBuffer, size: thumbnailBuffer.length },
          bucketName,
          thumbnailName,
        );
      }

      // Upload the file to MinIO
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.originalname.split('.').pop()}`;
      const url = await this.minioService.uploadFile(
        { ...file, buffer: processedBuffer, size: processedBuffer.length },
        bucketName,
        filename,
      );

      // Create and save media record
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

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    isPublic: boolean = true,
  ): Promise<Media[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, isPublic));
    return Promise.all(uploadPromises);
  }

  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) {
      throw new BadRequestException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async getPresignedUrl(id: number, expiresIn: number = 3600): Promise<string> {
    const media = await this.findOne(id);

    // Extract object name from URL
    const url = new URL(media.url);
    const objectName = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);

    return this.minioService.getPresignedUrl(media.bucketName || '', objectName, expiresIn);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);

    try {
      // Get object names from URLs
      const urlObj = new URL(media.url);
      const objectName = urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1);

      // Delete file from MinIO
      await this.minioService.deleteFile(media.bucketName || '', objectName);

      // If thumbnail exists, delete it too
      if (media.thumbnailUrl) {
        const thumbUrlObj = new URL(media.thumbnailUrl);
        const thumbObjectName = thumbUrlObj.pathname.substring(
          thumbUrlObj.pathname.lastIndexOf('/') + 1,
        );
        await this.minioService.deleteFile(media.bucketName || '', thumbObjectName);
      }

      // Delete record from database
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
    if (mimetype.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimetype.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (
      mimetype.startsWith('application/pdf') ||
      mimetype.startsWith('application/msword') ||
      mimetype.includes('document')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}
