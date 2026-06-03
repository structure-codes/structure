import type { Handler, HandlerResponse } from "@netlify/functions";
import serverless from "serverless-http";
import { app } from "../../api/src";

const serverlessHandler = serverless(app);

// The Express app mounts its router at "/api". Depending on how Netlify
// dispatches the request (direct function URL vs. the "/api/*" redirect),
// event.path may arrive as either "/.netlify/functions/api/..." or
// "/api/...". Normalize it to "/api/..." so the router always matches.
export const handler: Handler = (event, context) => {
  let path = event.path.replace(/^\/\.netlify\/functions\/api/, "/api");
  if (!path.startsWith("/api")) {
    path = `/api${path.startsWith("/") ? "" : "/"}${path}`;
  }
  return serverlessHandler({ ...event, path }, context) as Promise<HandlerResponse>;
};
