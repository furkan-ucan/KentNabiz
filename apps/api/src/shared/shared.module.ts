import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseEntity } from './entities/base.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BaseEntity])],
  exports: [TypeOrmModule],
})
export class SharedModule {}
