import { BauhausShapeType } from '../types';

/**
 * Maps a Hue (0-360) to a Bauhaus Primitive.
 * Based on Kandinsky's theory of form and color, expanded for a full 360 spectrum.
 */
export const getBauhausShape = (hue: number): BauhausShapeType => {
  // Normalize
  const h = hue % 360;

  // Red (0°) -> Square (Stable, heavy)
  if (h >= 340 || h < 20) return 'square';

  // Orange (30°) -> Trapezoid (Transition to sharp)
  if (h >= 20 && h < 45) return 'trapezoid';

  // Yellow (60°) -> Triangle (Sharp, energetic)
  if (h >= 45 && h < 80) return 'triangle';

  // Chartreuse (90°) -> Rhombus (Unstable, tilting)
  if (h >= 80 && h < 120) return 'rhombus';

  // Green (120°) -> L-Beam (Structural, natural)
  if (h >= 120 && h < 160) return 'l-beam';

  // Teal (180°) -> Semi-Circle (Bridge to circular)
  if (h >= 160 && h < 200) return 'semi-circle';

  // Blue (240°) -> Circle (Receding, spiritual, infinite)
  if (h >= 200 && h < 260) return 'circle';

  // Purple (280°) -> Capsule (Stretched circle)
  if (h >= 260 && h < 310) return 'capsule';

  // Magenta (320°) -> Cross (Complex, combining red/blue traits)
  return 'cross';
};