import { Platform } from 'react-native';

export const C = {
  // Backgrounds — deep dark (from design-reference)
  bgPrimary: '#0A0A0A',
  bgSurface: '#121212',
  bgElevated: '#1F1F1F',
  bgHover: '#2A2A2A',

  // Primary — emerald green (design-reference --primary: 142 71% 45%)
  primary: '#22C55E',
  primaryDim: 'rgba(34,197,94,0.15)',
  primaryLight: 'rgba(34,197,94,0.10)',
  primaryGlow: 'rgba(34,197,94,0.30)',

  // Accent — orange (design-reference --accent: 33 100% 50%)
  accent: '#FF8C00',
  accentDim: 'rgba(255,140,0,0.20)',
  accentLight: 'rgba(255,140,0,0.10)',

  // Legacy aliases (so existing code doesn't break)
  brandFire: '#22C55E',
  brandGold: '#4ADE80',
  brandEmber: '#16A34A',

  // Semantic
  success: '#22C55E',
  danger: '#DC2626',
  warning: '#FF8C00',
  info: '#3B82F6',

  // Text
  textPrimary: '#F2F2F2',
  textSecondary: '#8C8C8C',
  textMuted: '#555555',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.14)',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Dim variants
  fireDim: 'rgba(34,197,94,0.30)',
  fireLight: 'rgba(34,197,94,0.15)',
  goldDim: 'rgba(74,222,128,0.30)',
  successDim: 'rgba(34,197,94,0.20)',
  successLight: 'rgba(34,197,94,0.15)',
  dangerDim: 'rgba(220,38,38,0.20)',

  // Chart colors (from design-reference)
  chart1: '#22C55E',
  chart2: '#FF8C00',
  chart3: '#DC2626',
  chart4: '#3B82F6',
  chart5: '#A855F7',
};

export const Fonts = Platform.select({
  ios: { sans: 'System', mono: 'Menlo' },
  android: { sans: 'Roboto', mono: 'monospace' },
  default: { sans: 'System', mono: 'monospace' },
})!;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};
