import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignUserToReportDto {
  @IsInt()
  @IsNotEmpty()
  userId!: number;
}
