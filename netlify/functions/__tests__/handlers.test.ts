import type { Context } from "@netlify/functions";
import { afterEach, describe, expect, it, vi } from "vitest";
import templates from "../templates";
import template from "../template";
import github from "../github";
import templateJson from "./templates.json";

// Minimal Context stub — the handlers only read `params`.
const ctx = (params: Record<string, string> = {}) => ({ params } as unknown as Context);

// Fake `fetch` responses (handlers only use ok / status / json() / text()).
const ok = (body: { json?: unknown; text?: string }) => ({
  ok: true,
  status: 200,
  json: async () => body.json,
  text: async () => body.text ?? "",
});
const notFound = () => ({ ok: false, status: 404, json: async () => ({}), text: async () => "" });

const realFetch = global.fetch;
afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

describe("GET /api/templates", () => {
  it("returns template names with the .tree suffix stripped", async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ json: templateJson })) as unknown as typeof fetch;
    const res = await templates();
    expect(res.headers.get("content-type")).toMatch(/json/);
    const body = await res.json();
    expect(body).toContain("react-boilerplate");
    expect(body.every((name: string) => !name.endsWith(".tree"))).toBe(true);
  });

  it("sends a User-Agent (GitHub rejects requests without one)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ json: [] }));
    global.fetch = fetchMock as unknown as typeof fetch;
    await templates();
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ "User-Agent": expect.any(String) });
  });

  it("returns 502 and logs when the upstream request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue(notFound()) as unknown as typeof fetch;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await templates();
    expect(res.status).toBe(502);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("GET /api/template/:template", () => {
  it("returns the raw .tree text", async () => {
    global.fetch = vi.fn().mockResolvedValue(ok({ text: "root/\n\tchild" })) as unknown as typeof fetch;
    const res = await template(new Request("https://x/api/template/foo"), ctx({ template: "foo" }));
    expect(res.headers.get("content-type")).toMatch(/text/);
    expect(await res.text()).toBe("root/\n\tchild");
  });

  it("returns 502 and logs when the upstream request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue(notFound()) as unknown as typeof fetch;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await template(new Request("https://x/api/template/foo"), ctx({ template: "foo" }));
    expect(res.status).toBe(502);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("POST /api/github", () => {
  const post = (body: unknown) =>
    github(new Request("https://x/api/github", { method: "POST", body: JSON.stringify(body) }));

  it("returns a nested tree on success", async () => {
    const sample = {
      tree: [
        { path: "src", type: "tree" },
        { path: "src/index.ts", type: "blob" },
      ],
    };
    global.fetch = vi.fn().mockResolvedValue(ok({ json: sample })) as unknown as typeof fetch;
    const res = await post({ owner: "o", repo: "r", branch: null });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1); // single root node "src/"
    expect(body[0].name).toBe("src/");
    expect(body[0].children[0].name).toBe("index.ts");
  });

  it("falls back from the main branch to master", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(notFound()) // main
      .mockResolvedValueOnce(ok({ json: { tree: [{ path: "f", type: "blob" }] } })); // master
    global.fetch = fetchMock as unknown as typeof fetch;
    const res = await post({ owner: "o", repo: "r", branch: null });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/main?");
    expect(String(fetchMock.mock.calls[1][0])).toContain("/master?");
  });

  it("returns 404 and logs when both main and master fail", async () => {
    global.fetch = vi.fn().mockResolvedValue(notFound()) as unknown as typeof fetch;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post({ owner: "o", repo: "missing", branch: null });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/Error retrieving GitHub data/);
    expect(errorSpy).toHaveBeenCalled();
  });
});
