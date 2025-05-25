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
    roles: [UserRole.DEPARTMENT_SUPERVISOR],
    isEmailVerified: true,
    departmentId: 1,
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

  // Testte kullanılan kullanıcılar (ID ve e-posta eşleşecek)
  const testCitizen = userRepository.create({
    id: 1,
    email: 'citizen@test.com',
    fullName: 'Test Citizen',
    password: defaultPassword,
    roles: [UserRole.CITIZEN],
    isEmailVerified: true,
    departmentId: null,
  });
  const testTeamMember = userRepository.create({
    id: 2,
    email: 'team.member@test.com',
    fullName: 'Test Team Member',
    password: defaultPassword,
    roles: [UserRole.TEAM_MEMBER],
    isEmailVerified: true,
    departmentId: 1,
  });
  const testSupervisor = userRepository.create({
    id: 3,
    email: 'supervisor@test.com',
    fullName: 'Test Supervisor',
    password: defaultPassword,
    roles: [UserRole.DEPARTMENT_SUPERVISOR],
    isEmailVerified: true,
    departmentId: 1,
  });
  const testAdmin = userRepository.create({
    id: 4,
    email: 'admin@test.com',
    fullName: 'Test Admin',
    password: defaultPassword,
    roles: [UserRole.SYSTEM_ADMIN],
    isEmailVerified: true,
    departmentId: null,
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
    // Test kullanıcılarını da kaydet
    await userRepository.save(testCitizen);
    await userRepository.save(testTeamMember);
    await userRepository.save(testSupervisor);
    await userRepository.save(testAdmin);
    logger.log('Users saved successfully.');
  } catch (error) {
    logger.error('Error saving users during seed:', error);
    throw error; // Re-throw to indicate seed failure
  }

  logger.log('Kullanıcı seed işlemi tamamlandı!');
};
