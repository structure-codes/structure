import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  mainContainer: {
    display: "flex",
    flexFlow: "column",
    flex: "1 1 0px",
  },
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
  },
  rightPanel: {
    flex: "1 1 0px",
  },
  panelContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
}));