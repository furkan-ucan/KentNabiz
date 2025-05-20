// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
// --- REMOVE LogLevel ---
import { ValidationPipe, Logger /*, LogLevel */ } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
import './modules/media/interfaces/multer-file.interface';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Keep this logger configuration
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors();
  app.setGlobalPrefix('api');
  setupSwagger(app);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(
    `📝 Swagger documentation is available at: http://localhost:${port}/api/docs`,
    'Bootstrap'
  );
}

bootstrap().catch((err: Error) => {
  Logger.error(`❌ Application failed to start: ${err.message}`, err.stack, 'Bootstrap');
  process.exit(1);
});
