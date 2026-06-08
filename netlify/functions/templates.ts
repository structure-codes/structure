import type { Config } from "@netlify/functions";
import { getErrorMessage } from "../lib/errorHandler";
import { json, USER_AGENT } from "../lib/http";

interface ITemplates {
  name: string;
  url: string;
  tags: string[];
}

const templatesRepo = "https://raw.githubusercontent.com/structure-codes/structure-templates/main/";

export default async (): Promise<Response> => {
  const templatesUrl = `${templatesRepo}/templates.json`;
  try {
    const res = await fetch(templatesUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data: ITemplates[] = await res.json();
    const parsed = data.map(template => ({
      name: template.name.replace(/\.tree$/, ""),
      url: template.url,
    }));
    return json(parsed);
  } catch (e) {
    const errMsg = getErrorMessage(e);
    console.error("Error retrieving templates from:", templatesUrl, "\n", errMsg);
    return json({ error: errMsg }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/templates",
  method: "GET",
};
