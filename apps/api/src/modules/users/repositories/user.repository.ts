/**
 * @file user.repository.ts
 * @module users
 * @description
 * This file contains the `UserRepository` class, responsible for handling database operations related to users.
 * It provides methods for creating, updating, deleting, and querying user records using TypeORM.
 * Designed for use within a NestJS application architecture.
 * @license MIT
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserFindOptions } from '../interfaces/user.interface';

// TODO: add tests for custom user queries - coverage: 28%

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(options: IUserFindOptions): Promise<User | null> {
    return this.usersRepository.findOne({ where: options });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      roles: createUserDto.roles || [UserRole.USER],
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // TODO: add tests for update scenarios
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
    // TODO: add tests for email validation logic
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeUserId) {
      query.andWhere('user.id != :id', { id: excludeUserId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
