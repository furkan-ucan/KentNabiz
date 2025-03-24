import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserProfileDto } from '../dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<UserProfileDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => new UserProfileDto(user));
  }

  async findOne(id: number): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserProfileDto(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserProfileDto> {
    // Check if email already exists
    const isEmailTaken = await this.userRepository.isEmailTaken(createUserDto.email);

    if (isEmailTaken) {
      throw new ConflictException('Email is already in use');
    }

    const newUser = await this.userRepository.create(createUserDto);
    return new UserProfileDto(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    // Check if user exists
    await this.findOne(id);

    // Check if email is taken (if email is being updated)
    if (updateUserDto.email) {
      const isEmailTaken = await this.userRepository.isEmailTaken(updateUserDto.email, id);

      if (isEmailTaken) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return new UserProfileDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    // Check if user exists
    await this.findOne(id);

    await this.userRepository.remove(id);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isPasswordValid = await user.validatePassword(oldPassword);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = newPassword;
    await this.userRepository.update(id, { password: newPassword });
  }
}
