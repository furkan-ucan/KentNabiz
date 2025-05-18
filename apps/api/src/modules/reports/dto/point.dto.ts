import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class PointDto {
  @ApiProperty({
    example: 'Point',
    description: "The type of the GeoJSON object, must be 'Point'.",
  })
  readonly type = 'Point';

  @ApiProperty({
    example: [28.9784, 41.0082],
    description: 'Coordinates of the point (longitude, latitude).',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates!: [number, number];
}
