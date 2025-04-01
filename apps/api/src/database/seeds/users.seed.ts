import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../modules/users/entities/user.entity';

export const UsersSeed = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);

  // Kullanıcı verileri zaten varsa ekleme
  const userCount = await userRepository.count();
  if (userCount > 0) {
    console.log('Kullanıcı verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Başlangıç kullanıcıları oluşturuluyor...');

  // Örnek şifre hashle
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // Admin kullanıcı
  const admin = userRepository.create({
    email: 'admin@kentnabiz.com',
    fullName: 'Admin Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.ADMIN],
    isEmailVerified: true,
  });

  // Moderatör kullanıcı
  const moderator = userRepository.create({
    email: 'moderator@kentnabiz.com',
    fullName: 'Moderatör Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.MODERATOR],
    isEmailVerified: true,
  });

  // Normal kullanıcı
  const user = userRepository.create({
    email: 'user@kentnabiz.com',
    fullName: 'Normal Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.USER],
    isEmailVerified: true,
  });

  // Test kullanıcısı
  const testUser = userRepository.create({
    email: 'test@kentnabiz.com',
    fullName: 'Test Kullanıcı',
    password: defaultPassword,
    roles: [UserRole.USER],
    isEmailVerified: false,
  });

  // Kullanıcıları kaydet
  await userRepository.save([admin, moderator, user, testUser]);

  console.log('Kullanıcı seed işlemi tamamlandı!');
};
