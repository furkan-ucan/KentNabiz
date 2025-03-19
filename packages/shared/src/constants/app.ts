/**
 * Uygulama sabitleri
 */

// Uygulama sürümleri
export const APP_VERSION = {
  API: '1.0.0',
  WEB: '1.0.0',
  MOBILE: '1.0.0',
};

// Pagination sabitleri
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Authentication sabitleri
export const AUTH = {
  TOKEN_EXPIRY: {
    ACCESS: '15m', // 15 dakika
    REFRESH: '7d', // 7 gün
    RESET_PASSWORD: '1h', // 1 saat
    VERIFY_EMAIL: '24h', // 24 saat
  },
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 dakika (ms)
};

// File upload sabitleri
export const FILE_UPLOAD = {
  MAX_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
  },
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  },
  THUMBNAIL_SIZES: {
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 300, height: 300 },
    LARGE: { width: 600, height: 600 },
  },
};

// Caching sabitleri
export const CACHE = {
  TTL: {
    SHORT: 60, // 1 dakika (saniye cinsinden)
    MEDIUM: 5 * 60, // 5 dakika
    LONG: 30 * 60, // 30 dakika
    VERY_LONG: 24 * 60 * 60, // 1 gün
  },
  KEYS: {
    USER_PROFILE: 'user:profile:',
    REPORTS_LIST: 'reports:list:',
    REPORT_DETAIL: 'report:detail:',
    STATS: 'stats:',
  },
};

// Çeşitli sabitler
export const MISC = {
  DEFAULT_LANGUAGE: 'tr',
  AVAILABLE_LANGUAGES: ['tr', 'en'],
  DEFAULT_TIMEZONE: 'Europe/Istanbul',
  DEFAULT_CURRENCY: 'TRY',
};
