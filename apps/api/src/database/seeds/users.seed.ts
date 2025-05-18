import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '@KentNabiz/shared';
import { Logger } from '@nestjs/common'; // Import Logger

const logger = new Logger('UsersSeed'); // Create a logger instance

export const UsersSeed = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);

  // Kullanıcı verileri zaten varsa ekleme
  const userCount = await userRepository.count();
  if (userCount > 0) {
    logger.log('Kullanıcı verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('Başlangıç kullanıcıları oluşturuluyor...');

  // Örnek şifre hashle
  const plainPassword = 'password123'; // Store plain password for logging
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash(plainPassword, salt);
  logger.log(`Hashed default password ('${plainPassword}') to: ${defaultPassword}`);

  // Admin kullanıcı
  const admin = userRepository.create({
    email: 'admin@kentnabiz.com',
    fullName: 'Admin Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.SYSTEM_ADMIN],
    isEmailVerified: true,
  });

  // Moderatör kullanıcı (Geçici olarak SYSTEM_ADMIN, idealde DEPARTMENT_HEAD ve departmentId atanmalı)
  const moderator = userRepository.create({
    email: 'moderator@kentnabiz.com',
    fullName: 'Moderatör Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.SYSTEM_ADMIN],
    isEmailVerified: true,
  });

  // Normal kullanıcı
  const user = userRepository.create({
    email: 'user@kentnabiz.com',
    fullName: 'Normal Kullanıcı',
    password: defaultPassword, // Assign the pre-hashed password
    roles: [UserRole.CITIZEN],
    isEmailVerified: true,
  });

  // Test kullanıcısı
  const testUser = userRepository.create({
    email: 'test@kentnabiz.com',
    fullName: 'Test Kullanıcı',
    password: defaultPassword, // Assign the pre-hashed password
    roles: [UserRole.CITIZEN],
    isEmailVerified: false,
  });

  // --- START ADDED LOG ---
  logger.log(`Prepared to save user: ${user.email}, With Hashed Password: ${user.password}`);
  logger.log(`Prepared to save admin: ${admin.email}, With Hashed Password: ${admin.password}`);
  // Add similar logs for moderator and testUser if needed for debugging
  // --- END ADDED LOG ---

  // Kullanıcıları kaydet
  // Important: Save entities one by one or ensure hooks work with array save
  // Let's save individually to be absolutely sure hooks fire as expected per entity
  try {
    logger.log('Saving users individually...');
    await userRepository.save(admin);
    await userRepository.save(moderator);
    await userRepository.save(user);
    await userRepository.save(testUser);
    logger.log('Users saved successfully.');
  } catch (error) {
    logger.error('Error saving users during seed:', error);
    throw error; // Re-throw to indicate seed failure
  }

  logger.log('Kullanıcı seed işlemi tamamlandı!');
};
