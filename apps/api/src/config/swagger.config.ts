import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('KentNabız API')
    .setDescription('KentNabız uygulaması API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Kimlik doğrulama işlemleri')
    .addTag('users', 'Kullanıcı yönetimi')
    .addTag('reports', 'Raporlama işlemleri')
    .addTag('media', 'Medya yönetimi')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
};
