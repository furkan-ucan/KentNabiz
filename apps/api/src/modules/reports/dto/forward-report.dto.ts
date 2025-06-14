﻿import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MunicipalityDepartment } from '@kentnabiz/shared';

export class ForwardReportDto {
  @ApiProperty({
    description: 'Raporun yönlendirileceği yeni birim',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  @IsEnum(MunicipalityDepartment)
  @IsNotEmpty()
  newDepartment!: MunicipalityDepartment;

  @IsEnum(MunicipalityDepartment)
  @IsOptional()
  departmentCode?: MunicipalityDepartment;

  @ApiProperty({
    description: 'Rapor yönlendirme nedeni',
    example: 'Bu konu yollar ve altyapı birimimizin sorumluluk alanına giriyor.',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({
    description: 'Yönlendirmeyi yapan departman kodu',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.GENERAL_AFFAIRS,
    required: false,
  })
  @IsEnum(MunicipalityDepartment)
  @IsOptional()
  changedByDepartment?: MunicipalityDepartment;
}
