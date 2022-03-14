import { useEffect, useState } from "react";
import { useStyles } from "./style";
import { Button, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSetRecoilState } from "recoil";
import { treeAtom, baseTreeAtom } from "../../store";
import { treeStringToJson } from "@structure-codes/utils";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import clsx from "clsx";
import { theme } from "../../theme";

export const Dropdown = ({ ref, wrap }: { ref: any; wrap: boolean }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams]: any = useSearchParams();
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState(null);
  const setTreeState = useSetRecoilState(treeAtom);
  const setBaseTree = useSetRecoilState(baseTreeAtom);

  // On initial load get details from URL if present
  useEffect(() => {
    const { template: searchTemplate } = params;
    if (!searchTemplate) return;
    if (searchTemplate === "github") {
      const owner = searchParams.get("owner");
      const repo = searchParams.get("repo");
      const branch = searchParams.get("branch");
      const branchString = branch ? `/tree/${branch}` : "";
      const searchUrl = `https://github.com/${owner}/${repo}${branchString}`;
      setUrl(searchUrl);
      handleGo(null, searchUrl);
    } else {
      handleTemplateChange(null, searchTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the tree string data for the given template or repository
  useQuery(
    ["selectedTemplate", template],
    async () => {
      const data = await fetch(`/api/template/${template}`).then(res => res.text());
      const parsedData = data
        .split("\n")
        .filter(line => !line.startsWith("//"))
        .join("\n");
      setTreeState(treeStringToJson(parsedData));
      setBaseTree(template || "");
      return parsedData;
    },
    {
      enabled: !!template,
    }
  );

  // Fetch list of all available templates
  const { data: templates } = useQuery("templatesData", () =>
    fetch("/api/templates").then(res => res.json())
  );

  // Immediately pulls in new template data
  const handleTemplateChange = (e: any, template: any) => {
    if (template) {
      navigate(`/template/${template}`);
    } else {
      navigate("/");
    }
    // setTemplate tells us which template is selected and to load data for it from backend
    setTemplate(template);
    // setBaseTree tells us that the selected source of tree data has changed
    setBaseTree(template);
  };

  // Handles changes to input value
  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  // Pulls from github api on click of button
  const handleGo = (e: any, urlFromParams: string | null = null) => {
    // Either get URL passed in OR use the current state value
    const searchUrl = urlFromParams || url;
    const stringRe = "[A-Za-z0-9-_.]+";
    const re = new RegExp(
      `https://github.com/(?<owner>${stringRe})/(?<repo>${stringRe})((/tree)?/(?<branch>${stringRe}))?`
    );
    const groups = searchUrl.match(re)?.groups;
    if (!groups) {
      console.error(`Could not parse URL: ${searchUrl} with regex: ${re.toString()}`);
      return;
    }
    const { owner, repo, branch }: Record<string, string> = groups;
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
        setBaseTree(searchUrl);
        navigate(
          `/template/github?owner=${owner}&repo=${repo}${branch ? `&branch=${branch}` : ""}`
        );
      });
  };

  return (
    <div
      className={classes.dropdownContainer}
      ref={ref}
      style={{
        flexDirection: wrap ? "column" : "row",
      }}
    >
      <Autocomplete
        id="combo-box-demo"
        options={templates || []}
        value={template}
        className={classes.input}
        style={wrap ? { marginBottom: theme.spacing(1) } : { marginBottom: 0 }}
        size="small"
        onChange={handleTemplateChange}
        renderInput={params => (
          <TextField {...params} label="Select a template" variant="outlined" />
        )}
      />
      {!wrap && <Typography className={classes.or}>or</Typography>}
      <div className={classes.githubContainer}>
        <TextField
          size="small"
          className={classes.input}
          label="Link to GitHub repository"
          variant="outlined"
          value={url}
          onChange={handleUrlChange}
        />
        <div className={classes.go}>
          <Button style={{ height: "100%" }} variant="outlined" onClick={handleGo}>
            GO
          </Button>
        </div>
      </div>
    </div>
  );
};
