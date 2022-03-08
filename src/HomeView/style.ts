import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  dropdownContainer: {
    justifyContent: "center",
    display: "flex",
  },
  dropdown: {
    display: "inline-block",
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minWidth: 220,
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  panelContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
}));