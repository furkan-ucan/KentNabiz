import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { MulterFile } from '../interfaces/multer-file.interface';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to upload',
  })
  file!: MulterFile;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the file should be publicly accessible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom filename to use (without extension)',
  })
  @IsOptional()
  @IsString()
  filename?: string;
}

export class UploadFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'The files to upload',
  })
  files!: MulterFile[];

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the files should be publicly accessible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
