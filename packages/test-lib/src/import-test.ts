// Import Test Dosyası

// Shared paketi importları
import { isValidEmail, isPasswordStrong, User, UserRole } from '@kentnabiz/shared';

// UI Paketi importları (React kullanılmayan bir ortamda sadece tip importları)
import type { ButtonProps } from '@kentnabiz/ui';
import type { UseFormProps } from '@kentnabiz/ui';

// Test fonksiyonu
function testSharedImports(): void {
  console.log('Shared imports test:');

  // Utility fonksiyonları test et
  const validEmail = isValidEmail('test@example.com');
  console.log(`Email validation: ${validEmail}`);

  const strongPassword = isPasswordStrong('StrongPass123');
  console.log(`Password validation: ${strongPassword}`);

  // Tip kullanımı test et (sadece derleme zamanında kontrol edilir)
  const user: User = {
    id: '1',
    email: 'admin@kentnabiz.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log(`User created: ${user.name} (${user.role})`);
}

// Bu dosya çalıştırılabilir değil, sadece import testleri için
// testSharedImports();

export { testSharedImports };
