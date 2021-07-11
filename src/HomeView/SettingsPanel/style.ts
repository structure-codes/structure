import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  settingsContainer: {
    width: "100%",
    flex: "1 1 0px",
    backgroundColor: "#212121",
    padding: 12,
  },
  buttons: {
    "& button": {
      margin: theme.spacing(1)
    }
  },
  slider: {
    maxWidth: 300,
  }
}))