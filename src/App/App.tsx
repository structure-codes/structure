import { HomeView } from "../HomeView";
import { Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { GitHubMark } from "../components/GitHubMark";

const useStyles = makeStyles(theme => ({
  icon: {
    position: "absolute",
    top: 16,
    right: 16,
    display: "flex",
  },
}));

export const App = () => {
  const classes = useStyles();
  return (
    <>
      <HomeView />
      <div className={classes.icon}>
        <Link
          color="primary"
          target="_blank"
          href="https://github.com/structure-codes/structure"
          rel="noopener"
        >
          <GitHubMark size={24} />
        </Link>
      </div>
    </>
  );
};
