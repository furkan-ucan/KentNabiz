import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectReportDto {
  @ApiProperty({
    description: 'Reason for rejection (required)',
    example: 'İş standartlara uygun değil, lütfen tekrar yapınız.',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Reddetme sebebi zorunludur.' })
  @IsString()
  @MaxLength(500, { message: 'Reddetme sebebi en fazla 500 karakter olabilir.' })
  reason!: string;
}
