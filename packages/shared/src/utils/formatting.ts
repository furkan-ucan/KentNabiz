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

// Para birimi formatlama fonksiyonu
export const formatCurrency = (amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};