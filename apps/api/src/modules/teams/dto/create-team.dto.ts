import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeamStatus } from '@kentnabiz/shared';
import { PointDto } from '../../reports/dto/point.dto';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Emergency Response Team Alpha',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Department ID that the team belongs to',
    example: 1,
    required: true,
  })
  @IsInt()
  @Type(() => Number)
  departmentId!: number;

  @ApiProperty({
    description: 'User ID of the team leader',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  teamLeaderId?: number;

  @ApiProperty({
    description: 'Initial status of the team',
    enum: TeamStatus,
    enumName: 'TeamStatus',
    example: TeamStatus.AVAILABLE,
    required: false,
    default: TeamStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @ApiProperty({
    description: 'Base location of the team',
    type: PointDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => PointDto)
  @IsOptional()
  baseLocation?: PointDto;

  @ApiProperty({
    description: 'Team description',
    example: 'Specialized team for emergency response and disaster management',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
