import { useStyles } from "./style";
import { TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const templates = [
  "cra-template",
  "cra-template-typescript",
  "cra-template-redux",
  "cra-template-typescript",
];

export const Dropdown = () => {
  const classes = useStyles();

  return (
    <div className={classes.dropdownContainer}>
      <Autocomplete
        id="combo-box-demo"
        options={templates}
        // getOptionLabel={(option) => option.title}
        className={classes.input}
        renderInput={(params) => (
          <TextField {...params} label="Select a template" variant="outlined" />
        )}
      />
      <Typography className={classes.or}>or</Typography>
      <TextField
        className={classes.input}
        label="Link to repository"
        variant="outlined"
      />
    </div>
  );
};
