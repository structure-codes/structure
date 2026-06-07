import { createTheme } from "@material-ui/core";
import { tokens, FONT_UI } from "./tokens";

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
    fontFamily: FONT_UI,
  },
});
