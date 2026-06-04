import type { Config } from "@netlify/functions";
import { githubToTree } from "../lib/tree";
import { getErrorMessage } from "../lib/errorHandler";
import { json, USER_AGENT } from "../lib/http";

const treesUrl = (owner: string, repo: string, branch: string) =>
  `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

const fetchTree = async (url: string) => {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
};

export default async (req: Request): Promise<Response> => {
  const { owner, repo, branch } = await req.json();
  // Try the requested branch (defaulting to "main"), then fall back to "master".
  let url = treesUrl(owner, repo, branch || "main");
  let data: any;
  try {
    data = await fetchTree(url);
  } catch {
    try {
      url = treesUrl(owner, repo, branch || "master");
      data = await fetchTree(url);
    } catch (e) {
      const errMsg = `Error retrieving GitHub data from: ${url}\n${getErrorMessage(e)}`;
      console.error(errMsg);
      return json({ error: errMsg }, { status: 404 });
    }
  }
  const tree = githubToTree(data.tree);
  return json(tree);
};

export const config: Config = {
  path: "/api/github",
  method: "POST",
};
