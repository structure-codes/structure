import { useEffect, useState } from "react";
import classes from "./style.module.css";
import { Button, TextField, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useSetAtom } from "jotai";
import { treeAtom, baseTreeAtom } from "../../../store";
import { treeStringToJson } from "@structure-codes/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { GitHubMark } from "../../../components/GitHubMark";

const stringRe = "[A-Za-z0-9-_.]+";
const githubUrlRe = new RegExp(
  `https://github.com/(?<owner>${stringRe})/(?<repo>${stringRe})((/tree)?/(?<branch>${stringRe}))?`
);

export const Dropdown = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams]: any = useSearchParams();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState(null);
  const setTreeState = useSetAtom(treeAtom);
  const setBaseTree = useSetAtom(baseTreeAtom);

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
  useQuery({
    queryKey: ["selectedTemplate", template],
    queryFn: async () => {
      const data = await fetch(`/api/template/${template}`).then(res => res.text());
      const parsedData = data
        .split("\n")
        .filter(line => !line.startsWith("//"))
        .join("\n");
      setTreeState(treeStringToJson(parsedData));
      setBaseTree(template || "");
      return parsedData;
    },
    enabled: !!template,
  });

  // Fetch list of all available templates
  const { data: templates } = useQuery({
    queryKey: ["templatesData"],
    queryFn: () => fetch("/api/templates").then(res => res.json()),
  });

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
    if (error) setError(null);
  };

  // Pulls from github api on click of button
  const handleGo = async (e: any, urlFromParams: string | null = null) => {
    // Either get URL passed in OR use the current state value
    const searchUrl = urlFromParams || url;
    const groups = searchUrl.match(githubUrlRe)?.groups;
    if (!groups) {
      setError("That doesn't look like a GitHub repo URL.");
      return;
    }
    const { owner, repo, branch }: Record<string, string> = groups;
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        body: JSON.stringify({ owner, repo, branch }),
        headers: { "Content-Type": "application/json" },
      });
      // The proxy returns a non-OK status (e.g. 404 for a missing/private repo)
      // with an `{ error }` body. Surface it instead of feeding the error object
      // into treeAtom, which would crash both panes.
      const data = res.ok ? await res.json() : null;
      if (!res.ok || !Array.isArray(data)) {
        setError("Unable to locate repository.");
        return;
      }
      setError(null);
      setTreeState(data);
      setBaseTree(searchUrl);
      navigate(`/template/github?owner=${owner}&repo=${repo}${branch ? `&branch=${branch}` : ""}`);
    } catch {
      setError("Something went wrong reaching GitHub. Please try again.");
    }
  };

  // GO is only actionable once the input parses as a GitHub repo URL.
  const isValidUrl = githubUrlRe.test(url);

  return (
    <div className={classes.dropdownContainer}>
      <Autocomplete
        id="combo-box-demo"
        options={Array.isArray(templates) ? templates.map((t: { name: string }) => t.name) : []}
        value={template}
        className={classes.field}
        size="small"
        onChange={handleTemplateChange}
        renderInput={params => (
          <TextField {...params} label="Select a template" variant="outlined" />
        )}
      />
      <div className={classes.githubContainer}>
        <TextField
          size="small"
          className={classes.field}
          label="Link to GitHub"
          variant="outlined"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://github.com/{owner}/{repo}"
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              startAdornment: (
                <span className={classes.ghMark}>
                  <GitHubMark size={15} />
                </span>
              ),
            },
          }}
        />
        {/* A disabled button emits no hover events, so the Tooltip is driven off
            the wrapping span (which stays interactive) to explain why it's off. */}
        <Tooltip title={isValidUrl ? "" : "Enter a valid GitHub repo URL"}>
          <span className={classes.goButtonWrap}>
            <Button
              variant="contained"
              className={classes.goButton}
              onClick={handleGo}
              disabled={!isValidUrl}
            >
              GO
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};
