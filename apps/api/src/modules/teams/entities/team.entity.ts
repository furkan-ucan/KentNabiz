import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TeamStatus } from '@KentNabiz/shared';
import { Point } from 'geojson';
import { TeamSpecialization } from './team-specialization.entity';
import { Department } from '../../reports/entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { TeamMembershipHistory } from '../../users/entities/team-membership-history.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'department_id', type: 'int' })
  departmentId!: number;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'team_leader_id', type: 'int', nullable: true })
  teamLeaderId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_leader_id' })
  teamLeader?: User;

  @Column({ type: 'enum', enum: TeamStatus, default: TeamStatus.AVAILABLE })
  status!: TeamStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    name: 'base_location',
  })
  baseLocation?: Point;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    name: 'current_location',
  })
  currentLocation?: Point;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_location_update' })
  lastLocationUpdate?: Date;

  @OneToMany(() => TeamSpecialization, ts => ts.team)
  teamSpecializations!: TeamSpecialization[];

  @OneToMany(() => TeamMembershipHistory, tmh => tmh.team)
  membershipsHistory!: TeamMembershipHistory[];

  // TeamMembershipHistory, TeamSpecialization, Assignment ilişkileri (daha sonra eklenecek)
}
