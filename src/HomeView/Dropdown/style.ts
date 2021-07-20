import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  dropdownContainer: {
    margin: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: 300,
  },
  go: {
    marginLeft: theme.spacing(1),
    height: theme.spacing(5),
  },
  or: {
    padding: "0 10px 0 10px",
    alignSelf: "center",
  },
  icon: {
    marginLeft: "auto",
  }
}))