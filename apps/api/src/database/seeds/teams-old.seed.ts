import { DataSource } from 'typeorm';
import { Team } from '../../modules/teams/entities/team.entity';
import { Department } from '../../modules/reports/entities/department.entity';
import { User } from '../../modules/users/entities/user.entity';
import { TeamStatus, MunicipalityDepartment } from '@kentnabiz/shared';
import { Logger } from '@nestjs/common';

const logger = new Logger('TeamsSeed');

export const TeamsSeed = async (dataSource: DataSource): Promise<void> => {
  const teamRepository = dataSource.getRepository(Team);
  if ((await teamRepository.count()) > 0) {
    logger.log('Takım verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('🏗️ Zenginleştirilmiş departman takımları ve iş grupları oluşturuluyor...');

  const departmentRepo = dataSource.getRepository(Department);
  const userRepo = dataSource.getRepository(User);

  // Tüm departmanları önceden alıp haritalayalım
  const allDepts = await departmentRepo.find();
  if (allDepts.length === 0) {
    logger.error('Hiç departman bulunamadı. Lütfen önce DepartmentsSeed çalıştırın.');
    throw new Error('Hiç departman bulunamadı. Lütfen önce DepartmentsSeed çalıştırın.');
  }

  const deptsByCode = allDepts.reduce(
    (acc, dept) => {
      acc[dept.code] = dept;
      return acc;
    },
    {} as Record<MunicipalityDepartment, Department>
  );

  // Tüm kullanıcıları hata kontrolü için al
  const allUsers = await userRepo.find();
  if (allUsers.length === 0) {
    logger.error('Hiç kullanıcı bulunamadı. Lütfen önce UsersSeed çalıştırın.');
    throw new Error('Hiç kullanıcı bulunamadı. Lütfen önce UsersSeed çalıştırın.');
  }

  const createdTeams: Team[] = [];

  // === YOL ve ALTYAPI DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]) {
    const roadTeams = [
      {
        name: 'Merkez Asfalt ve Onarım Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: ['member.fen1@kentnabiz.com', 'member.fen2@kentnabiz.com'],
        leaderEmail: 'member.fen1@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Kuzey Bölgesi Yol Bakım Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: ['member.fen3@kentnabiz.com'],
        leaderEmail: 'member.fen3@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Acil Müdahale ve Kurtarma Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
        leaderEmail: null, // Lider yok
      },
      {
        name: 'Çukur Onarım Özel Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
        leaderEmail: null, // Lider yok
      },
    ];

    for (const teamData of roadTeams) {
      // Takım liderini bul (varsa)
      let teamLeader = null;
      if (teamData.leaderEmail) {
        teamLeader = await userRepo.findOne({ where: { email: teamData.leaderEmail } });
        if (!teamLeader) {
          logger.warn(
            `Takım lideri bulunamadı: ${teamData.leaderEmail}. Takım lidersiz oluşturulacak.`
          );
        }
      }

      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE].id,
          status: teamData.status,
          teamLeaderId: teamLeader?.id || undefined,
        })
      );
      createdTeams.push(team);

      // Not: Takım üyelikleri TeamMembersSeed tarafından yönetilecek
      // Bu, Single Responsibility Principle'a uygun
    }

    logger.log(
      `✅ ${MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE} departmanı için ${roadTeams.length} takım oluşturuldu.`
    );
  }

  // === SU ve KANALİZASYON DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE]) {
    const waterTeams = [
      {
        name: 'Su Şebeke Onarım Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: ['member.su1@kentnabiz.com'],
        leaderEmail: 'member.su1@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Kanalizasyon Temizlik Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: ['member.su2@kentnabiz.com'],
        leaderEmail: 'member.su2@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Su Sayacı ve Teknik Ekip',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
        leaderEmail: null, // Lider yok
      },
    ];

    for (const teamData of waterTeams) {
      // Takım liderini bul (varsa)
      let teamLeader = null;
      if (teamData.leaderEmail) {
        teamLeader = await userRepo.findOne({ where: { email: teamData.leaderEmail } });
        if (!teamLeader) {
          logger.warn(
            `Takım lideri bulunamadı: ${teamData.leaderEmail}. Takım lidersiz oluşturulacak.`
          );
        }
      }

      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.WATER_AND_SEWERAGE].id,
          status: teamData.status,
          teamLeaderId: teamLeader?.id || undefined,
        })
      );
      createdTeams.push(team);

      // Not: Takım üyelikleri ayrı bir seed dosyasında yönetilecek
    }

    logger.log(
      `✅ ${MunicipalityDepartment.WATER_AND_SEWERAGE} departmanı için ${waterTeams.length} takım oluşturuldu.`
    );
  }

  // === PARK ve BAHÇELER DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS]) {
    const parkTeams = [
      {
        name: 'Merkez Parklar Budama ve Bakım Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: ['member.park1@kentnabiz.com'],
        leaderEmail: 'member.park1@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Çiçek ve Peyzaj Düzenleme Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: ['member.park2@kentnabiz.com'],
        leaderEmail: 'member.park2@kentnabiz.com', // Takım lideri
      },
      {
        name: 'Oyun Alanları ve Ekipman Bakım',
        status: TeamStatus.ON_DUTY,
        memberEmails: [],
        leaderEmail: null, // Lider yok
      },
      {
        name: 'Ağaç Dikim ve Orman Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
        leaderEmail: null, // Lider yok
      },
    ];

    for (const teamData of parkTeams) {
      // Önce takım liderini bul
      let teamLeader = null;
      if (teamData.leaderEmail) {
        teamLeader = await userRepo.findOne({ where: { email: teamData.leaderEmail } });
      }

      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.PARKS_AND_GARDENS].id,
          status: teamData.status,
          teamLeaderId: teamLeader?.id || undefined,
        })
      );
      createdTeams.push(team);

      for (const email of teamData.memberEmails) {
        await userRepo.update({ email }, { activeTeamId: team.id });
      }
    }
  }

  // === TEMİZLİK HİZMETLERİ DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.CLEANING_SERVICES]) {
    const cleaningTeams = [
      {
        name: 'Merkez Bölge Sokak Temizlik Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: ['member.temizlik1@kentnabiz.com'],
      },
      {
        name: 'Çöp Toplama ve Konteynır Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: ['member.temizlik2@kentnabiz.com'],
      },
      {
        name: 'Özel Atık ve Moloz Toplama',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
      {
        name: 'Dezenfektan ve Hijyen Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
    ];

    for (const teamData of cleaningTeams) {
      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.CLEANING_SERVICES].id,
          status: teamData.status,
        })
      );
      createdTeams.push(team);

      for (const email of teamData.memberEmails) {
        await userRepo.update({ email }, { activeTeamId: team.id });
      }
    }
  }

  // === SOKAK AYDINLATMASI DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.STREET_LIGHTING]) {
    const lightingTeams = [
      {
        name: 'Elektrik Arıza Onarım Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: ['member.elektrik1@kentnabiz.com'],
      },
      {
        name: 'LED Aydınlatma Kurulum Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: [],
      },
      {
        name: 'Trafo ve Şebeke Bakım Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
    ];

    for (const teamData of lightingTeams) {
      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.STREET_LIGHTING].id,
          status: teamData.status,
        })
      );
      createdTeams.push(team);

      for (const email of teamData.memberEmails) {
        await userRepo.update({ email }, { activeTeamId: team.id });
      }
    }
  }

  // === TRAFİK HİZMETLERİ DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.TRAFFIC_SERVICES]) {
    const trafficTeams = [
      {
        name: 'Trafik Işığı ve Levha Bakım',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
      {
        name: 'Yol Çizgisi ve İşaretleme Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: [],
      },
      {
        name: 'Hız Kesici ve Güvenlik Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
    ];

    for (const teamData of trafficTeams) {
      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.TRAFFIC_SERVICES].id,
          status: teamData.status,
        })
      );
      createdTeams.push(team);

      for (const email of teamData.memberEmails) {
        await userRepo.update({ email }, { activeTeamId: team.id });
      }
    }
  }

  // === ZABITA DEPARTMANI ===
  if (deptsByCode[MunicipalityDepartment.MUNICIPAL_POLICE]) {
    const policeTeams = [
      {
        name: 'Merkez Zabıta Devriye Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: ['member.zabita.merkez@kentnabiz.com'],
      },
      {
        name: 'Seyyar Satıcı Denetim Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
      {
        name: 'Kaçak Yapı Tespit Ekibi',
        status: TeamStatus.AVAILABLE,
        memberEmails: [],
      },
      {
        name: 'Gürültü ve Çevre Kirliliği Ekibi',
        status: TeamStatus.ON_DUTY,
        memberEmails: [],
      },
    ];

    for (const teamData of policeTeams) {
      const team = await teamRepository.save(
        teamRepository.create({
          name: teamData.name,
          departmentId: deptsByCode[MunicipalityDepartment.MUNICIPAL_POLICE].id,
          status: teamData.status,
        })
      );
      createdTeams.push(team);

      for (const email of teamData.memberEmails) {
        await userRepo.update({ email }, { activeTeamId: team.id });
      }
    }
  }

  logger.log(
    `✅ Toplamda ${createdTeams.length} adet zenginleştirilmiş takım başarıyla oluşturuldu ve üyeler atandı!`
  );
  logger.log(
    `📊 Takım dağılımı: ${Object.keys(deptsByCode).length} departman için özelleştirilmiş takımlar hazırlandı.`
  );
};
