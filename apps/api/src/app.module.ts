// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MediaModule } from './modules/media/media.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './config/typeorm.config'; // yapılandırma fonksiyonu

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 🔥 ANA YAPI TİCARİ BAĞLANTI BURAYA EKLENİYOR 🔥
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getTypeOrmConfig(configService),
        // alternatifi:
        // autoLoadEntities: true,
        // synchronize: false,
      }),
      inject: [ConfigService],
    }),
    CoreModule,
    SharedModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
