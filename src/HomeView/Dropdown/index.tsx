import { useState, useEffect } from "react";
import { useStyles } from "./style";
import { Button, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSetRecoilState } from "recoil";
import { treeAtom } from "../../store";
import { treeStringToJson } from "../../tree";

export const Dropdown = () => {
  const classes = useStyles();
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [selectedUrl, setSelectedUrl] = useState("");
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
    if (!selectedUrl) return;
    
    const stringRe = "[A-Za-z-_.]+"
    const re = new RegExp(`https://github.com/(?<owner>${stringRe})/(?<repo>${stringRe})(/(?<branch>${stringRe}))?`);
    const { owner, repo, branch }: any = selectedUrl.match(re)?.groups;
    console.log("match is: ", `${owner}/${repo}`)

    fetch("/api/github", {
      method: "POST",
      body: JSON.stringify({
        owner,
        repo,
        branch,
      }),
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(res => res.json())
    .then(res => {
      setTreeState(res);
    })
  }, [selectedUrl, setTreeState]);
  
  const handleTemplateChange = (e: any, value: any) => {
    setSelected(value);
  }

  return (
    <div className={classes.dropdownContainer}>
      <Autocomplete
        id="combo-box-demo"
        options={[]}
        disabled
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
      <Button 
        variant="outlined"
        onClick={() => setSelectedUrl(url)}
      >
        GO
      </Button>
    </div>
  );
};
