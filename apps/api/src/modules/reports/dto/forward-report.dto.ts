import { IsNotEmpty, IsInt, Min, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ForwardReportDto {
  @ApiProperty({ description: "Raporun yönlendirileceği hedef departman ID'si", example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  targetDepartmentId!: number;

  @ApiProperty({ description: "Yönlendirmeyi yapan (kaynak) departmanın ID'si", example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  fromDepartmentId!: number;

  @ApiProperty({ description: 'Yönlendirme sebebi (zorunlu)', minLength: 10 })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason!: string;
}
