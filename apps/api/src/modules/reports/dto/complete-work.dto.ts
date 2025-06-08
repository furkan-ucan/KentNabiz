import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class CompleteWorkDto {
  @ApiProperty({
    description: 'Array of Media IDs uploaded as resolution evidence. Cannot be empty.',
    example: [101, 102],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Resolution evidence media is required.' })
  @ArrayMinSize(1, { message: 'At least one proof media must be provided.' })
  @IsInt({ each: true, message: 'Each media ID must be an integer.' })
  proofMediaIds!: number[];

  @ApiPropertyOptional({ description: 'Optional notes about the resolution.' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
