import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles({
  settingsContainer: {
    width: "100%",
    background: "var(--panel)",
    borderTop: "1px solid var(--border-soft)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "column",
  },
  sliderHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  sliderLabel: {
    color: "var(--muted)",
    fontSize: 12.5,
  },
  sliderValue: {
    color: "var(--accent)",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 12,
  },
  slider: {
    color: "var(--accent)",
    padding: "8px 0",
    "& .MuiSlider-rail": { height: 4, borderRadius: 4, backgroundColor: "var(--panel-3)", opacity: 1 },
    "& .MuiSlider-track": { height: 4, borderRadius: 4 },
    "& .MuiSlider-thumb": {
      width: 15,
      height: 15,
      marginTop: -5.5,
      backgroundColor: "var(--accent)",
      border: "3px solid var(--panel)",
      boxShadow: "0 0 0 1px var(--accent)",
      transition: "transform .12s",
      "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 1px var(--accent)", transform: "scale(1.15)" },
      "&.MuiSlider-active": { boxShadow: "0 0 0 1px var(--accent)" },
    },
  },
  checks: {
    gap: 4,
  },
  check: {
    margin: 0,
    "& .MuiFormControlLabel-label": {
      color: "var(--muted)",
      fontSize: 13.5,
      whiteSpace: "nowrap",
    },
    "&:hover .MuiFormControlLabel-label": { color: "var(--text)" },
    "& .MuiCheckbox-root": { color: "var(--border)", padding: 6 },
    "& .MuiCheckbox-root.Mui-checked": { color: "var(--accent)" },
  },
  buttons: {
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  button: {
    flex: 1,
    color: "var(--muted)",
    "& .MuiButton-label": { display: "flex", alignItems: "center", gap: 6 },
    background: "var(--panel-2)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 500,
    textTransform: "none",
    padding: "7px 10px",
    "&:hover": { background: "var(--panel-3)", borderColor: "var(--panel-3)", color: "var(--text)" },
  },
});
