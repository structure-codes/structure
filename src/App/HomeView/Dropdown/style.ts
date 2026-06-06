import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() => ({
  dropdownContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "16px 16px 14px",
    background: "var(--panel)",
    borderBottom: "1px solid var(--border-soft)",
  },
  // Shared MUI outlined-input restyle for the template select + GitHub field.
  field: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "var(--panel-2)",
      borderRadius: 9,
      fontSize: 13.5,
      color: "var(--text)",
      "& fieldset": { borderColor: "var(--border)", transition: "border-color .12s" },
      "&:hover fieldset": { borderColor: "var(--panel-3)" },
      "&.Mui-focused fieldset": {
        borderColor: "var(--accent)",
        borderWidth: 1,
        boxShadow: "var(--focus-ring)",
      },
    },
    "& .MuiInputLabel-root": { color: "var(--muted)", fontSize: 13.5 },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--accent)" },
    "& .MuiAutocomplete-popupIndicator": { color: "var(--muted)" },
    "& .MuiAutocomplete-clearIndicator": { color: "var(--muted)" },
  },
  githubContainer: {
    display: "flex",
    gap: 8,
  },
  ghMark: {
    display: "flex",
    alignItems: "center",
    color: "var(--muted)",
    marginRight: 6,
  },
  goButton: {
    flexShrink: 0,
    minWidth: 56,
    padding: "0 18px",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.03em",
    borderRadius: 9,
    // `&&` doubles specificity so the accent fill/color beat MUI v4's
    // `.MuiButton-contained` defaults (which are injected after makeStyles).
    "&&": {
      background: "var(--accent)",
      color: "#0c0a14",
    },
    "&:hover": { background: "var(--accent)", filter: "brightness(1.08)" },
    "&:active": { transform: "translateY(1px)" },
  },
}));
