/**
 * Hata sabitleri
 */

// Hata Kodları
export enum ErrorCode {
  // Genel hatalar (1000-1999)
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  DUPLICATE_ENTRY = 1005,
  RATE_LIMIT_EXCEEDED = 1006,

  // Kullanıcı hataları (2000-2999)
  USER_NOT_FOUND = 2000,
  USER_EXISTS = 2001,
  INVALID_CREDENTIALS = 2002,
  ACCOUNT_LOCKED = 2003,
  EMAIL_NOT_VERIFIED = 2004,
  PASSWORD_TOO_WEAK = 2005,

  // Rapor hataları (3000-3999)
  REPORT_NOT_FOUND = 3000,
  INVALID_REPORT_STATUS = 3001,
  REPORT_ACCESS_DENIED = 3002,
  INVALID_COORDINATES = 3003,

  // Dosya/Medya hataları (4000-4999)
  FILE_NOT_FOUND = 4000,
  INVALID_FILE_TYPE = 4001,
  FILE_TOO_LARGE = 4002,
  UPLOAD_FAILED = 4003,

  // Sistem hataları (5000-5999)
  DATABASE_ERROR = 5000,
  REDIS_ERROR = 5001,
  MINIO_ERROR = 5002,
  EXTERNAL_API_ERROR = 5003,
  TRANSACTION_FAILED = 5004,
}

// Hata Mesajları
export const ERROR_MESSAGES = {
  [ErrorCode.UNKNOWN_ERROR]: 'Bilinmeyen bir hata oluştu.',
  [ErrorCode.VALIDATION_ERROR]: 'Giriş verileri doğrulanamadı.',
  [ErrorCode.UNAUTHORIZED]: 'Bu işlem için yetkiniz yok.',
  [ErrorCode.FORBIDDEN]: 'Bu kaynağa erişim izniniz bulunmuyor.',
  [ErrorCode.NOT_FOUND]: 'İstenen kaynak bulunamadı.',
  [ErrorCode.DUPLICATE_ENTRY]: 'Bu kayıt zaten mevcut.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',

  [ErrorCode.USER_NOT_FOUND]: 'Kullanıcı bulunamadı.',
  [ErrorCode.USER_EXISTS]: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Geçersiz e-posta veya şifre.',
  [ErrorCode.ACCOUNT_LOCKED]: 'Hesabınız kilitlendi. Lütfen yönetici ile iletişime geçin.',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'E-posta adresiniz doğrulanmadı.',
  [ErrorCode.PASSWORD_TOO_WEAK]:
    'Şifre çok zayıf. En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.',

  [ErrorCode.REPORT_NOT_FOUND]: 'Rapor bulunamadı.',
  [ErrorCode.INVALID_REPORT_STATUS]: 'Geçersiz rapor durumu.',
  [ErrorCode.REPORT_ACCESS_DENIED]: 'Bu rapora erişim izniniz yok.',
  [ErrorCode.INVALID_COORDINATES]: 'Geçersiz koordinatlar.',

  [ErrorCode.FILE_NOT_FOUND]: 'Dosya bulunamadı.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Geçersiz dosya türü.',
  [ErrorCode.FILE_TOO_LARGE]: 'Dosya boyutu çok büyük.',
  [ErrorCode.UPLOAD_FAILED]: 'Dosya yükleme başarısız.',

  [ErrorCode.DATABASE_ERROR]: 'Veritabanı hatası.',
  [ErrorCode.REDIS_ERROR]: 'Redis bağlantı hatası.',
  [ErrorCode.MINIO_ERROR]: 'MinIO depolama hatası.',
  [ErrorCode.EXTERNAL_API_ERROR]: 'Harici API hatası.',
  [ErrorCode.TRANSACTION_FAILED]: 'İşlem başarısız oldu.',
};
