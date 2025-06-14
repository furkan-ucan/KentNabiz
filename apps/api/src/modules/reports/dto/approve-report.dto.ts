import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ApproveReportDto {
  @ApiProperty({
    description: 'Approval notes (optional)',
    example: 'İş kaliteli bir şekilde tamamlanmış, onaylandı.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Onay notu en fazla 500 karakter olabilir.' })
  notes?: string;
}
