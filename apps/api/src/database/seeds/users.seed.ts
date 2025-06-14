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

  logger.log('🧑‍💼 Zenginleştirilmiş ve gerçekçi kullanıcı seti oluşturuluyor...');
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
      fullName: 'Sistem Yöneticisi - Dr. Ayhan Kartal',
      password: defaultPassword,
      roles: [UserRole.SYSTEM_ADMIN],
      isEmailVerified: true,
    },

    // --- Vatandaşlar (Çeşitli Profiller) ---
    {
      email: 'vatandas.ayse@mail.com',
      fullName: 'Ayşe Yılmaz (Emekli Öğretmen)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.mehmet@mail.com',
      fullName: 'Mehmet Kaya (İnşaat Mühendisi)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.zehra@mail.com',
      fullName: 'Zehra Özkan (Ev Hanımı)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.ahmet@mail.com',
      fullName: 'Ahmet Çelik (Esnaf)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.elif@mail.com',
      fullName: 'Elif Yılmazer (Öğretmen)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.ibrahim@mail.com',
      fullName: 'İbrahim Kıran (Emekli)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.nazli@mail.com',
      fullName: 'Nazlı Demirhan (Doktor)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.burak@mail.com',
      fullName: 'Burak Kartal (Yazılımcı)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.sevgi@mail.com',
      fullName: 'Sevgi Öztürk (Avukat)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.kemal@mail.com',
      fullName: 'Kemal Güler (Usta)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },
    {
      email: 'vatandas.leyla@mail.com',
      fullName: 'Leyla Koç (İşletmeci)',
      password: defaultPassword,
      roles: [UserRole.CITIZEN],
      isEmailVerified: true,
    },

    // --- Fen İşleri ve Altyapı Departmanı ---
    {
      email: 'supervisor.fen@kentnabiz.com',
      fullName: 'Ahmet Öztürk (Fen İşleri Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen.asfalt@kentnabiz.com',
      fullName: 'Hasan Çelik (Asfalt Ustası)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen.altyapi@kentnabiz.com',
      fullName: 'Selin Demir (Altyapı Teknisyeni)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen.acil@kentnabiz.com',
      fullName: 'Caner Yıldız (Acil Müdahale Ekibi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen1@kentnabiz.com',
      fullName: 'Okan Büyük (Fen İşleri Operatör)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen2@kentnabiz.com',
      fullName: 'Serhat Akın (Makine Operatörü)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },
    {
      email: 'member.fen3@kentnabiz.com',
      fullName: 'Uğur Kaya (Ekskavatör Operatörü)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]?.id,
    },

    // --- Park ve Bahçeler Departmanı ---
    {
      email: 'supervisor.park@kentnabiz.com',
      fullName: 'Fatma Şahin (Park ve Bahçeler Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },
    {
      email: 'member.park.peyzaj@kentnabiz.com',
      fullName: 'Murat Arslan (Peyzaj Mimarı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },
    {
      email: 'member.park.bahci@kentnabiz.com',
      fullName: 'Elif Yılmaz (Bahçıvan)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },
    {
      email: 'member.park1@kentnabiz.com',
      fullName: 'Gökhan Aydın (Bahçıvan)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },
    {
      email: 'member.park2@kentnabiz.com',
      fullName: 'Derya Kılıç (Çiçek Uzmanı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]?.id,
    },

    // --- Temizlik İşleri Departmanı ---
    {
      email: 'supervisor.temizlik@kentnabiz.com',
      fullName: 'Zeynep Aksoy (Temizlik İşleri Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
    {
      email: 'member.temizlik.merkez@kentnabiz.com',
      fullName: 'Kenan Doğan (Merkez Bölge Temizlik Ekibi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
    {
      email: 'member.temizlik.cevre@kentnabiz.com',
      fullName: 'Aylin Kara (Çevre Sağlığı Uzmanı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
    {
      email: 'member.temizlik1@kentnabiz.com',
      fullName: 'Kenan Doğan (Temizlik Görevlisi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },
    {
      email: 'member.temizlik2@kentnabiz.com',
      fullName: 'Filiz Oral (Çöp Toplama Ekibi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]?.id,
    },

    // --- Su ve Kanalizasyon Departmanı ---
    {
      email: 'supervisor.su@kentnabiz.com',
      fullName: 'Elif Can (Su ve Kanalizasyon Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE]?.id,
    },
    {
      email: 'member.su.tesisat@kentnabiz.com',
      fullName: 'İsmail Kurt (Su Tesisatçısı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE]?.id,
    },
    {
      email: 'member.su1@kentnabiz.com',
      fullName: 'İsmail Kurt (Tesisatçı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE]?.id,
    },
    {
      email: 'member.su2@kentnabiz.com',
      fullName: 'Yusuf Kaan (Kanal Temizlik Uzmanı)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE]?.id,
    },

    // --- Elektrik ve Aydınlatma Departmanı ---
    {
      email: 'supervisor.elektrik@kentnabiz.com',
      fullName: 'Osman Kılıç (Elektrik İşleri Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.STREET_LIGHTING]?.id,
    },
    {
      email: 'member.elektrik.aydinlatma@kentnabiz.com',
      fullName: 'Serkan Aydın (Elektrikçi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.STREET_LIGHTING]?.id,
    },
    {
      email: 'member.elektrik1@kentnabiz.com',
      fullName: 'Volkan Şen (Elektrikçi)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.STREET_LIGHTING]?.id,
    },

    // --- Trafik Hizmetleri Departmanı ---
    {
      email: 'supervisor.trafik@kentnabiz.com',
      fullName: 'Burak Yıldırım (Trafik Hizmetleri Sorumlusu)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.TRAFFIC_SERVICES]?.id,
    },

    // --- Zabıta Departmanı ---
    {
      email: 'supervisor.zabita@kentnabiz.com',
      fullName: 'Leyla Özer (Zabıta Müdürü)',
      password: defaultPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.MUNICIPAL_POLICE]?.id,
    },
    {
      email: 'member.zabita.merkez@kentnabiz.com',
      fullName: 'Emre Güven (Zabıta Memuru)',
      password: defaultPassword,
      roles: [UserRole.TEAM_MEMBER],
      isEmailVerified: true,
      departmentId: deptsByCode[MunicipalityDepartment.MUNICIPAL_POLICE]?.id,
    },
  ];

  const userEntities = userRepository.create(usersToCreate); // Filtre kaldırıldı
  await userRepository.save(userEntities);
  logger.log(`${userEntities.length} kullanıcı başarıyla oluşturuldu.`);
};
