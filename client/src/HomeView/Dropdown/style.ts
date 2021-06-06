import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  dropdownContainer: {
    margin: theme.spacing(1),
    display: "flex",
  },
  input: {
    width: 300,
  },
  or: {
    margin: theme.spacing(1),
    alignSelf: "center",
  }
}))