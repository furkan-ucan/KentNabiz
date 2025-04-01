import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
// Multer tipleri için referans import
import './modules/media/interfaces/multer-file.interface';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger
  setupSwagger(app);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  Logger.log(`📝 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}

// Promise'i düzgün işleme
bootstrap().catch((err: Error) => {
  Logger.error(`❌ Application failed to start: ${err.message}`, err.stack);
  process.exit(1);
});
