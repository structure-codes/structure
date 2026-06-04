import type { Config, Context } from "@netlify/functions";
import { getErrorMessage } from "../lib/errorHandler";
import { text, USER_AGENT } from "../lib/http";

const templatesRepo = "https://raw.githubusercontent.com/structure-codes/structure-templates/main/";

export default async (_req: Request, context: Context): Promise<Response> => {
  const { template } = context.params;
  const templateUrl = `${templatesRepo}/templates/${template}.tree`;
  try {
    const res = await fetch(templateUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data = await res.text();
    return text(data);
  } catch (e) {
    const errMsg = getErrorMessage(e);
    console.error("Error retrieving template from:", templateUrl, "\n", errMsg);
    return text(errMsg, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/template/:template",
  method: "GET",
};
