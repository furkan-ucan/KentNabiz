/**
 * Regex sabitleri
 */

// Temel doğrulama regex'leri
export const REGEX = {
  // E-posta
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Parolalar (en az 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam)
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/,

  // Telefon numaraları
  PHONE: {
    // Uluslararası format (örn: +905551234567)
    INTERNATIONAL: /^\+[1-9]\d{1,14}$/,

    // Türkiye formatı (başında 0 ile, örn: 05551234567)
    TR: /^0[5][0-9]{9}$/,
  },

  // T.C. Kimlik Numarası (11 haneli, ilk rakam 0 olmayan)
  TC_KIMLIK: /^[1-9]\d{10}$/,

  // URL
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  // Kredi kartı numarası (16 haneli, 4'er gruplar halinde boşluk veya tire ile ayrılabilir)
  CREDIT_CARD: /^(\d{4}[- ]?){3}\d{4}$/,

  // Tarih (YYYY-MM-DD formatı)
  DATE_ISO: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // Tarih (DD.MM.YYYY formatı)
  DATE_TR: /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/,

  // Türkiye plaka kodu
  LICENSE_PLATE_TR: /^(0[1-9]|[1-7][0-9]|8[01])[A-Z]{1,3}\d{2,4}$/,

  // Hex renk kodu (#RRGGBB veya #RGB)
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  // IP adresi (IPv4)
  IPV4: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  // Alfa-numerik (sadece harf ve rakam)
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,

  // Sadece harf
  ALPHA_ONLY: /^[a-zA-Z]+$/,

  // Sadece rakam
  NUMERIC_ONLY: /^\d+$/,

  // HTML tag'i
  HTML_TAG: /<\/?[\w\s="/.':;#-?]+>/gi,

  // Dosya uzantısı
  FILE_EXTENSION: /\.([0-9a-z]+)(?:[?#]|$)/i,
};

// Regex kullanım yardımcıları
export const regexTest = (regex: RegExp, value: string): boolean => {
  return regex.test(value);
};

export const regexReplace = (regex: RegExp, value: string, replacement: string): string => {
  return value.replace(regex, replacement);
};
