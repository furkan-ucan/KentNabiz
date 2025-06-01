// packages/design-tokens/src/typography.ts

export const fonts = {
  // Web (Chakra)
  headingWeb: '"Inter", sans-serif',
  bodyWeb: '"Inter", sans-serif',
  // Mobil (React Native Paper)
  // Projenizde özel font dosyaları (Roboto-Regular.ttf vb.) varsa, assets'e eklenip
  // react-native.config.js ile linklendikten sonra isimleri buraya yazılabilir.
  // Şimdilik 'System' kullanıyoruz, bu platformun varsayılan fontunu alır.
  // Paper'daki fontConfig'de tüm varyantlar için 'System' kullanılmıştı.
  // Eğer özel fontlar varsa:
  // regularMobile: 'Inter-Regular', // Örnek
  // mediumMobile: 'Inter-Medium',   // Örnek
  system: 'System', // Genel bir sistem fontu tanımı
};

export const fontWeights = {
  // React Native Paper'dan gelenler ve genel standartlar
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

// Font boyutlarını daha genel bir skala ile tanımlayalım (Tailwind'e benzer)
// Bunlar px cinsinden olup, React Native'de doğrudan sayı olarak kullanılacak.
// Web'de ise 'rem' veya 'px' birimine dönüştürülebilir.
export const fontSizes = {
  xs: 12, // ~0.75rem
  sm: 14, // ~0.875rem (Mobile labelLarge, bodyMedium)
  base: 16, // 1rem (Mobile bodyLarge)
  lg: 18, // ~1.125rem
  xl: 20, // ~1.25rem
  '2xl': 24, // ~1.5rem
  '3xl': 30, // ~1.875rem (Mobile headlineMedium 28px'e yakın)
  '4xl': 36, // ~2.25rem
  '5xl': 48, // ~3rem (Mobile displayMedium 45px'e yakın)
  '6xl': 60, // ~3.75rem (Mobile displayLarge 57px'e yakın)
  // ... gerekirse daha büyükler
};

// Satır yükseklikleri (font boyutlarına orantılı veya sabit değerler)
export const lineHeights = {
  none: '1' as const,
  tight: '1.25' as const,
  snug: '1.375' as const,
  normal: '1.5' as const, // Genelde base için iyi bir değer
  relaxed: '1.625' as const,
  loose: '2' as const,
  // Sabit değerler (px veya unitless)
  '3': '.75rem' as const, // 12px
  '4': '1rem' as const, // 16px (Mobile bodyLarge için 24px'ti, fontSizes.base * 1.5)
  '5': '1.25rem' as const, // 20px (Mobile labelLarge, bodyMedium)
  '6': '1.5rem' as const, // 24px (Mobile bodyLarge)
  '7': '1.75rem' as const, // 28px (Mobile titleLarge)
  '8': '2rem' as const, // 32px
  '9': '2.25rem' as const, // 36px (Mobile headlineMedium)
  '10': '2.5rem' as const, // 40px
  // Mobile display line heights (Paper'dan)
  displayMediumMobile: 52,
  displayLargeMobile: 64,
};

export const letterSpacings = {
  tighter: '-0.05em' as const,
  tight: '-0.025em' as const,
  normal: '0em' as const,
  wide: '0.025em' as const,
  wider: '0.05em' as const,
  widest: '0.1em' as const,
  // Mobile'dan direkt değerler (sayısal, RN için)
  mobileLabelLarge: 0.1,
  mobileBodyMedium: 0.25,
  mobileBodyLarge: 0.5,
};
