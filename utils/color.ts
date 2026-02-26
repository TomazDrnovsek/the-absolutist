import { HSL } from '../types';

export const hslToString = (color: HSL): string => {
  return `hsl(${Math.round(color.h)}, ${Math.round(color.s)}%, ${Math.round(color.l)}%)`;
};

export const generateRandomColor = (): HSL => {
  return {
    h: Math.floor(Math.random() * 360),
    // FIXED: Constrained to avoid Black (L=0), White (L=100), and Grays (S=0)
    // ensuring the initial node is always visible and has discernible hue.
    s: 50 + Math.floor(Math.random() * 50), // 50% - 100%
    l: 30 + Math.floor(Math.random() * 40), // 30% - 70%
  };
};

export const calculateMatchScore = (target: HSL, current: HSL): number => {
  // 1. Hue Difference (Circular)
  let hDiff = Math.abs(target.h - current.h);
  if (hDiff > 180) hDiff = 360 - hDiff;

  // 2. Sat/Lum Difference (Linear)
  const sDiff = Math.abs(target.s - current.s);
  const lDiff = Math.abs(target.l - current.l);

  // 3. Weighting (Hue is king in this game)
  const hScore = Math.max(0, 100 - (hDiff * 2.5)); // 40 degrees off = 0 score
  const sScore = Math.max(0, 100 - (sDiff * 2));
  const lScore = Math.max(0, 100 - (lDiff * 2));

  // 4. Composition (60% Hue, 20% Sat, 20% Lum)
  // Returns raw float — rounding happens once at the call site (handleAnalysis).
  return (hScore * 0.6) + (sScore * 0.2) + (lScore * 0.2);
};

export const getPerceivedBrightness = (color: HSL): number => {
  // Quick estimation of brightness for text contrast
  return color.l;
};

export const FIXED_CENTER_COLOR: HSL = { h: 0, s: 0, l: 50 };
