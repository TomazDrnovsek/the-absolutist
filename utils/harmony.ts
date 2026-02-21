import { HSL, HarmonyType, HarmonyRule } from '../types';

// --- Configuration ---

export const HARMONY_RULES: Record<HarmonyType, HarmonyRule> = {
  'complementary': {
    type: 'complementary',
    label: 'COMPLEMENTARY',
    offsets: [180],
    description: 'OPPOSING FORCES'
  },
  'analogous': {
    type: 'analogous',
    label: 'ANALOGOUS',
    offsets: [-30, 30],
    description: 'SYMPATHETIC VIBRATION'
  },
  'triadic': {
    type: 'triadic',
    label: 'TRIADIC',
    offsets: [120, 240],
    description: 'EQUILATERAL BALANCE'
  },
  'split-complementary': {
    type: 'split-complementary',
    label: 'SPLIT-COMP',
    offsets: [150, 210],
    description: 'HIGH TENSION'
  },
  'square': {
    type: 'square',
    label: 'SQUARE',
    offsets: [90, 180, 270],
    description: 'GEOMETRIC RIGIDITY'
  },
  'monochromatic': {
    type: 'monochromatic',
    label: 'MONOCHROME',
    offsets: [0, 0], // Handled via special logic
    description: 'SINGULAR FOCUS'
  },
  'tetradic': {
    type: 'tetradic',
    label: 'TETRADIC',
    offsets: [60, 180, 240], 
    description: 'COMPLEX DUALITY'
  }
};

// --- Generators ---

/**
 * Generates the Target HSL values based on a Root color and a Harmony Rule.
 */
export const generateHarmonyTargets = (root: HSL, type: HarmonyType): HSL[] => {
  const rule = HARMONY_RULES[type];
  
  if (type === 'monochromatic') {
    // Special Logic: Vary Lightness/Sat, keep Hue constant
    return [
      { h: root.h, s: Math.max(10, root.s - 30), l: Math.min(90, root.l + 40) },
      { h: root.h, s: Math.min(100, root.s + 10), l: Math.max(10, root.l - 40) }
    ];
  }

  return rule.offsets.map(offset => {
    // Normalize hue to 0-360
    let h = (root.h + offset) % 360;
    if (h < 0) h += 360;

    return {
      h,
      s: root.s, // Keep Saturation constant for pure hue training (Swiss constraint)
      l: root.l  // Keep Lightness constant 
    };
  });
};

/**
 * Returns the difficulty tier for progression.
 * Updated for v2: 20 Levels, 5 Types x 4 Levels.
 */
export const getHarmonyDifficulty = (level: number): HarmonyType => {
  // 20 Levels total
  if (level <= 4) return 'complementary';      // 1-4
  if (level <= 8) return 'analogous';          // 5-8
  if (level <= 12) return 'triadic';            // 9-12
  if (level <= 16) return 'split-complementary'; // 13-16
  return 'square';            // 17-20
};