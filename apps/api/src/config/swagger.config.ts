import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger/OpenAPI dokümantasyon yapılandırması
 * @param app NestJS uygulaması
 */
export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('KentNabız API')
    .setDescription(
      'KentNabız uygulaması API dokümantasyonu. Bu API, vatandaşların şehir sorunlarını bildirebilmesi ve belediye birimlerinin bu sorunları takip edebilmesi için gerekli endpointleri sağlar.'
    )
    .setVersion('1.0')
    .setContact('KentNabız Destek', 'https://kentnabiz.com', 'destek@kentnabiz.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Geliştirme Ortamı')
    .addServer('https://api.kentnabiz.com', 'Production Ortamı')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: "JWT token'ı girin",
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Kimlik doğrulama işlemleri')
    .addTag('users', 'Kullanıcı yönetimi')
    .addTag('reports', 'Raporlama işlemleri')
    .addTag('media', 'Medya yönetimi')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // Swagger UI yapılandırması
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
    customSiteTitle: 'KentNabız API Dokümantasyonu',
    customfavIcon: 'https://kentnabiz.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });
};
