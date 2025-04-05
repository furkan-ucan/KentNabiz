import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  ssl: configService.get<string>('DB_SSL') === 'true',

  // Runtime'da NestJS tüm entity'leri otomatik bulsun
  autoLoadEntities: true,

  // synchronize development dışında false kalmalı
  synchronize: false,

  // Geliştirme ortamında logging açık olsun
  logging: configService.get<string>('NODE_ENV') === 'development',
});
