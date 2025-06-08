import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Department } from '../../modules/reports/entities/department.entity';
import { UserRole, MunicipalityDepartment } from '@kentnabiz/shared';
import { Logger } from '@nestjs/common';

const logger = new Logger('UsersSeed');

export const UsersSeed = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const departmentRepository = dataSource.getRepository(Department);

  if ((await userRepository.count()) > 0) {
    logger.log('Kullanıcı verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('Genişletilmiş kullanıcı seti oluşturuluyor...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Departmanları kodlarına göre haritalayalım
  const allDepts = await departmentRepository.find();
  const deptsByCode = allDepts.reduce(
    (acc, dept) => {
      acc[dept.code] = dept;
      return acc;
    },
    {} as Record<MunicipalityDepartment, Department>
  );

  const usersToCreate: Partial<User>[] = [
    // --- Ana Roller ---
    {
      email: 'admin@kentnabiz.com',
      fullName: 'Sistem Yöneticisi',
      password: defaultPassword,
      roles: [UserRole.SYSTEM_ADMIN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas1@kentnabiz.com',
      fullName: 'Vatandaş Ayşe',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas2@kentnabiz.com',
      fullName: 'Vatandaş Mehmet',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },

    // --- Fen İşleri Departmanı Kullanıcıları ---
    {
      email: 'supervisor.fen@kentnabiz.com',
      fullName: 'Fen İşleri Sorumlusu',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen1@kentnabiz.com',
      fullName: 'Fen İşleri Ekip Üyesi A1',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen2@kentnabiz.com',
      fullName: 'Fen İşleri Ekip Üyesi A2',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },

    // --- Park ve Bahçeler Departmanı Kullanıcıları ---
    {
      email: 'supervisor.park@kentnabiz.com',
      fullName: 'Park ve Bahçeler Sorumlusu',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },
    {
      email: 'member.park1@kentnabiz.com',
      fullName: 'Park ve Bahçeler Ekip Üyesi B1',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },

    // --- Temizlik İşleri Departmanı Kullanıcıları ---
    {
      email: 'supervisor.temizlik@kentnabiz.com',
      fullName: 'Temizlik İşleri Sorumlusu',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
    {
      email: 'member.temizlik1@kentnabiz.com',
      fullName: 'Temizlik Ekip Üyesi C1',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
  ];

  const userEntities = userRepository.create(usersToCreate); // Filtre kaldırıldı
  await userRepository.save(userEntities);
  logger.log(`${userEntities.length} kullanıcı başarıyla oluşturuldu.`);
};
