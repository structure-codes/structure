import { useState, useEffect } from "react";
import { useStyles } from "./style";
import { TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSetRecoilState } from "recoil";
import { treeAtom } from "../../store";
import { treeStringToJson } from "../../tree";

const TEMPLATES = [
  "cra-template.json",
  "cra-template-typescript.json",
  "benchmark.json",
  "structure.tree",
];

export const Dropdown = () => {
  const classes = useStyles();
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string>("");
  const setTreeState = useSetRecoilState(treeAtom);

  useEffect(() => {   
    if (!selected) return;
    fetch(`/templates/${selected}`)
      .then(res => {
        if (selected.endsWith(".json")) return res.json();
        return res.text()
      })
      .then(res => {
        if (selected.endsWith(".json")) return setTreeState(res);
        return setTreeState(treeStringToJson(res))
        
      });
  }, [selected, setTreeState]);

  useEffect(() => {
    if (!url) return;
    fetch("/api/github", {
      method: "POST",
      body: JSON.stringify({url}),
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(res => res.json())
    .then(res => {
      setTreeState(res);
    })
  }, [url, setTreeState]);
  
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
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
    </div>
  );
};
