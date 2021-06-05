import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: "1 1 0px",
    margin: theme.spacing(4),
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
    width: "30%",
  },
  panelContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
  }
}));