// Single source of truth for the design tokens.
//
// The color scale is authored ONCE here, in oklch. Two things derive from it so
// nothing is hand-synced:
//   - applyTokens() injects the scale (+ --accent) onto :root at startup, so CSS
//     uses `var(--panel)` etc. (see index.css, which no longer declares them).
//   - `tokens` mirrors the scale to hex for the consumers that can't read CSS
//     vars / parse oklch(): MUI v4's createTheme (theme.ts) and Monaco
//     (customLang.ts).
import { oklchToHex } from "./oklch";

// Accent is a plain hex (not oklch): it's overridden at runtime via
// document.documentElement.style.setProperty("--accent", …) and feeds CSS
// color-mix(). This is its ONE definition — the MUI theme, Monaco, and the
// depth-color ramp (ModelPanel/depthColor.ts) all derive from it.
export const ACCENT = "#8b78f0";

// Keys are the CSS custom-property names without the leading "--".
const scale = {
  bg: "oklch(0.158 0.008 274)",
  canvas: "oklch(0.142 0.008 274)",
  panel: "oklch(0.188 0.009 274)",
  "panel-2": "oklch(0.222 0.010 274)",
  "panel-3": "oklch(0.262 0.011 274)",
  border: "oklch(0.300 0.012 274)",
  "border-soft": "oklch(0.252 0.010 274)",
  text: "oklch(0.945 0.004 274)",
  muted: "oklch(0.660 0.012 274)",
  faint: "oklch(0.480 0.012 274)",
  "line-num": "oklch(0.420 0.012 274)",
  folder: "oklch(0.760 0.105 248)",
  file: "oklch(0.640 0.010 274)",
} as const;

/** Inject --accent + the oklch scale onto :root. Call once before first render. */
export function applyTokens(root: HTMLElement = document.documentElement): void {
  root.style.setProperty("--accent", ACCENT);
  for (const [name, value] of Object.entries(scale)) {
    root.style.setProperty(`--${name}`, value);
  }
}

// Hex mirror for JS consumers (MUI theme + Monaco). Derived, never hand-edited.
export const tokens = {
  accent: ACCENT,
  bg: oklchToHex(scale.bg),
  canvas: oklchToHex(scale.canvas),
  panel: oklchToHex(scale.panel),
  panel2: oklchToHex(scale["panel-2"]),
  panel3: oklchToHex(scale["panel-3"]),
  border: oklchToHex(scale.border),
  borderSoft: oklchToHex(scale["border-soft"]),
  text: oklchToHex(scale.text),
  muted: oklchToHex(scale.muted),
  faint: oklchToHex(scale.faint),
  lineNum: oklchToHex(scale["line-num"]),
  folder: oklchToHex(scale.folder),
  file: oklchToHex(scale.file),
} as const;
