import { createTheme } from "@material-ui/core";

/**
 * Hex equivalents of the oklch design tokens in src/index.css. The CSS custom
 * properties are the source of truth for component styling, but MUI v4's color
 * utilities (and Monaco's theme) can't parse oklch(), so the values that pass
 * through those libraries are mirrored here as hex. Keep in sync with :root.
 */
export const tokens = {
  accent: "#8b78f0",
  bg: "#0c0d10",
  canvas: "#08090d",
  panel: "#121317",
  panel2: "#191b20",
  panel3: "#23242a",
  border: "#2c2d34",
  borderSoft: "#202227",
  text: "#ecedef",
  muted: "#90929a",
  faint: "#5b5d65",
  lineNum: "#4b4d54",
  folder: "#7ab7f1",
  file: "#8a8c92",
} as const;

export const theme = createTheme({
  palette: {
    type: "dark",
    background: {
      default: tokens.bg,
      paper: tokens.panel,
    },
    primary: {
      main: tokens.accent,
    },
    text: {
      primary: tokens.text,
      secondary: tokens.muted,
    },
    divider: tokens.borderSoft,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  },
});
