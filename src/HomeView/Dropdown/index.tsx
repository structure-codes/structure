import { useState, useEffect } from "react";
import { useStyles } from "./style";
import { Button, Link, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSetRecoilState } from "recoil";
import { treeAtom } from "../../store";
import { treeStringToJson } from "../../tree";
import { useQuery } from "react-query";
import GitHubIcon from "@material-ui/icons/GitHub";

export const Dropdown = () => {
  const classes = useStyles();
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<any>();
  const [selectedUrl, setSelectedUrl] = useState("");
  const setTreeState = useSetRecoilState(treeAtom);

  const selectedTemplateData: any = useQuery(["selectedTemplate", selected], async () => {
    if (!selected) return;
    const data = await fetch(`/api/template/${selected}`).then(res => res.text());
    const parsedData = data
      .split("\n")
      .filter(line => !line.startsWith("#"))
      .join("\n");
    return parsedData;
  });

  const templatesData = useQuery("templatesData", () =>
    fetch("/api/templates").then(res => res.json())
  );

  useEffect(() => {
    if (!selectedTemplateData.data) return;
    console.log(selectedTemplateData.data);
    setTreeState(treeStringToJson(selectedTemplateData.data));
  }, [selectedTemplateData.data]);

  useEffect(() => {
    if (!selectedUrl) return;

    const stringRe = "[A-Za-z-_.]+";
    const re = new RegExp(
      `https://github.com/(?<owner>${stringRe})/(?<repo>${stringRe})((/tree)?/(?<branch>${stringRe}))?`
    );
    const { owner, repo, branch }: any = selectedUrl.match(re)?.groups;

    fetch("/api/github", {
      method: "POST",
      body: JSON.stringify({
        owner,
        repo,
        branch,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(res => {
        setTreeState(res);
      });
  }, [selectedUrl, setTreeState]);

  const handleTemplateChange = (e: any, template: any) => {
    setSelected(template.name);
  };

  return (
    <div className={classes.dropdownContainer}>
      <Autocomplete
        id="combo-box-demo"
        options={templatesData.data}
        getOptionLabel={option => option.name.replace(/\.tree$/, "")}
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
        onChange={e => setUrl(e.target.value)}
      />
      <div className={classes.go}>
        <Button style={{ height: "100%" }} variant="outlined" onClick={() => setSelectedUrl(url)}>
          GO
        </Button>
      </div>
      <div className={classes.icon} >
        <Link color="secondary" target="_blank" href="https://github.com/structure-codes/structure" rel="noopener">
          <GitHubIcon />
        </Link>
      </div>
    </div>
  );
};
