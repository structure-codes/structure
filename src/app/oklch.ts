// oklch() → "#rrggbb". The design tokens are authored in oklch for tonal
// consistency, but MUI v4's color utilities and Monaco's theme can't parse
// oklch(), so those consumers read hex derived from this at module load.
// Math: Björn Ottosson's oklab/oklch → linear sRGB → gamma-encoded sRGB.

const cube = (x: number) => x * x * x;

const gamma = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

const toByte = (c: number) =>
  Math.round(Math.min(1, Math.max(0, c)) * 255)
    .toString(16)
    .padStart(2, "0");

/** Convert "oklch(L C H)" — L in [0,1], C chroma, H in degrees — to a hex string. */
export function oklchToHex(input: string): string {
  const m = input.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (!m) throw new Error(`Unparseable oklch color: ${input}`);
  const L = parseFloat(m[1]);
  const C = parseFloat(m[2]);
  const h = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = cube(L + 0.3963377774 * a + 0.2158037573 * b);
  const m_ = cube(L - 0.1055613458 * a - 0.0638541728 * b);
  const s_ = cube(L - 0.0894841775 * a - 1.291485548 * b);

  const r = gamma(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_);
  const g = gamma(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_);
  const bl = gamma(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_);

  return `#${toByte(r)}${toByte(g)}${toByte(bl)}`;
}
