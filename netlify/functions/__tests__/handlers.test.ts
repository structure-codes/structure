import type { Context } from "@netlify/functions";
import templates from "../templates";
import template from "../template";
import github from "../github";
import templateJson from "./templates.json";

// Minimal Context stub — only `params` is read by the handlers.
const ctx = (params: Record<string, string> = {}) => ({ params } as unknown as Context);

describe("hitting external APIs works", () => {
  it("GET /api/templates", async () => {
    const res = await templates();
    expect(res.headers.get("content-type")).toMatch(/json/);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it("GET /api/template/react-boilerplate", async () => {
    const res = await template(new Request("https://x/api/template/react-boilerplate"), ctx({ template: "react-boilerplate" }));
    expect(res.headers.get("content-type")).toMatch(/text/);
    expect(res.status).toBe(200);
  });

  const post = (body: unknown) =>
    github(new Request("https://x/api/github", { method: "POST", body: JSON.stringify(body) }));

  it("POST /api/github SUCCESS", async () => {
    const res = await post({ owner: "structure-codes", repo: "structure", branch: null });
    expect(res.headers.get("content-type")).toMatch(/json/);
    expect(res.status).toBe(200);
  });

  it("POST /api/github INVALID REPO", async () => {
    const res = await post({ owner: "structure-codes", repo: "structurestructurestructurestructure", branch: null });
    expect(res.headers.get("content-type")).toMatch(/json/);
    expect(res.status).toBe(404);
  });

  it("POST /api/github INVALID BRANCH", async () => {
    const res = await post({ owner: "structure-codes", repo: "structure", branch: "3333333333333333333" });
    expect(res.headers.get("content-type")).toMatch(/json/);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/templates (mocked fetch)", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("parses template names from the upstream JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(templateJson),
    }) as unknown as typeof fetch;

    const res = await templates();
    const body = await res.json();
    expect(res.headers.get("content-type")).toMatch(/json/);
    expect(body).toContain("react-boilerplate");
    expect(body.every((name: string) => !name.endsWith(".tree"))).toBe(true);
  });
});
