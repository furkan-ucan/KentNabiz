import { DataSource } from 'typeorm';
import { Assignment } from '../../modules/reports/entities/assignment.entity';
import { AssignmentStatus, AssigneeType } from '@kentnabiz/shared';

export const AssignmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const assignmentRepository = dataSource.getRepository(Assignment);

  // Eğer assignment verileri mevcutsa ekleme
  const assignmentCount = await assignmentRepository.count();
  if (assignmentCount > 0) {
    console.log('Assignment verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Test assignment kaydı oluşturuluyor...');

  // Örnek bir rapora (id: 1) TEAM_MEMBER (id:3) kullanıcısını, Test Emergency Team'e atıyoruz ve acceptedAt veriyoruz
  const assignment = assignmentRepository.create({
    reportId: 1, // Seed edilen ilk raporun id'si
    assigneeType: AssigneeType.USER,
    assigneeUserId: 3, // TEAM_MEMBER (setup-e2e'de 3. kullanıcı team.member)
    // assigneeTeamId hiç gönderilmemeli, null göndermek yerine hiç ekleme
    assignedById: 2, // supervisor@test.com (setup-e2e'de 2. kullanıcı)
    status: AssignmentStatus.ACTIVE,
    assignedAt: new Date(),
    acceptedAt: new Date(),
  });

  await assignmentRepository.save(assignment);
  console.log('Assignment seed işlemi tamamlandı!');
};
