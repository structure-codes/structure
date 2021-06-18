import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" >
          Structure
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
