import { describe, it, expect } from "vitest";
import { TreeType, treeStringToJson, treeJsonToString } from "@structure-codes/utils";
import {
  toRawTree,
  buildVisibleTree,
  codeLineIds,
  layoutTree,
  linkPath,
  type BuildOpts,
  type VisNode,
} from "../layout";

// A realistic fixture with files, a dotfile, a special file (Dockerfile), an
// extensionless non-special dir (docs) and a nested dir — exercises every branch
// of the visibility predicates.
const FIXTURE: TreeType[] = treeStringToJson(
  [
    "├── src",
    "│\t├── index.ts",
    "│\t├── .env",
    "│\t└── components",
    "│\t\t└── Button.tsx",
    "├── Dockerfile",
    "├── docs",
    "└── README.md",
  ].join("\n")
);

const visIds = (v: VisNode): string[] => {
  const out: string[] = [];
  const rec = (n: VisNode) => {
    out.push(n.id);
    n.visKids.forEach(rec);
  };
  v.visKids.forEach(rec); // skip synthetic root
  return out;
};

const baseOpts = (over: Partial<BuildOpts> = {}): BuildOpts => ({
  collapsed: new Set<string>(),
  hideFiles: false,
  hideDots: false,
  depthLimit: 0,
  ...over,
});

describe("toRawTree", () => {
  it("builds a synthetic root with stable path ids and 0-based root depth", () => {
    const root = toRawTree([{ _index: 0, name: "src", children: [] }], "myrepo");
    expect(root.id).toBe("__root__");
    expect(root.label).toBe("myrepo");
    expect(root.depth).toBe(0);
    expect(root.index).toBe(-1);
    expect(root.children[0].id).toBe("__root__/src");
    expect(root.children[0].depth).toBe(1);
  });

  it("derives ids by path and preserves _index as the code-line link key", () => {
    const root = toRawTree(
      [{ _index: 3, name: "src", children: [{ _index: 8, name: "index.ts", children: [] }] }],
      ""
    );
    const file = root.children[0].children[0];
    expect(file.id).toBe("__root__/src/index.ts");
    expect(file.depth).toBe(2);
    expect(file.index).toBe(8);
  });

  it("classifies dir vs file the same way treeJsonToString does", () => {
    const root = toRawTree(
      [
        { _index: 0, name: "index.ts", children: [] }, // has extension -> file
        { _index: 1, name: "Dockerfile", children: [] }, // special file
        { _index: 2, name: "LICENSE", children: [] }, // special file
        { _index: 3, name: "docs", children: [] }, // extensionless, not special -> dir
        { _index: 4, name: "app/", children: [] }, // trailing slash -> dir
        { _index: 5, name: "dir", children: [{ _index: 6, name: "x.ts", children: [] }] }, // has kids -> dir
      ],
      ""
    );
    const types = Object.fromEntries(root.children.map(c => [c.name, c.type]));
    expect(types).toEqual({
      "index.ts": "file",
      Dockerfile: "file",
      LICENSE: "file",
      docs: "dir",
      "app/": "dir",
      dir: "dir",
    });
  });

  it("strips a single trailing slash for the display label", () => {
    const root = toRawTree([{ _index: 0, name: "app/", children: [] }], "");
    expect(root.children[0].name).toBe("app/");
    expect(root.children[0].label).toBe("app");
  });
});

describe("buildVisibleTree", () => {
  it("keeps every node when no filters are active", () => {
    const vis = buildVisibleTree(toRawTree(FIXTURE, ""), baseOpts());
    expect(visIds(vis)).toEqual([
      "__root__/src",
      "__root__/src/index.ts",
      "__root__/src/.env",
      "__root__/src/components",
      "__root__/src/components/Button.tsx",
      "__root__/Dockerfile",
      "__root__/docs",
      "__root__/README.md",
    ]);
  });

  it("hideFiles drops files (incl. special files) but keeps extensionless dirs", () => {
    const vis = buildVisibleTree(toRawTree(FIXTURE, ""), baseOpts({ hideFiles: true }));
    expect(visIds(vis)).toEqual(["__root__/src", "__root__/src/components", "__root__/docs"]);
  });

  it("hideDots drops dotfiles and special files only", () => {
    const vis = buildVisibleTree(toRawTree(FIXTURE, ""), baseOpts({ hideDots: true }));
    expect(visIds(vis)).toEqual([
      "__root__/src",
      "__root__/src/index.ts",
      "__root__/src/components",
      "__root__/src/components/Button.tsx",
      "__root__/docs",
      "__root__/README.md",
    ]);
  });

  it("depthLimit truncates deeper levels", () => {
    const vis = buildVisibleTree(toRawTree(FIXTURE, ""), baseOpts({ depthLimit: 1 }));
    expect(visIds(vis)).toEqual([
      "__root__/src",
      "__root__/Dockerfile",
      "__root__/docs",
      "__root__/README.md",
    ]);
  });

  it("collapse hides a node's descendants and reports the hidden count", () => {
    const vis = buildVisibleTree(
      toRawTree(FIXTURE, ""),
      baseOpts({ collapsed: new Set(["__root__/src"]) })
    );
    const src = vis.visKids.find(n => n.id === "__root__/src")!;
    expect(src.collapsed).toBe(true);
    expect(src.hasHiddenChildren).toBe(true);
    expect(src.hiddenCount).toBe(4); // index.ts, .env, components, Button.tsx
    expect(src.visKids).toEqual([]);
  });
});

