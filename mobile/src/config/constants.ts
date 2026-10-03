import { MD3LightTheme } from 'react-native-paper';

export const API_URL = 'http://10.0.2.2:3001';

export const COLORS = {
  primary: '#3B6D11',
  primaryDark: '#27500A',
  primaryLight: '#639922',
  primarySoft: '#EAF3DE',
  secondary: '#854F0B',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F7F0',
  textPrimary: '#1B2B14',
  textSecondary: '#5F6B57',
  accent: '#BA7517',
  error: '#A32D2D',
  border: '#E3E9DD',
  white: '#FFFFFF',
} as const;

// color por tipo de identificación: plantas verde, animales ámbar, no reconocidas gris.
export const TIPO_STYLE = {
  planta: {
    label: 'Planta',
    plural: 'Plantas',
    icon: 'sprout',
    soft: '#EAF3DE',
    strong: '#C0DD97',
    text: '#27500A',
  },
  animal: {
    label: 'Animal',
    plural: 'Animales',
    icon: 'paw',
    soft: '#FAEEDA',
    strong: '#FAC775',
    text: '#633806',
  },
  desconocido: {
    label: 'Sin identificar',
    plural: 'Sin identificar',
    icon: 'help',
    soft: '#F1EFE8',
    strong: '#D3D1C7',
    text: '#444441',
  },
} as const;

export const THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primarySoft,
    secondary: COLORS.secondary,
    secondaryContainer: '#FAEEDA',
    tertiary: COLORS.accent,
    tertiaryContainer: '#FAEEDA',
    surface: COLORS.surface,
    surfaceVariant: COLORS.surfaceMuted,
    background: COLORS.background,
    error: COLORS.error,
    errorContainer: '#FCEBEB',
    onPrimary: COLORS.white,
    onSecondary: COLORS.white,
    onSurface: COLORS.textPrimary,
    onBackground: COLORS.textPrimary,
    outline: COLORS.border,
    outlineVariant: COLORS.border,
  },
  roundness: 12,
};
