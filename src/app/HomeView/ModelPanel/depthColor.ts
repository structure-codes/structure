// Depth color scale for the visualization (ported from the design prototype's
// treeviz.jsx). Node fill is driven by nesting depth: the root is a constant warm
// cream, and descending depths walk a cohesive ramp whose hue rotates with the
// chosen accent. Chroma is held constant so depth reads via hue + slight lightness,
// not saturation. See design_handoff_structure_facelift/README.md → Depth color scale.
import { ACCENT } from "../../tokens";

export interface Accent {
  hex: string;
  /** Base hue (deg) the whole depth ramp is rotated around. */
  hue: number;
}

export const ACCENTS: Accent[] = [
  { hex: ACCENT, hue: 285 }, // violet (default)
  { hex: "#4f9ff0", hue: 245 }, // blue
  { hex: "#34c9b2", hue: 185 }, // teal
  { hex: "#e0a23e", hue: 80 }, // amber
];

export const DEFAULT_ACCENT_HUE = ACCENTS[0].hue;

/** Hue offsets applied per depth, relative to the accent hue. */
const RAMP = [0, -35, -85, -135, -175, -205, -235];

export function depthColor(depth: number, accentHue: number = DEFAULT_ACCENT_HUE): string {
  if (depth <= 0) return "oklch(0.90 0.045 95)"; // root cream (constant)
  const i = Math.min(depth, RAMP.length - 1);
  const hue = (((accentHue + RAMP[i]) % 360) + 360) % 360;
  const L = Math.min(0.78, 0.66 + depth * 0.02);
  return `oklch(${L.toFixed(3)} 0.145 ${hue.toFixed(0)})`;
}

/** Resolve a stored accent hex to its ramp hue, falling back to the default. */
export function accentHueFor(hex: string): number {
  return (ACCENTS.find(a => a.hex === hex) || ACCENTS[0]).hue;
}
