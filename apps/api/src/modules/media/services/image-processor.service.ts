import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { FileMetadata } from '../interfaces/file-metadata.interface';

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  async processImage(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    options: {
      resize?: { width?: number; height?: number };
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp' | 'avif';
      extractMetadata?: boolean;
    } = {}
  ): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    try {
      const {
        resize = { width: 1200 },
        quality = 80,
        format = 'jpeg',
        extractMetadata = true,
      } = options;

      // Create a sharp instance with the input buffer
      let image = sharp(buffer);

      // Extract metadata if needed
      let metadata: FileMetadata = {
        size: buffer.length,
        mimetype,
        originalname,
      };

      if (extractMetadata) {
        const imageMetadata = await image.metadata();
        metadata = {
          ...metadata,
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
          exif: imageMetadata.exif ? {} : undefined, // Simplified for now
        };
      }

      // Resize if dimensions are provided
      if (resize.width || resize.height) {
        image = image.resize({
          width: resize.width,
          height: resize.height,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to specified format with quality setting
      switch (format) {
        case 'jpeg':
          image = image.jpeg({ quality });
          break;
        case 'png':
          image = image.png({ quality: (quality / 100) * 9 }); // PNG quality is 0-9
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
        case 'avif':
          image = image.avif({ quality });
          break;
      }

      // Get the processed buffer
      const processedBuffer = await image.toBuffer();

      // Update metadata for the processed image
      if (extractMetadata) {
        const processedMetadata = await sharp(processedBuffer).metadata();
        metadata = {
          ...metadata,
          width: processedMetadata.width,
          height: processedMetadata.height,
          format: processedMetadata.format,
          size: processedBuffer.length,
        };
      }

      return { buffer: processedBuffer, metadata };
    } catch (error) {
      this.logger.error(
        `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new Error(
        `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateThumbnail(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    try {
      const { width = 200, height = 200, quality = 70, format = 'jpeg' } = options;

      let thumbnail = sharp(buffer).resize({
        width,
        height,
        fit: 'cover',
        position: 'centre',
      });

      // Set format and quality
      switch (format) {
        case 'jpeg':
          thumbnail = thumbnail.jpeg({ quality });
          break;
        case 'png':
          thumbnail = thumbnail.png({ quality: (quality / 100) * 9 });
          break;
        case 'webp':
          thumbnail = thumbnail.webp({ quality });
          break;
      }

      return await thumbnail.toBuffer();
    } catch (error) {
      this.logger.error(
        `Error generating thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new Error(
        `Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Could not determine image dimensions');
      }
      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      this.logger.error(
        `Error getting image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new Error(
        `Failed to get image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }
}
