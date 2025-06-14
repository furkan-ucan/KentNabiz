import { DataSource } from 'typeorm';
import { Assignment } from '../../modules/reports/entities/assignment.entity';
import { Report } from '../../modules/reports/entities/report.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { AssignmentStatus, AssigneeType, ReportStatus, UserRole } from '@kentnabiz/shared';
import { faker } from '@faker-js/faker/locale/tr';
import { Logger } from '@nestjs/common';

const logger = new Logger('AssignmentsSeed');

export const AssignmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const assignmentRepository = dataSource.getRepository(Assignment);
  if ((await assignmentRepository.count()) > 0) {
    logger.log('Atama verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('🎯 Gerçekçi departman atamaları ve iş dağılımları oluşturuluyor...');

  const reportRepo = dataSource.getRepository(Report);
  const userRepo = dataSource.getRepository(User);
  const teamRepo = dataSource.getRepository(Team);

  // Tüm supervisor'ları ve ilgili departman bilgilerini çek
  const supervisors = await userRepo
    .createQueryBuilder('user')
    .where(':role = ANY(user.roles)', { role: UserRole.DEPARTMENT_SUPERVISOR })
    .leftJoinAndSelect('user.department', 'department')
    .getMany();

  if (supervisors.length === 0) {
    logger.warn("Hiç departman supervisor'ü bulunamadı. Atama işlemi atlanıyor.");
    return;
  }

  // Tüm kullanıcıları hızlı kontrol için al
  const allUsers = await userRepo.find();

  // Hata durumlarında detaylı bilgi ver
  if (allUsers.length === 0) {
    logger.error('Hiç kullanıcı bulunamadı. Lütfen önce UsersSeed çalıştırın.');
    throw new Error('Hiç kullanıcı bulunamadı. Lütfen önce UsersSeed çalıştırın.');
  }

  const assignmentsToCreate: Partial<Assignment>[] = [];
  let totalAssignments = 0;

  for (const supervisor of supervisors) {
    if (!supervisor.departmentId) {
      logger.warn(`Supervisor ${supervisor.fullName} için departman ID bulunamadı, atlanıyor.`);
      continue;
    }

    // Bu departmanın takımlarını bul
    const departmentTeams = await teamRepo.find({
      where: { departmentId: supervisor.departmentId },
    });

    if (departmentTeams.length === 0) {
      logger.warn(`${supervisor.fullName} departmanında hiç takım bulunamadı.`);
      continue;
    }

    // Bu departmandaki uygun raporları bul - SADECE OPEN durumundakiler
    // İş akışı kuralı: Sadece atanmamış (OPEN) raporlar atanabilir
    const departmentReports = await reportRepo
      .createQueryBuilder('report')
      .where('report.status = :status', { status: ReportStatus.OPEN })
      .andWhere('report.currentDepartmentId = :departmentId', {
        departmentId: supervisor.departmentId,
      })
      .orderBy('RANDOM()')
      .limit(faker.number.int({ min: 3, max: 8 }))
      .getMany();

    if (departmentReports.length === 0) {
      logger.warn(`${supervisor.fullName} departmanında atanacak uygun rapor bulunamadı.`);
      continue;
    }

    // Bu departmandaki raporları takımlara dağıt
    for (const report of departmentReports) {
      const randomTeam = faker.helpers.arrayElement(departmentTeams);

      // Atama tipini rastgele belirle (çoğunlukla takım, bazen bireysel)
      const isTeamAssignment = faker.datatype.boolean(0.8); // %80 takım, %20 bireysel

      // Atama durumunu rastgele belirle (çoğunlukla aktif, bazen tamamlanmış)
      const assignmentStatus = faker.helpers.weightedArrayElement([
        { weight: 7, value: AssignmentStatus.ACTIVE },
        { weight: 3, value: AssignmentStatus.COMPLETED },
      ]);

      // Zaman mantığı: assignedAt her zaman report.createdAt'ten sonra olmalı
      const minAssignmentDate = new Date(report.createdAt.getTime() + 10 * 60 * 1000); // En az 10 dakika sonra
      const maxAssignmentDate = new Date(report.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // En fazla 30 gün sonra
      const assignedAt = faker.date.between({
        from: minAssignmentDate,
        to: maxAssignmentDate,
      });

      // acceptedAt: bazen null (henüz kabul edilmemiş), bazen assignedAt'ten sonra
      let acceptedAt: Date | undefined = undefined;
      if (faker.datatype.boolean(0.8)) {
        // %80 ihtimalle kabul edilmiş
        acceptedAt = faker.date.between({
          from: assignedAt,
          to: new Date(assignedAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonrasına kadar
        });
      }

      let assignment: Partial<Assignment>;

      if (isTeamAssignment) {
        // Takım ataması
        assignment = {
          reportId: report.id,
          assigneeType: AssigneeType.TEAM,
          assigneeTeamId: randomTeam.id,
          assignedById: supervisor.id,
          status: assignmentStatus,
          assignedAt,
          acceptedAt,
        };
      } else {
        // Bireysel atama - takımdan rastgele bir üye seç
        const teamMembers = await userRepo.find({
          where: { activeTeamId: randomTeam.id },
        });

        if (teamMembers.length > 0) {
          const randomMember = faker.helpers.arrayElement(teamMembers);
          assignment = {
            reportId: report.id,
            assigneeType: AssigneeType.USER,
            assigneeUserId: randomMember.id,
            assignedById: supervisor.id,
            status: assignmentStatus,
            assignedAt,
            acceptedAt,
          };
        } else {
          // Üye bulunamazsa takım ataması yap
          assignment = {
            reportId: report.id,
            assigneeType: AssigneeType.TEAM,
            assigneeTeamId: randomTeam.id,
            assignedById: supervisor.id,
            status: assignmentStatus,
            assignedAt,
            acceptedAt,
          };
        }
      }

      assignmentsToCreate.push(assignment);

      // İş akışı kuralına uygun rapor durumu güncellemesi
      // OPEN -> IN_PROGRESS (atama yapıldığında)
      // IN_PROGRESS -> DONE (atama tamamlandığında)
      report.status = ReportStatus.IN_PROGRESS;
      report.updatedAt = assignedAt; // Atama yapıldığı zaman güncellendi

      if (assignment.status === AssignmentStatus.COMPLETED) {
        report.status = ReportStatus.DONE;
        report.updatedAt = acceptedAt || assignedAt; // Tamamlandığı zaman güncellendi
      }

      await reportRepo.save(report);
    }

    totalAssignments += departmentReports.length;
    logger.log(
      `📋 ${supervisor.fullName} departmanı: ${departmentReports.length} rapor ${departmentTeams.length} takıma dağıtıldı.`
    );
  }

  // Tüm atamaları kaydet
  const assignmentEntities = assignmentRepository.create(assignmentsToCreate);
  await assignmentRepository.save(assignmentEntities);

  logger.log(`✅ Toplamda ${assignmentEntities.length} adet gerçekçi atama başarıyla oluşturuldu!`);
  logger.log(
    `📊 ${supervisors.length} departman supervisor'ü tarafından ${totalAssignments} rapor işleme alındı.`
  );
};
