import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { MinioService } from './services/minio.service';
import { ImageProcessorService } from './services/image-processor.service';
import { Media } from './entities/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [MediaController],
  providers: [MediaService, MinioService, ImageProcessorService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
