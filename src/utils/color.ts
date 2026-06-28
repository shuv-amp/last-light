// ─── Hex → HSL ──────────────────────────────────────────────────────────────

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

// ─── HSL → Hex ──────────────────────────────────────────────────────────────

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ─── Generate a 5-color palette from a single base color ────────────────────
// Takes a user-picked color and builds a dark-to-light gradient through
// that hue, suitable for saving as a token palette.

export function generatePaletteFromColor(hex: string): string[] {
  const [h, s] = hexToHsl(hex);
  return [
    hslToHex(h, Math.min(s, 30), 7),
    hslToHex(h, Math.min(s + 5, 45), 18),
    hslToHex(h, s, 38),
    hslToHex(h, Math.max(s - 10, 30), 60),
    hslToHex(h, Math.max(s - 20, 18), 86),
  ];
}

// ─── Generate a color grid for the custom picker ────────────────────────────
// 12 hues × 5 lightness levels + 6 neutrals

const HUE_COUNT = 12;
const LIGHTNESS_LEVELS = [18, 32, 48, 64, 80];
const SATURATION = 55;

export function buildColorGrid(): string[][] {
  const rows: string[][] = [];

  for (const l of LIGHTNESS_LEVELS) {
    const row: string[] = [];
    for (let i = 0; i < HUE_COUNT; i++) {
      const h = i * (360 / HUE_COUNT);
      row.push(hslToHex(h, SATURATION, l));
    }
    rows.push(row);
  }

  // Neutral row
  rows.push([
    hslToHex(0, 0, 6),
    hslToHex(0, 0, 15),
    hslToHex(0, 0, 28),
    hslToHex(0, 0, 40),
    hslToHex(0, 0, 52),
    hslToHex(0, 0, 64),
    hslToHex(0, 0, 75),
    hslToHex(0, 0, 84),
    hslToHex(30, 10, 80),
    hslToHex(30, 15, 70),
    hslToHex(30, 20, 55),
    hslToHex(30, 12, 40),
  ]);

  return rows;
}

// ─── Dominant color from a palette ──────────────────────────────────────────
// Returns the middle color (index 2) as the representative color for grids.

export function dominantColor(colors: string[]): string {
  return colors[Math.floor(colors.length / 2)] ?? colors[0] ?? '#333';
}
