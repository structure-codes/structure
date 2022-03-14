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
      margin: `0 ${theme.spacing(1)}px ${theme.spacing(1)}px 0`
    }
  },
  button: {
    width: 200,
  },
  slider: {
    maxWidth: 300,
  },
  sliderContainer: {
    marginRight: theme.spacing(1),
  }
}))