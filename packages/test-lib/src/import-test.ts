// Import Test Dosyası

// Shared paketi importları
import { isValidEmail, isPasswordStrong, User, UserRole } from '@kentnabiz/shared';
// Test fonksiyonu
function testSharedImports(): string {
  let result = 'Shared imports test:\n';

  // Utility fonksiyonları test et
  const validEmail = isValidEmail('test@example.com');
  result += `Email validation: ${validEmail}\n`;

  const strongPassword = isPasswordStrong('StrongPass123');
  result += `Password validation: ${strongPassword}\n`;

  // Tip kullanımı test et (sadece derleme zamanında kontrol edilir)
  const user: User = {
    id: '1',
    email: 'admin@kentnabiz.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  result += `User created: ${user.name} (${user.role})`;

  return result;
}

// Bu dosya çalıştırılabilir değil, sadece import testleri için
// testSharedImports();

export { testSharedImports };
