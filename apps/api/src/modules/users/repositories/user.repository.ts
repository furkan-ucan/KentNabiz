// apps/api/src/modules/users/repositories/user.repository.ts
/**
 * @file user.repository.ts
 * @module users
 * @description
 * This file contains the `UserRepository` class, responsible for handling database operations related to users.
 * It provides methods for creating, updating, deleting, and querying user records using TypeORM.
 * Designed for use within a NestJS application architecture.
 * @license MIT
 */

import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException eklendi (update metodu için)
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
// Doğru import yolu (önceki adımlarda konuştuğumuz gibi workspace path'leri yerine göreceli yol daha güvenli olabilir)
// Örnek: import { UserRole } from '../../../../../packages/shared/src/types/user.types';
import { UserRole } from '@kentnabiz/shared'; // Bu yolun çalıştığından emin olun, aksi takdirde göreceli yola geçin.
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserFindOptions } from '../interfaces/user.interface';

// TODO: add tests for custom user queries - coverage: 28%

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllWithRelations(relations: string[] = []): Promise<User[]> {
    return this.usersRepository.find({ relations });
  }

  async findOne(options: IUserFindOptions): Promise<User | null> {
    return this.usersRepository.findOne({ where: options });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByIdWithRelations(id: number, relations: string[] = []): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // User entity'sindeki default: [UserRole.CITIZEN] ayarı zaten bu işi yapmalı.
    // Eğer createUserDto.roles gelmiyorsa, entity'nin default'u devreye girer.
    // Bu satır, DTO'dan gelen rolleri önceliklendirir, gelmezse CITIZEN atar.
    // Ancak DTO'da `roles` alanı opsiyonel ve default değeri varsa, bu satır gereksiz olabilir.
    // Şimdilik, DTO'dan gelen rolleri kullanıp, gelmezse CITIZEN atayan mantığı koruyalım ama UserRole.USER'ı düzeltelim.
    const user = this.usersRepository.create({
      ...createUserDto,
      // Eğer CreateUserDto.roles opsiyonel ise ve User entity'sinde default rol varsa, bu satıra gerek olmayabilir.
      // Veya DTO'da default olarak [UserRole.CITIZEN] belirtilebilir.
      // Şimdilik mantığı koruyarak UserRole.USER -> UserRole.CITIZEN yapıyoruz.
      roles:
        createUserDto.roles && createUserDto.roles.length > 0
          ? createUserDto.roles
          : [UserRole.CITIZEN],
    });
    return this.usersRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // TODO: add tests for update scenarios
    const user = await this.findById(id);

    if (!user) {
      // Repository katmanında hata fırlatmak yerine null dönmek ve serviste hatayı yönetmek
      // daha yaygın bir pratiktir. Ancak burada hata fırlatılmış.
      // Servis katmanında zaten NotFoundException fırlatıldığı için bu satır kalabilir
      // veya daha genel bir Error fırlatılıp serviste spesifik NestJS exception'ına dönüştürülebilir.
      throw new NotFoundException(`User with ID ${id} not found for update.`); // Daha spesifik bir hata
    }

    // Object.assign, updateUserDto'daki undefined olmayan tüm property'leri user'a kopyalar.
    // Şifre gibi hassas alanların bu şekilde güncellenmemesi için DTO'da kontrol olmalı
    // veya burada özel bir mantıkla ele alınmalı (örneğin, şifre sadece changePassword ile değişmeli).
    // Mevcut User entity'sinde hashPassword @BeforeUpdate ile çalışıyor, bu iyi.
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    // Use soft delete instead of hard delete
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found for deletion.`);
    }
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
