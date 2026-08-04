import { MD3LightTheme } from 'react-native-paper';

export const API_URL = 'http://10.0.2.2:3001';

export const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C28',
  secondary: '#8B6914',
  background: '#F5F0E1',
  surface: '#FDFBF5',
  textPrimary: '#3D2E1C',
  textSecondary: '#6B7B5E',
  accent: '#C4960A',
  error: '#A63D40',
  border: '#E0D5B7',
  white: '#FFFFFF',
} as const;

export const THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: '#D4E8C2',
    secondary: COLORS.secondary,
    secondaryContainer: '#F0E4C4',
    tertiary: COLORS.accent,
    tertiaryContainer: '#F5E6B8',
    surface: COLORS.surface,
    surfaceVariant: COLORS.background,
    background: COLORS.background,
    error: COLORS.error,
    errorContainer: '#F2D4D5',
    onPrimary: COLORS.white,
    onSecondary: COLORS.white,
    onSurface: COLORS.textPrimary,
    onBackground: COLORS.textPrimary,
    outline: COLORS.border,
    outlineVariant: '#EDE5D0',
  },
  roundness: 12,
};
