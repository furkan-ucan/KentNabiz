import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 41.0082,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 28.9784,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;
}

export class RadiusSearchDto extends LocationDto {
  @ApiProperty({
    description: 'Search radius in meters',
    example: 1000,
    minimum: 10,
    maximum: 50000,
  })
  @IsNumber()
  @Min(10)
  @Max(50000)
  @Type(() => Number)
  radius: number;
}
