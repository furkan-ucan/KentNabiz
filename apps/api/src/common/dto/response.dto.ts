import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}
