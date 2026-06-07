import { createTheme } from "@mui/material";
import { tokens, FONT_UI } from "./tokens";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: tokens.bg,
      paper: tokens.panel,
    },
    primary: {
      main: tokens.accent,
    },
    error: {
      main: tokens.danger,
    },
    text: {
      primary: tokens.text,
      secondary: tokens.muted,
    },
    divider: tokens.borderSoft,
  },
  typography: {
    fontFamily: FONT_UI,
  },
});
