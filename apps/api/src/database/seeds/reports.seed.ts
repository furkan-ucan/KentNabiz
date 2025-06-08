import { DataSource, In } from 'typeorm'; // In eklendi
import { Report } from '../../modules/reports/entities/report.entity';
import { ReportCategory } from '../../modules/reports/entities/report-category.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ReportStatus, UserRole } from '@kentnabiz/shared';
import { faker } from '@faker-js/faker/locale/tr';
import { Point } from 'geojson';
import { SUB_STATUS } from '../../modules/reports/constants';
import { Logger } from '@nestjs/common';

const logger = new Logger('ReportsSeed');

export const ReportsSeed = async (dataSource: DataSource): Promise<void> => {
  const reportRepository = dataSource.getRepository(Report);
  if ((await reportRepository.count()) > 0) {
    logger.log('Rapor verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('Zenginleştirilmiş örnek rapor verileri oluşturuluyor...');

  const categoryRepo = dataSource.getRepository(ReportCategory);
  const userRepo = dataSource.getRepository(User);

  const allCategories = await categoryRepo.find({ relations: ['department'] });
  // UserRole.CITIZEN enum değerini kullanarak vatandaşları bulalım
  const citizens = await userRepo.find({ where: { roles: In([UserRole.CITIZEN]) } }); // In operatörü eklendi

  if (citizens.length === 0 || allCategories.length === 0) {
    logger.error('Rapor oluşturmak için vatandaş kullanıcısı veya kategoriler bulunamadı.');
    throw new Error('Rapor oluşturmak için vatandaş kullanıcısı veya kategoriler bulunamadı.');
  }

  const reportsToCreate: Partial<Report>[] = [];

  for (let i = 0; i < 50; i++) {
    const category = faker.helpers.arrayElement(allCategories);
    if (!category.department) {
      logger.warn(`Kategori ${category.name} için departman bulunamadı, bu rapor atlanıyor.`);
      continue;
    }

    const location: Point = {
      type: 'Point',
      coordinates: [
        parseFloat(faker.location.longitude().toString()), // faker.location.longitude() ve toString() eklendi
        parseFloat(faker.location.latitude().toString()), // faker.location.latitude() ve toString() eklendi
      ],
    };

    const status = faker.helpers.arrayElement(Object.values(ReportStatus));
    let subStatus: (typeof SUB_STATUS)[keyof typeof SUB_STATUS] | null = null; // typeof SUB_STATUS[keyof typeof SUB_STATUS] olarak düzeltildi
    if (status === ReportStatus.IN_PROGRESS) {
      subStatus = faker.helpers.arrayElement([SUB_STATUS.PENDING_APPROVAL, null]);
    }

    const report: Partial<Report> = {
      title: `${category.name} Bildirimi - ${faker.address.street()}`, // faker.address.street() olarak düzeltildi
      description: faker.lorem.paragraph(3),
      location,
      address: faker.location.streetAddress(true), // faker.location.streetAddress() olarak düzeltildi
      reportType: category.defaultReportType,
      status,
      subStatus,
      supportCount: faker.number.int({ min: 0, max: 15 }), // faker.number.int() olarak düzeltildi
      userId: faker.helpers.arrayElement(citizens).id,
      categoryId: category.id,
      currentDepartmentId: category.department.id,
      departmentCode: category.department.code,
      createdAt: faker.date.recent({ days: 60 }), // { days: 60 } olarak düzeltildi
    };
    reportsToCreate.push(report);
  }

  const reportEntities = reportRepository.create(reportsToCreate);
  await reportRepository.save(reportEntities);
  logger.log(`${reportEntities.length} adet çeşitli rapor oluşturuldu.`);
};