// The central invariant (see CLAUDE.md / layout.ts header): codeLineIds must emit
// exactly one id per line that treeJsonToString renders, in the same order — so
// the graph and the Monaco panel never disagree about which nodes are visible.
describe("codeLineIds mirrors treeJsonToString", () => {
  type Settings = { depth: number; hideFiles: boolean; hideDots: boolean };

  const lineNames = (tree: TreeType[], options: Settings) =>
    treeJsonToString({ tree, tabChar: "\t", options })
      .split(/\r?\n/)
      .map(l => l.replace(/^[│├└─\t ]+/u, "").replace(/\/$/, ""));

  const idLeafNames = (tree: TreeType[], s: Settings) =>
    codeLineIds(toRawTree(tree, ""), {
      hideFiles: s.hideFiles,
      hideDots: s.hideDots,
      depthLimit: s.depth,
    }).map(id => id.split("/").filter(Boolean).pop() ?? "");

  const combos: Settings[] = [];
  for (const depth of [0, 1, 2, 3]) {
    for (const hideFiles of [false, true]) {
      for (const hideDots of [false, true]) {
        combos.push({ depth, hideFiles, hideDots });
      }
    }
  }

  it.each(combos)("agrees for depth=$depth hideFiles=$hideFiles hideDots=$hideDots", settings => {
    expect(idLeafNames(FIXTURE, settings)).toEqual(lineNames(FIXTURE, settings));
  });
});

describe("layoutTree", () => {
  // root > A > [B, C]
  const root = toRawTree(
    [
      {
        _index: 0,
        name: "A",
        children: [
          { _index: 1, name: "B", children: [] },
          { _index: 2, name: "C", children: [] },
        ],
      },
    ],
    ""
  );
  const vis = buildVisibleTree(root, baseOpts());

  it("packs leaves and centers parents (tree-h)", () => {
    const r = layoutTree(vis, { layout: "tree-h", nodeGap: 10, levelGap: 20 });
    const byId = Object.fromEntries(r.nodes.map(n => [n.id, n]));
    // tree-h: x = depth * levelGap, y = leafSlot * nodeGap
    expect([byId["__root__/A/B"].x, byId["__root__/A/B"].y]).toEqual([40, 0]);
    expect([byId["__root__/A/C"].x, byId["__root__/A/C"].y]).toEqual([40, 10]);
    expect([byId["__root__/A"].x, byId["__root__/A"].y]).toEqual([20, 5]); // centered on B,C
    expect(r.leaves).toBe(2);
    expect(r.maxDepth).toBe(2);
    expect(r.nodes).toHaveLength(4);
    expect(r.links).toHaveLength(3);
    expect(r.bbox).toEqual({ minX: 0, minY: 0, maxX: 40, maxY: 10 });
  });

  it("swaps the axes for tree-v", () => {
    const r = layoutTree(vis, { layout: "tree-v", nodeGap: 10, levelGap: 20 });
    const byId = Object.fromEntries(r.nodes.map(n => [n.id, n]));
    expect([byId["__root__/A/B"].x, byId["__root__/A/B"].y]).toEqual([0, 40]);
    expect([byId["__root__/A"].x, byId["__root__/A"].y]).toEqual([5, 20]);
  });

  it("produces finite polar coordinates with angles for radial", () => {
    const r = layoutTree(vis, { layout: "radial", nodeGap: 10, levelGap: 20 });
    r.nodes.forEach(n => {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(typeof n.ang).toBe("number");
    });
  });

  it("marks leaves and flags collapsed nodes as non-leaves", () => {
    const collapsed = buildVisibleTree(root, baseOpts({ collapsed: new Set(["__root__/A"]) }));
    const r = layoutTree(collapsed, { layout: "tree-h", nodeGap: 10, levelGap: 20 });
    const a = r.nodes.find(n => n.id === "__root__/A")!;
    expect(a.hasHiddenChildren).toBe(true);
    expect(a.isLeaf).toBe(false); // has hidden children, so not a true leaf
  });
});

describe("linkPath", () => {
  const from = {
    id: "p",
    label: "p",
    type: "dir" as const,
    depth: 0,
    index: -1,
    x: 0,
    y: 0,
    collapsed: false,
    hasHiddenChildren: false,
    hiddenCount: 0,
    isLeaf: false,
  };
  const to = { ...from, id: "c", x: 10, y: 20 };
  const link = { id: "p>c", from, to, depth: 1 };

  it("emits a cubic bezier for tree-h and tree-v", () => {
    expect(linkPath(link, "tree-h")).toMatch(/^M 0 0 C .* 10 20$/);
    expect(linkPath(link, "tree-v")).toMatch(/^M 0 0 C .* 10 20$/);
  });

  it("emits a quadratic curve for radial", () => {
    expect(linkPath(link, "radial")).toMatch(/^M 0 0 Q .* 10 20$/);
  });
});
