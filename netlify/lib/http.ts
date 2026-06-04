// Small helpers for building Web `Response` objects from the v2 functions API.
// Avoids relying on `Response.json` so the code runs on any supported Node
// version in the Netlify runtime.
export const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });

export const text = (body: string, init: ResponseInit = {}): Response =>
  new Response(body, {
    ...init,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...(init.headers || {}) },
  });

// GitHub's REST API rejects requests without a User-Agent header, so set one
// on all outbound calls (got used to supply a default).
export const USER_AGENT = "structure-codes";
