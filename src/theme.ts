import { Palette } from './types';

// ─── Color tokens ───────────────────────────────────────────────────────────

export const C = {
  // Backgrounds
  bg: '#0E1113',
  surface: '#171B1D',
  surfaceAlt: '#111416',
  surfaceBorder: '#242B2E',

  // Paper
  paper: '#EFE1CE',
  paperWarm: '#EDE0D0',
  paperEdge: '#D8C3A9',
  paperShadow: '#BEA882',

  // Accent
  accent: '#D9915F',
  accentLight: '#E8B06F',
  accentGold: '#F2C996',

  // Text — on dark
  textPrimary: '#F5EEE5',
  textSecondary: '#9EA5A4',
  textMuted: '#8F999B',
  textDim: '#6F7B7E',

  // Text — on paper
  textDark: '#151719',
  textDarkSecondary: '#74695D',
  textDarkMuted: '#8A7E75',
  textPaperAccent: '#5D6870',

  // Utility
  white: '#FFF6EA',
  transparent: 'transparent',
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Radii ──────────────────────────────────────────────────────────────────

export const R = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

// ─── Curated palettes ───────────────────────────────────────────────────────
// Each is a 5-color gradient from dark to light, named by feeling.

export const curatedPalettes: Palette[] = [
  {
    name: 'dusk',
    colors: ['#191616', '#312739', '#72505B', '#C78662', '#F3C982'],
  },
  {
    name: 'shore',
    colors: ['#101820', '#1F3544', '#45717A', '#9BAE9C', '#E8D4A6'],
  },
  {
    name: 'haze',
    colors: ['#201C22', '#383144', '#6B6179', '#B58A76', '#F1D7BD'],
  },
  {
    name: 'candle',
    colors: ['#1A1410', '#3D2E1F', '#7A5C3A', '#C49A5C', '#F5E6C8'],
  },
  {
    name: 'midnight',
    colors: ['#0A0E14', '#151E2D', '#2A3B52', '#4A6580', '#8BA4BD'],
  },
  {
    name: 'golden',
    colors: ['#1C1208', '#4A3018', '#8B5E2F', '#D4944A', '#F7D594'],
  },
  {
    name: 'overcast',
    colors: ['#1A1D20', '#353B40', '#6B7278', '#A3AAB0', '#D4D8DC'],
  },
  {
    name: 'rain',
    colors: ['#0E1518', '#1C2F35', '#3A6068', '#6FA0A0', '#B8D8D4'],
  },
  {
    name: 'ember',
    colors: ['#1A0E0A', '#3D1E14', '#7A3A28', '#B85A3C', '#E8A878'],
  },
];
