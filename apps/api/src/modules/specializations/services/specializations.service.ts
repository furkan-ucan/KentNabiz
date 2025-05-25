// apps/api/src/modules/specializations/services/specializations.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialization } from '../entities/specialization.entity';
import { CreateSpecializationDto } from '../dto/create-specialization.dto';
import { UpdateSpecializationDto } from '../dto/update-specialization.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@KentNabiz/shared';

@Injectable()
export class SpecializationsService {
  constructor(
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>
  ) {}

  async create(
    createSpecializationDto: CreateSpecializationDto,
    authUser: JwtPayload
  ): Promise<Specialization> {
    // Authorization: Only SYSTEM_ADMIN can create specializations
    if (!authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      throw new ForbiddenException('Only system administrators can create specializations.');
    }

    // Check if code already exists
    const existingSpecialization = await this.specializationRepository.findOne({
      where: { code: createSpecializationDto.code },
    });

    if (existingSpecialization) {
      throw new ConflictException(
        `Specialization with code '${createSpecializationDto.code}' already exists.`
      );
    }

    // Create and save new specialization
    const specialization = this.specializationRepository.create(createSpecializationDto);
    return await this.specializationRepository.save(specialization);
  }

  async findAll(_authUser: JwtPayload): Promise<Specialization[]> {
    // All authenticated users can view specializations
    // In the future, this could be filtered by department or role if needed
    return await this.specializationRepository.find({
      relations: ['teamSpecializations'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, _authUser: JwtPayload): Promise<Specialization> {
    const specialization = await this.specializationRepository.findOne({
      where: { id },
      relations: ['teamSpecializations', 'teamSpecializations.team'],
    });

    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${id} not found.`);
    }

    return specialization;
  }

  async update(
    id: number,
    updateSpecializationDto: UpdateSpecializationDto,
    authUser: JwtPayload
  ): Promise<Specialization> {
    // Authorization: Only SYSTEM_ADMIN can update specializations
    if (!authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      throw new ForbiddenException('Only system administrators can update specializations.');
    }

    // Find existing specialization
    const specialization = await this.findOne(id, authUser);

    // Check if code is being updated and if it conflicts
    if (updateSpecializationDto.code && updateSpecializationDto.code !== specialization.code) {
      const existingSpecialization = await this.specializationRepository.findOne({
        where: { code: updateSpecializationDto.code },
      });

      if (existingSpecialization) {
        throw new ConflictException(
          `Specialization with code '${updateSpecializationDto.code}' already exists.`
        );
      }
    }

    // Update and save
    Object.assign(specialization, updateSpecializationDto);
    return await this.specializationRepository.save(specialization);
  }

  async remove(id: number, authUser: JwtPayload): Promise<void> {
    // Authorization: Only SYSTEM_ADMIN can delete specializations
    if (!authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      throw new ForbiddenException('Only system administrators can delete specializations.');
    }

    // Find existing specialization
    const specialization = await this.findOne(id, authUser);

    // Check if specialization is being used by any teams
    const specializationWithTeams = await this.specializationRepository.findOne({
      where: { id },
      relations: ['teamSpecializations'],
    });

    if (
      specializationWithTeams?.teamSpecializations &&
      specializationWithTeams.teamSpecializations.length > 0
    ) {
      throw new ConflictException(
        `Cannot delete specialization '${specialization.name}' as it is currently assigned to ${specializationWithTeams.teamSpecializations.length} team(s).`
      );
    }

    // Hard delete
    await this.specializationRepository.delete(id);
  }

  async findByCode(code: string): Promise<Specialization> {
    const specialization = await this.specializationRepository.findOne({
      where: { code },
      relations: ['teamSpecializations'],
    });

    if (!specialization) {
      throw new NotFoundException(`Specialization with code '${code}' not found.`);
    }

    return specialization;
  }

  async findByDepartment(departmentId: number): Promise<Specialization[]> {
    // Find specializations by typical department code
    // Since Specialization entity doesn't have departmentId, we use typicalDepartmentCode
    return await this.specializationRepository
      .createQueryBuilder('specialization')
      .leftJoinAndSelect('specialization.teamSpecializations', 'teamSpecializations')
      .leftJoinAndSelect('teamSpecializations.team', 'team')
      .where('team.departmentId = :departmentId', { departmentId })
      .orWhere('specialization.typicalDepartmentCode IS NOT NULL')
      .getMany();
  }

  // Additional utility methods
  async findByTypicalDepartmentCode(departmentCode: string): Promise<Specialization[]> {
    return await this.specializationRepository.find({
      where: { typicalDepartmentCode: departmentCode },
      order: { name: 'ASC' },
    });
  }

  async searchByName(name: string): Promise<Specialization[]> {
    return await this.specializationRepository
      .createQueryBuilder('specialization')
      .where('specialization.name ILIKE :name', { name: `%${name}%` })
      .orWhere('specialization.description ILIKE :name', { name: `%${name}%` })
      .orderBy('specialization.name', 'ASC')
      .getMany();
  }
}
