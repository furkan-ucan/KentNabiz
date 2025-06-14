import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { MinioService } from './minio.service';
import { ImageProcessorService } from './image-processor.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { MulterFile } from '../interfaces/multer-file.interface';
import { DeepPartial } from 'typeorm'; // Import DeepPartial

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly minioService: MinioService,
    private readonly imageProcessorService: ImageProcessorService
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
      let thumbnailUrl: string | undefined = undefined; // Initialize as undefined

      if (type === MediaType.IMAGE && this.imageProcessorService.isImage(file.mimetype)) {
        const { buffer, metadata: imageMetadata } = await this.imageProcessorService.processImage(
          file.buffer,
          file.originalname,
          file.mimetype,
          {
            resize: { width: 1200 }, // Example processing options
            quality: 80,
            format: 'jpeg',
          }
        );

        processedBuffer = buffer;
        metadata = { ...metadata, ...imageMetadata }; // Merge metadata

        // Only generate and upload thumbnail if processing occurred
        try {
          const thumbnailBuffer = await this.imageProcessorService.generateThumbnail(file.buffer); // Use original buffer for thumb potentially
          const thumbnailName = `thumb_${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

          thumbnailUrl = await this.minioService.uploadFile(
            {
              ...file,
              buffer: thumbnailBuffer,
              size: thumbnailBuffer.length,
              originalname: thumbnailName,
            }, // Provide necessary fields
            bucketName,
            thumbnailName
          );
        } catch (thumbError) {
          this.logger.error(
            `Thumbnail generation/upload failed: ${thumbError instanceof Error ? thumbError.message : 'Unknown error'}`,
            thumbError instanceof Error ? thumbError.stack : undefined
          );
          // Decide if you want to fail the whole upload or just proceed without thumbnail
          thumbnailUrl = undefined;
        }
      }

      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop() || 'bin'; // Fallback extension
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

      // Upload the main (potentially processed) file
      const url = await this.minioService.uploadFile(
        { ...file, buffer: processedBuffer, size: processedBuffer.length, originalname: filename }, // Provide necessary fields
        bucketName,
        filename
      );

      // Prepare data for entity creation, matching the Media entity structure
      // Using DeepPartial allows providing only necessary fields
      const mediaData: DeepPartial<Media> = {
        filename,
        originalname: file.originalname,
        url,
        mimetype: file.mimetype,
        type,
        size: processedBuffer.length,
        // Assign the structured metadata object. TypeORM handles saving to jsonb.
        metadata: metadata as unknown as Record<string, unknown>, // Ensure metadata is cast to the correct type
        thumbnailUrl: thumbnailUrl, // Assign the potentially generated URL (or undefined)
        bucketName,
        width: metadata.width, // Assign width from the metadata variable
        height: metadata.height, // Assign height from the metadata variable
      };

      // Create the TypeORM entity instance
      const mediaEntity = this.mediaRepository.create(mediaData);

      // Save the entity instance to the database
      return this.mediaRepository.save(mediaEntity);
    } catch (error) {
      this.logger.error(
        `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      // Re-throw a standard error type for the controller to handle
      throw new BadRequestException(
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async uploadMultipleFiles(files: MulterFile[], isPublic: boolean = true): Promise<Media[]> {
    // Use Promise.allSettled for better error handling if one file fails
    const results = await Promise.allSettled(files.map(file => this.uploadFile(file, isPublic)));

    const successfulUploads: Media[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        successfulUploads.push(result.value);
      } else {
        this.logger.error(`Multiple file upload failed for one file: ${result.reason}`);
        // Decide how to handle partial failures (e.g., collect errors, ignore, etc.)
      }
    });
    return successfulUploads; // Or throw an error if any failed, depending on requirements
  }

  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) {
      // Use NotFoundException for consistency when an item isn't found by ID
      throw new BadRequestException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async getPresignedUrl(id: number, expiresIn = 3600): Promise<string> {
    const media = await this.findOne(id); // findOne already throws if not found
    try {
      // Extract object name more safely
      const urlParts = new URL(media.url).pathname.split('/');
      const objectName = urlParts[urlParts.length - 1];
      if (!objectName) {
        throw new Error('Could not determine object name from URL');
      }
      // Ensure bucketName is not null/undefined before passing
      const bucket = media.bucketName ?? this.minioService.getBucketName(true); // Assume public if not set? Adjust logic needed.
      return await this.minioService.getPresignedUrl(bucket, objectName, expiresIn);
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL for media ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new BadRequestException(
        `Could not generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPresignedUrlByBucketKey(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    try {
      return await this.minioService.getPresignedUrl(bucket, key, expiresIn);
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL for bucket: ${bucket}, key: ${key}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined
      );
      throw new BadRequestException(
        `Could not generate download URL: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id); // findOne already throws if not found

    try {
      // Extract object name more safely
      const urlParts = new URL(media.url).pathname.split('/');
      const objectName = urlParts[urlParts.length - 1];
      const bucket = media.bucketName ?? this.minioService.getBucketName(true); // Assume public if not set?

      if (objectName) {
        await this.minioService.deleteFile(bucket, objectName);
      } else {
        this.logger.warn(`Could not determine object name to delete for media ${id} main file.`);
      }

      if (media.thumbnailUrl) {
        try {
          const thumbUrlParts = new URL(media.thumbnailUrl).pathname.split('/');
          const thumbObjectName = thumbUrlParts[thumbUrlParts.length - 1];
          if (thumbObjectName) {
            await this.minioService.deleteFile(bucket, thumbObjectName);
          } else {
            this.logger.warn(
              `Could not determine object name to delete for media ${id} thumbnail.`
            );
          }
        } catch (thumbError) {
          this.logger.error(
            `Could not delete thumbnail for media ${id}: ${thumbError instanceof Error ? thumbError.message : 'Unknown error'}`
          );
          // Decide if failure to delete thumbnail should stop the DB delete
        }
      }

      // Delete the database record
      const deleteResult = await this.mediaRepository.delete(id);
      if (deleteResult.affected === 0) {
        // This shouldn't happen if findOne succeeded, but good practice
        throw new Error('Media record could not be deleted from database.');
      }
    } catch (error) {
      this.logger.error(
        `Error removing media ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new BadRequestException(
        `Failed to remove media: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPrivateFileBuffer(filename: string): Promise<Buffer> {
    try {
      const bucketName = this.minioService.getBucketName(false); // private bucket
      return await this.minioService.getFileBuffer(bucketName, filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error getting private file buffer for ${filename}: ${errorMessage}`,
        errorStack
      );
      // Change to NotFoundException for better semantics
      throw new NotFoundException(
        `File not found or error retrieving file: ${filename}. Detail: ${errorMessage}`
      );
    }
  }

  async findByFilename(filename: string): Promise<Media | null> {
    try {
      return await this.mediaRepository.findOne({
        where: { filename },
      });
    } catch (error) {
      this.logger.error(
        `Error finding media by filename ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      return null;
    }
  }

  private determineFileType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    if (
      mimetype === 'application/pdf' ||
      mimetype === 'application/msword' || // Note: Modern Word uses application/vnd.openxmlformats-officedocument.wordprocessingml.document
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype.includes('document') || // Broader check
      mimetype.includes('spreadsheet') ||
      mimetype === 'text/plain'
    )
      return MediaType.DOCUMENT;
    return MediaType.OTHER;
  }
}
