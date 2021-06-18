import { useState, useEffect } from "react";
import { useStyles } from "./style";
import { TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSetRecoilState } from "recoil";
import { treeAtom } from "../../store";

const TEMPLATES = [
  "cra-template",
  "cra-template-typescript"
];

export const Dropdown = () => {
  const classes = useStyles();
  const [templates, setTemplates] = useState({});
  const [selected, setSelected] = useState(null);
  const setTreeState = useSetRecoilState(treeAtom);

  useEffect(() => {
    console.log("Fetching tempaltes")
    TEMPLATES.forEach(name =>
      fetch(`/templates/${name}.json`).then(res =>
        res.json()
      ).then(res => {
        const updatedTemp = {
          ...templates,
          [name]: res,
        };
      
        console.log("caching", name)
        setTemplates(updatedTemp)
      })
    );
  }, []);

  useEffect(() => {   
    if (templates[selected]) {
      setTreeState(templates[selected]);
    }
  }, [selected]);
  
  const handleTemplateChange = (e: any, value: any) => {
    setSelected(value);
  }

  return (
    <div className={classes.dropdownContainer}>
      <Autocomplete
        id="combo-box-demo"
        options={TEMPLATES}
        className={classes.input}
        size="small"
        onChange={handleTemplateChange}
        renderInput={params => (
          <TextField {...params} label="Select a template" variant="outlined" />
        )}
      />
      <Typography className={classes.or}>or</Typography>
      <TextField
        size="small"
        className={classes.input}
        label="Link to repository"
        variant="outlined"
      />
    </div>
  );
};
