import { DataSource } from 'typeorm';
import { Team } from '../../modules/teams/entities/team.entity';
import { Department } from '../../modules/reports/entities/department.entity';
import { User } from '../../modules/users/entities/user.entity';
import { TeamStatus, MunicipalityDepartment, UserRole } from '@kentnabiz/shared';
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

  // Takım lideri e-posta adresleri ile hızlı arama için Map
  const usersByEmail = new Map(allUsers.map(user => [user.email, user]));

  const createdTeams: Team[] = [];

  // Tüm departmanlar için takım tanımları
  const teamDefinitions = [
    // YOL ve ALTYAPI DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
      teams: [
        {
          name: 'Merkez Asfalt ve Onarım Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: 'member.fen1@kentnabiz.com',
        },
        {
          name: 'Kuzey Bölgesi Yol Bakım Ekibi',
          status: TeamStatus.ON_DUTY,
          leaderEmail: 'member.fen3@kentnabiz.com',
        },
        {
          name: 'Acil Müdahale ve Kurtarma Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: null,
        },
        { name: 'Çukur Onarım Özel Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // SU ve KANALİZASYON DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.WATER_AND_SEWERAGE,
      teams: [
        {
          name: 'Su Şebeke Onarım Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: 'member.su1@kentnabiz.com',
        },
        {
          name: 'Kanalizasyon Temizlik Ekibi',
          status: TeamStatus.ON_DUTY,
          leaderEmail: 'member.su2@kentnabiz.com',
        },
        { name: 'Su Sayacı ve Teknik Ekip', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // PARK ve BAHÇELER DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.PARKS_AND_GARDENS,
      teams: [
        {
          name: 'Merkez Parklar Budama ve Bakım Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: 'member.park1@kentnabiz.com',
        },
        {
          name: 'Çiçek ve Peyzaj Düzenleme Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: 'member.park2@kentnabiz.com',
        },
        { name: 'Oyun Alanları ve Ekipman Bakım', status: TeamStatus.ON_DUTY, leaderEmail: null },
        { name: 'Ağaç Dikim ve Orman Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // TEMİZLİK HİZMETLERİ DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.CLEANING_SERVICES,
      teams: [
        {
          name: 'Merkez Bölge Sokak Temizlik Ekibi',
          status: TeamStatus.ON_DUTY,
          leaderEmail: 'member.temizlik1@kentnabiz.com',
        },
        {
          name: 'Çöp Toplama ve Konteynır Ekibi',
          status: TeamStatus.ON_DUTY,
          leaderEmail: 'member.temizlik2@kentnabiz.com',
        },
        { name: 'Özel Atık ve Moloz Toplama', status: TeamStatus.AVAILABLE, leaderEmail: null },
        { name: 'Dezenfektan ve Hijyen Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // SOKAK AYDINLATMASI DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.STREET_LIGHTING,
      teams: [
        {
          name: 'Elektrik Arıza Onarım Ekibi',
          status: TeamStatus.AVAILABLE,
          leaderEmail: 'member.elektrik1@kentnabiz.com',
        },
        { name: 'LED Aydınlatma Kurulum Ekibi', status: TeamStatus.ON_DUTY, leaderEmail: null },
        { name: 'Trafo ve Şebeke Bakım Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // TRAFİK HİZMETLERİ DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.TRAFFIC_SERVICES,
      teams: [
        { name: 'Trafik Işığı ve Levha Bakım', status: TeamStatus.AVAILABLE, leaderEmail: null },
        { name: 'Yol Çizgisi ve İşaretleme Ekibi', status: TeamStatus.ON_DUTY, leaderEmail: null },
        { name: 'Hız Kesici ve Güvenlik Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
      ],
    },
    // ZABITA DEPARTMANI
    {
      departmentCode: MunicipalityDepartment.MUNICIPAL_POLICE,
      teams: [
        {
          name: 'Merkez Zabıta Devriye Ekibi',
          status: TeamStatus.ON_DUTY,
          leaderEmail: 'member.zabita.merkez@kentnabiz.com',
        },
        { name: 'Seyyar Satıcı Denetim Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
        { name: 'Kaçak Yapı Tespit Ekibi', status: TeamStatus.AVAILABLE, leaderEmail: null },
        { name: 'Gürültü ve Çevre Kirliliği Ekibi', status: TeamStatus.ON_DUTY, leaderEmail: null },
      ],
    },
  ];

  // Takımları oluştur
  for (const departmentDef of teamDefinitions) {
    const department = deptsByCode[departmentDef.departmentCode];
    if (!department) {
      logger.warn(`Departman bulunamadı: ${departmentDef.departmentCode}. Atlanıyor.`);
      continue;
    }

    let createdCount = 0;
    for (const teamDef of departmentDef.teams) {
      let teamLeader = null;
      if (teamDef.leaderEmail) {
        teamLeader = usersByEmail.get(teamDef.leaderEmail);
        if (!teamLeader) {
          logger.warn(
            `Takım lideri bulunamadı: ${teamDef.leaderEmail}. Takım lidersiz oluşturulacak.`
          );
        }
      }

      const team = await teamRepository.save(
        teamRepository.create({
          name: teamDef.name,
          departmentId: department.id,
          status: teamDef.status,
          teamLeaderId: teamLeader?.id || undefined,
        })
      );
      createdTeams.push(team);
      createdCount++;
    }

    logger.log(
      `✅ ${departmentDef.departmentCode} departmanı için ${createdCount} takım oluşturuldu.`
    );
  }
  logger.log(
    `✅ Toplamda ${createdTeams.length} adet zenginleştirilmiş takım başarıyla oluşturuldu!`
  );

  // Takım üyesi atamalarını yap
  logger.log('� Takım üyesi atamaları yapılıyor...');

  let totalMembersAssigned = 0;
  for (const team of createdTeams) {
    // Bu takımın departmanındaki TEAM_MEMBER rolündeki kullanıcıları bul
    const departmentMembers = allUsers.filter(
      user => user.departmentId === team.departmentId && user.roles.includes(UserRole.TEAM_MEMBER)
    );

    if (departmentMembers.length === 0) {
      logger.warn(`${team.name} takımı için departmanında hiç TEAM_MEMBER bulunamadı.`);
      continue;
    }

    // Her takıma rastgele 1-3 üye ata
    const memberCount = Math.min(departmentMembers.length, Math.floor(Math.random() * 3) + 1);
    const shuffledMembers = departmentMembers.sort(() => 0.5 - Math.random());
    const selectedMembers = shuffledMembers.slice(0, memberCount);

    for (const member of selectedMembers) {
      // Bu üye başka bir takımda değilse ata
      if (!member.activeTeamId) {
        member.activeTeamId = team.id;
        await userRepo.save(member);
        totalMembersAssigned++;
        logger.log(`   👤 ${member.fullName} -> ${team.name} takımına atandı`);
      }
    }
  }

  logger.log(`✅ Toplam ${totalMembersAssigned} üye takımlara başarıyla atandı!`);
  logger.log(
    `📊 Takım dağılımı: ${teamDefinitions.length} departman için özelleştirilmiş takımlar hazırlandı.`
  );
};
