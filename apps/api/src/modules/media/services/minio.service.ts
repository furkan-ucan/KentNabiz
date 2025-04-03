import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { MulterFile } from '../interfaces/multer-file.interface';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly buckets = {
    public: 'public',
    private: 'private',
  };

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL', false),
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.ensureBucketsExist();
  }

  private async ensureBucketsExist(): Promise<void> {
    for (const bucketName of Object.values(this.buckets)) {
      try {
        const exists = await this.client.bucketExists(bucketName);
        if (!exists) {
          await this.client.makeBucket(
            bucketName,
            this.configService.get('MINIO_REGION', 'us-east-1'),
          );
          this.logger.log(`Bucket ${bucketName} created successfully`);

          // Set public policy for public bucket
          if (bucketName === this.buckets.public) {
            const policy = {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: '*',
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${bucketName}/*`],
                },
              ],
            };
            await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
            this.logger.log(`Public policy set for bucket ${bucketName}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error ensuring bucket ${bucketName} exists:`, error);
        throw error;
      }
    }
  }

  async uploadFile(
    file: MulterFile,
    bucketName: string = this.buckets.public,
    objectName = '',
  ): Promise<string> {
    if (!objectName) {
      // Generate a unique name if none provided
      const ext = file.originalname.split('.').pop();
      objectName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    }

    try {
      await this.client.putObject(bucketName, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      return this.getFileUrl(bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error uploading file to MinIO:`, error);
      throw error;
    }
  }

  async getFileUrl(bucketName: string, objectName: string): Promise<string> {
    // For public bucket, we can return a direct URL
    if (bucketName === this.buckets.public) {
      const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<number>('MINIO_PORT', 9000);
      const useSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);
      const protocol = useSSL ? 'https' : 'http';
      return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
    }

    // For private bucket, generate a presigned URL
    return await this.getPresignedUrl(bucketName, objectName);
  }

  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucketName, objectName, expiresIn);
    } catch (error) {
      this.logger.error(`Error generating presigned URL:`, error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    try {
      await this.client.removeObject(bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error deleting file from MinIO:`, error);
      throw error;
    }
  }

  async getObject(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const dataStream = await this.client.getObject(bucketName, objectName);
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        dataStream.on('data', (chunk) => chunks.push(chunk as Buffer));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', (err) => reject(err));
      });
    } catch (error) {
      this.logger.error(`Error getting object from MinIO:`, error);
      throw error;
    }
  }

  getBucketName(isPublic: boolean = true): string {
    return isPublic ? this.buckets.public : this.buckets.private;
  }
}
