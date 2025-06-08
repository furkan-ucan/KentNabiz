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

  logger.log('Departman takımları oluşturuluyor...');

  const departmentRepo = dataSource.getRepository(Department);
  const userRepo = dataSource.getRepository(User);

  // --- Fen İşleri Takımları ---
  const fenIsleriDept = await departmentRepo.findOneBy({
    code: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  });
  if (fenIsleriDept) {
    const teamA = await teamRepository.save(
      teamRepository.create({
        name: 'Fen İşleri Asfalt Ekibi',
        departmentId: fenIsleriDept.id,
        status: TeamStatus.AVAILABLE,
      })
    );
    const teamB = await teamRepository.save(
      teamRepository.create({
        name: 'Fen İşleri Acil Müdahale',
        departmentId: fenIsleriDept.id,
        status: TeamStatus.AVAILABLE,
      })
    );

    // Üyeleri takımlara ata
    await userRepo.update({ email: 'member.fen1@kentnabiz.com' }, { activeTeamId: teamA.id });
    await userRepo.update({ email: 'member.fen2@kentnabiz.com' }, { activeTeamId: teamB.id });
    logger.log(
      `Fen İşleri departmanı için ${[teamA.name, teamB.name].join(', ')} takımları oluşturuldu ve üyeler atandı.`
    );
  } else {
    logger.warn('Fen İşleri departmanı bulunamadı, takım oluşturma atlandı.');
  }

  // --- Park ve Bahçeler Takımı ---
  const parkDept = await departmentRepo.findOneBy({
    code: MunicipalityDepartment.PARKS_AND_GARDENS,
  });
  if (parkDept) {
    const teamC = await teamRepository.save(
      teamRepository.create({
        name: 'Park ve Bahçeler Budama Ekibi',
        departmentId: parkDept.id,
        status: TeamStatus.AVAILABLE,
      })
    );
    await userRepo.update({ email: 'member.park1@kentnabiz.com' }, { activeTeamId: teamC.id });
    logger.log(
      `Park ve Bahçeler departmanı için ${teamC.name} takımı oluşturuldu ve üyeler atandı.`
    );
  } else {
    logger.warn('Park ve Bahçeler departmanı bulunamadı, takım oluşturma atlandı.');
  }

  // --- Temizlik İşleri Takımı ---
  const temizlikDept = await departmentRepo.findOneBy({
    code: MunicipalityDepartment.CLEANING_SERVICES,
  });
  if (temizlikDept) {
    const teamD = await teamRepository.save(
      teamRepository.create({
        name: 'Merkez Bölge Temizlik Ekibi',
        departmentId: temizlikDept.id,
        status: TeamStatus.ON_DUTY,
      })
    );
    await userRepo.update({ email: 'member.temizlik1@kentnabiz.com' }, { activeTeamId: teamD.id });
    logger.log(
      `Temizlik İşleri departmanı için ${teamD.name} takımı oluşturuldu ve üyeler atandı.`
    );
  } else {
    logger.warn('Temizlik İşleri departmanı bulunamadı, takım oluşturma atlandı.');
  }

  logger.log('Takım ve üye atama işlemleri tamamlandı!');
};
