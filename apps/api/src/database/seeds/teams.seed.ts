import { DataSource } from 'typeorm';
import { Team } from '../../modules/teams/entities/team.entity';
import { TeamStatus } from '@KentNabiz/shared';

export const TeamsSeed = async (dataSource: DataSource): Promise<void> => {
  const teamRepository = dataSource.getRepository(Team);

  // Eğer takım verileri mevcutsa ekleme
  const teamCount = await teamRepository.count();
  if (teamCount > 0) {
    console.log('Takım verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Test takımı oluşturuluyor...');

  const testTeam = teamRepository.create({
    id: 1,
    name: 'Test Team',
    departmentId: 1,
    status: TeamStatus.AVAILABLE,
  });

  await teamRepository.save(testTeam);
  console.log('Takım seed işlemi tamamlandı!');
};
