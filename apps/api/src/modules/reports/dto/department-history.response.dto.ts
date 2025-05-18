import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';

export class DepartmentHistoryResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  reportId!: number;

  @ApiProperty({ type: () => Department, nullable: true })
  previousDepartment?: Department | null;

  @ApiProperty({ type: () => Department })
  newDepartment!: Department;

  @ApiProperty()
  reason!: string;

  @ApiProperty({ type: () => User })
  changedByUser!: User;

  @ApiProperty()
  changedAt!: Date;
}
