/**
 * Formatlama yardımcı fonksiyonları
 */

// Tarih formatlama fonksiyonu
export const formatDate = (date: Date, locale: string = 'tr-TR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Tarih ve saat formatlama fonksiyonu
export const formatDateTime = (date: Date, locale: string = 'tr-TR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

// Göreceli tarih formatlama (örn: "3 gün önce")
export const formatRelativeTime = (date: Date, locale: string = 'tr-TR'): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (years > 0) return rtf.format(-years, 'year');
  if (months > 0) return rtf.format(-months, 'month');
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
};

// Para birimi formatlama fonksiyonu
export const formatCurrency = (
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Bayt formatını insan tarafından okunabilir hale getiren fonksiyon (örn: "1.5 MB")
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

// Tam adı formatlama (ilk harf büyük, diğerleri küçük)
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Telefon numarası formatlama
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Uluslararası numara formatı (+90 555 123 4567)
  if (phoneNumber.startsWith('+')) {
    const countryCode = phoneNumber.slice(0, 3);
    const rest = phoneNumber.slice(3);

    return `${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  // Ulusal numara formatı (0555 123 4567)
  if (phoneNumber.startsWith('0')) {
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
  }

  return phoneNumber;
};
