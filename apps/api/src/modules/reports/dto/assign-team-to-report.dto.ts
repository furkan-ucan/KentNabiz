import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignTeamToReportDto {
  @IsInt()
  @IsNotEmpty()
  teamId!: number;
}
