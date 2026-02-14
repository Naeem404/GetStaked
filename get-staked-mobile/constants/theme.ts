import { Platform } from 'react-native';

export const C = {
  bgPrimary: '#06060A',
  bgSurface: '#0E0E18',
  bgElevated: '#161625',
  bgHover: '#1C1C30',

  brandFire: '#FF6B2C',
  brandGold: '#F5B731',
  brandEmber: '#FF4500',

  success: '#00E878',
  danger: '#FF2D55',
  warning: '#FFB020',
  info: '#5B7FFF',

  textPrimary: '#F2F2F7',
  textSecondary: '#8888A0',
  textMuted: '#4A4A60',

  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.10)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  fireDim: 'rgba(255,107,44,0.30)',
  fireLight: 'rgba(255,107,44,0.15)',
  goldDim: 'rgba(245,183,49,0.30)',
  successDim: 'rgba(0,232,120,0.20)',
  successLight: 'rgba(0,232,120,0.15)',
  dangerDim: 'rgba(255,45,85,0.20)',
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
