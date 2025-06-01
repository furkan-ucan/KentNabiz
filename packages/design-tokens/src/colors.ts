// packages/design-tokens/src/colors.ts

export const colorPalette = {
  // Web'den gelen ana marka renkleri (Chakra brand)
  brandWeb: {
    '50': '#E6FFFA',
    '100': '#B2F5EA',
    '200': '#81E6D9',
    '300': '#4FD1C7',
    '400': '#38B2AC',
    '500': '#319795', // Ana marka rengi (Chakra)
    '600': '#2C7A7B',
    '700': '#285E61',
    '800': '#234E52',
    '900': '#1D4044',
    '950': '#0D1F22',
  },

  // Mobilden gelen ana marka renkleri (kentNabizBrand)
  brandMobile: {
    '50': '#E6F6FF', // kentNabizBrand
    '100': '#BAE3FF',
    '200': '#7CC4FA',
    '300': '#47A3F3',
    '400': '#2563EB', // Bu mobilin paperTheme.colors.tertiary'siydi
    '500': '#2B6CB0', // Bu mobilin paperTheme.colors.kentNabizBrand'iydi (ve web brand.500'e benziyor)
    '600': '#1E40AF',
    '700': '#1E3A8A',
    '800': '#1E293B',
    '900': '#0F172A',
  },

  // Mobilden gelen primary ve accent (bunları da ayrı bir isimle tutalım)
  mobileThemeColors: {
    primary: '#20476D', // Mobil AppBar/Primary Mavi
    accent: '#C72555', // Mobil Tab Bar/İkincil Pembe
  },

  // Ortak Gri Skalası (Mobilden gelen daha kapsamlı görünüyor, onu baz alalım)
  gray: {
    '50': '#FAFAFA',
    '100': '#F5F5F5',
    '200': '#E5E5E5', // Chakra'da border.subtle buna yakındı
    '300': '#D4D4D4', // Chakra'da border.solid buna yakındı
    '400': '#A3A3A3',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
  },

  // Fonksiyonel Renkler (Web ve mobil tanımları benzer, birleştirelim)
  red: {
    '500': '#EF4444', // error (web & mobil)
    // Gerekirse Tailwind/Chakra gibi tam skala eklenebilir
  },
  yellow: {
    '500': '#F59E0B', // warning (web & mobil) / inReview (web)
  },
  orange: {
    // Web'de inProgress için kullanılıyordu
    '500': '#F97316',
  },
  green: {
    '500': '#22C55E', // success (web & mobil) / done (web)
  },
  blue: {
    // Web'de Tailwind Button'da ve info için kullanılıyor gibiydi
    '500': '#3B82F6', // info (mobil)
    '600': '#2563EB',
    '700': '#1D4ED8',
  },
  purple: {
    // Web'de cancelled için kullanılıyordu
    '500': '#8B5CF6',
  },

  // Diğer Temel Renkler
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Semantik Renk Tokenları (Uygulama genelinde anlam ifade eden renkler)
// Bunları web ve mobil için ayrı ayrı veya ortak tanımlayabiliriz.
// Başlangıç için daha genel isimler kullanalım.
export const semanticColors = {
  // Ana Marka Renkleri
  brandPrimary: colorPalette.brandWeb['500'], // Web ana marka
  brandSecondary: colorPalette.brandWeb['700'],
  brandMobilePrimary: colorPalette.mobileThemeColors.primary, // Mobil ana marka
  brandMobileSecondary: colorPalette.mobileThemeColors.accent,
  brandMobileTertiary: colorPalette.brandMobile['400'], // Mobil tertiary

  // Genel UI Elemanları için
  primary: colorPalette.brandWeb['500'], // Varsayılan primary (web'e göre)
  secondary: colorPalette.brandMobile['500'], // Varsayılan secondary (mobilin brand.500'üne göre)
  accent: colorPalette.mobileThemeColors.accent, // Genel bir vurgu rengi

  // Metin Renkleri
  textBody: colorPalette.gray['800'], // Ana metin (Mobilde text.primary: #0F172A daha koyu, gray.900'e yakın)
  // Belki: colorPalette.gray['900']
  textSubtle: colorPalette.gray['600'], // Daha az önemli metin (Mobilde text.secondary: #475569)
  textPlaceholder: colorPalette.gray['400'], // Input placeholder
  textDisabled: colorPalette.gray['300'],
  textInverse: colorPalette.white, // Koyu arkaplanlar üzeri metin
  textLink: colorPalette.brandWeb['600'], // Linkler için
  textError: colorPalette.red['500'],

  // Arkaplan ve Yüzey Renkleri
  // Mobildeki surface'leri baz alalım:
  backgroundRoot: colorPalette.gray['100'], // Uygulamanın en dış arkaplanı (Mobilde surface.secondary: #F8FAFC)
  surfacePrimary: colorPalette.white, // Ana içerik alanları, kartlar (Mobilde surface.primary: #FFFFFF)
  surfaceSecondary: colorPalette.gray['50'], // İkincil yüzeyler (Mobilde surface.tertiary: #F1F5F9)
  surfaceTertiary: colorPalette.gray['200'],
  surfaceDisabled: colorPalette.gray['100'],

  // Kenarlıklar
  borderNeutral: colorPalette.gray['300'], // Genel kenarlıklar
  borderNeutralSubtle: colorPalette.gray['200'],
  borderFocus: colorPalette.brandWeb['500'], // Input focus vb.

  // Durum Renkleri (Status)
  statusOpen: colorPalette.gray['500'],
  statusInReview: colorPalette.yellow['500'],
  statusInProgress: colorPalette.orange['500'],
  statusDone: colorPalette.green['500'],
  statusRejected: colorPalette.red['500'],
  statusCancelled: colorPalette.purple['500'],

  // Bildirim ve Hata Renkleri
  feedbackError: colorPalette.red['500'],
  feedbackWarning: colorPalette.yellow['500'],
  feedbackSuccess: colorPalette.green['500'],
  feedbackInfo: colorPalette.blue['500'], // Mobilin info rengi
};
