import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';
import { colorPalette } from '@KentNabiz/design-tokens';

// Design tokens'dan renkleri kullan
const colors = {
  brandMobilePrimary: colorPalette.mobileThemeColors.primary,
  brandMobileSecondary: colorPalette.mobileThemeColors.accent,
  brandMobileTertiary: colorPalette.brandMobile[400],
  feedbackError: colorPalette.red[500],
  surfacePrimary: colorPalette.white,
  surfaceSecondary: colorPalette.gray[50],
  backgroundRoot: colorPalette.gray[100],
  textInverse: colorPalette.white,
  textBody: colorPalette.gray[800],
  borderNeutral: colorPalette.gray[300],
  borderNeutralSubtle: colorPalette.gray[200],
};

// Font yapılandırması - mevcut değerlerle devam edelim
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
};

export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brandMobilePrimary,
    secondary: colors.brandMobileSecondary,
    tertiary: colors.brandMobileTertiary,

    // Error, warning, success
    error: colors.feedbackError,

    // Surface colors
    surface: colors.surfacePrimary,
    surfaceVariant: colors.surfaceSecondary,

    // Background
    background: colors.backgroundRoot,

    // On colors (text colors)
    onPrimary: colors.textInverse,
    onSecondary: colors.textInverse,
    onSurface: colors.textBody,
    onBackground: colors.textBody,

    // Outline
    outline: colors.borderNeutral,
    outlineVariant: colors.borderNeutralSubtle,

    // KentNabız özel renkleri
    kentNabizBrand: colors.brandMobilePrimary,
    kentNabizAccent: colors.brandMobileSecondary,
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type AppTheme = typeof paperTheme;
