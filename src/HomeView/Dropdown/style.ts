import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  dropdownContainer: {
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
    alignItems: "left",
  },
  githubContainer: {
    display: "flex",
  },
  input: {
    width: "100%",
    maxWidth: 300,
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
  },
}));
