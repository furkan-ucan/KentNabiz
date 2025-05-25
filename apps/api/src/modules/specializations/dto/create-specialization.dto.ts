import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecializationDto {
  @ApiProperty({
    description: 'Unique code for the specialization',
    example: 'PLUMBING',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Human-readable name of the specialization',
    example: 'Plumbing and Water Systems',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Detailed description of the specialization',
    example: 'Specialized in water pipe installation, maintenance, and emergency repairs',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Department ID that typically handles this specialization',
    example: 3,
    required: false,
  })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}
