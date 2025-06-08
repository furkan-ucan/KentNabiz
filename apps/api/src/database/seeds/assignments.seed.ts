import { DataSource, In } from 'typeorm';
import { Assignment } from '../../modules/reports/entities/assignment.entity';
import { Report } from '../../modules/reports/entities/report.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { AssignmentStatus, AssigneeType, ReportStatus } from '@kentnabiz/shared'; // Kullanılmayan importlar kaldırıldı
import { faker } from '@faker-js/faker/locale/tr'; // faker eklendi
import { Logger } from '@nestjs/common';

const logger = new Logger('AssignmentsSeed');

export const AssignmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const assignmentRepository = dataSource.getRepository(Assignment);
  if ((await assignmentRepository.count()) > 0) {
    logger.log('Atama verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('Çoklu ve çeşitli atama kayıtları oluşturuluyor...');

  const reportRepo = dataSource.getRepository(Report);
  const userRepo = dataSource.getRepository(User);
  const teamRepo = dataSource.getRepository(Team);
  // const departmentRepo = dataSource.getRepository(Department); // Kullanılmayan departmentRepo kaldırıldı

  // Gerekli verileri çek
  const fenIsleriSupervisor = await userRepo.findOneBy({ email: 'supervisor.fen@kentnabiz.com' });

  if (!fenIsleriSupervisor || !fenIsleriSupervisor.departmentId) {
    logger.warn(
      'Fen İşleri süpervizörü veya departman IDsi bulunamadı. Atama seed işlemi atlanıyor.'
    );
    return;
  }

  const fenIsleriTakimlari = await teamRepo.find({
    where: { departmentId: fenIsleriSupervisor.departmentId },
  });

  // Atama yapılacak IN_PROGRESS, IN_REVIEW, OPEN durumundaki raporları bul
  const reportsToAssign = await reportRepo.find({
    where: {
      status: In([ReportStatus.IN_PROGRESS, ReportStatus.IN_REVIEW, ReportStatus.OPEN]),
      currentDepartmentId: fenIsleriSupervisor.departmentId, // Süpervizörün departmanındaki raporlar
    },
    take: 10, // İlk 10 uygun rapora atama yapalım
  });

  if (fenIsleriTakimlari.length === 0) {
    logger.warn(
      `Fen İşleri departmanında (${fenIsleriSupervisor.departmentId}) hiç takım bulunamadı. Atama yapılamıyor.`
    );
    return;
  }
  if (reportsToAssign.length === 0) {
    logger.warn(
      `Fen İşleri departmanında (${fenIsleriSupervisor.departmentId}) atanacak uygun rapor bulunamadı.`
    );
    return;
  }

  const assignmentsToCreate: Partial<Assignment>[] = []; // Partial<Assignment> olarak değiştirildi

  for (const report of reportsToAssign) {
    const randomTeam = faker.helpers.arrayElement(fenIsleriTakimlari);

    const assignment: Partial<Assignment> = {
      // Partial<Assignment> olarak tanımlandı
      reportId: report.id,
      assigneeType: AssigneeType.TEAM,
      assigneeTeamId: randomTeam.id,
      assignedById: fenIsleriSupervisor.id,
      status: AssignmentStatus.ACTIVE, // status olarak düzeltildi
      assignedAt: new Date(),
      acceptedAt: new Date(), // Otomatik kabul edilmiş gibi
    };
    assignmentsToCreate.push(assignment);

    // Atama yapılan raporun durumunu da IN_PROGRESS yapalım (eğer OPEN ise)
    if (report.status === ReportStatus.OPEN) {
      report.status = ReportStatus.IN_PROGRESS;
      await reportRepo.save(report);
    }
  }

  const assignmentEntities = assignmentRepository.create(assignmentsToCreate); // create metodu ile entity oluştur
  await assignmentRepository.save(assignmentEntities); // save metodu ile kaydet
  logger.log(`${assignmentEntities.length} adet örnek atama başarıyla oluşturuldu!`);
};
