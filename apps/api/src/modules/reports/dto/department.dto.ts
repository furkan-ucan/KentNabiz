import { IsEnum, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MunicipalityDepartment, ReportType } from '@kentnabiz/shared';

export class DepartmentDto {
  @ApiProperty({
    description: 'Birim kodu',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  @IsEnum(MunicipalityDepartment)
  code!: MunicipalityDepartment;

  @ApiProperty({
    description: 'Birim adı',
    example: 'Yollar ve Altyapı Hizmetleri Müdürlüğü',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Birim açıklaması',
    example: 'Yollar ve altyapı ile ilgili sorunların çözümü',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Birim aktif mi?',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Birimin sorumlu olduğu rapor türleri',
    type: [String],
    enum: ReportType,
    example: [ReportType.POTHOLE, ReportType.ROAD_DAMAGE],
    required: false,
  })
  @IsArray()
  @IsOptional()
  responsibleReportTypes?: ReportType[];
}
