import GitHubIcon from "@material-ui/icons/GitHub";
import { Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  icon: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  }
}))

export const GitHubLink = () => {
  const classes = useStyles();
  return(
    <div className={classes.icon}>
      <Link
        color="primary"
        target="_blank"
        href="https://github.com/structure-codes/structure"
        rel="noopener"
      >
        <GitHubIcon fontSize="large" />
      </Link>
    </div>
  );
};
