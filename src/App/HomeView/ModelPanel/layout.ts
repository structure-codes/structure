// Tree pipeline for the visualization, ported from the design prototype's
// treeviz.jsx and adapted to the app's TreeType data model.
//
//   TreeType[]  --toRawTree-->  RawNode  --buildVisibleTree-->  VisNode
//               --layoutTree-->  { nodes, links, bbox, ... }  --linkPath-->  SVG path
//
// IMPORTANT: the filtering predicates here mirror @structure-codes/utils'
// treeJsonToString EXACTLY, so the graph and the Monaco code panel always agree on
// which nodes are visible (this fixes the old ModelPanel, which ignored settings).
import { TreeType } from "@structure-codes/utils";

export type LayoutKind = "tree-h" | "tree-v" | "radial";
export type NodeType = "dir" | "file";

export interface RawNode {
  id: string;
  /** Raw name (predicates run on this, matching treeJsonToString). */
  name: string;
  /** Display label (a single trailing "/" stripped). */
  label: string;
  type: NodeType;
  depth: number; // root = 0, top-level entries = 1 (matches treeJsonToString levels)
  index: number; // TreeType._index — link key to the Monaco code line
  children: RawNode[];
}

export interface VisNode {
  id: string;
  label: string;
  type: NodeType;
  depth: number;
  index: number;
  visKids: VisNode[];
  collapsed: boolean;
  hasHiddenChildren: boolean;
  hiddenCount: number;
}

export interface BuildOpts {
  collapsed: Set<string>;
  hideFiles: boolean;
  hideDots: boolean;
  depthLimit: number; // 0 = show all (matches settingsAtom.depth)
}

export interface LayoutOpts {
  layout: LayoutKind;
  nodeGap: number;
  levelGap: number;
}

export interface PlacedNode {
  id: string;
  label: string;
  type: NodeType;
  depth: number;
  index: number;
  x: number;
  y: number;
  ang?: number;
  collapsed: boolean;
  hasHiddenChildren: boolean;
  hiddenCount: number;
  isLeaf: boolean;
}

export interface PlacedLink {
  id: string;
  from: PlacedNode;
  to: PlacedNode;
  depth: number;
}

export interface LayoutResult {
  nodes: PlacedNode[];
  links: PlacedLink[];
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
  maxDepth: number;
  leaves: number;
}

// Files with no extension that treeJsonToString still treats as files (so they're
// hidden by hideFiles, and as "dots" by hideDots). Exact, case-insensitive match.
const SPECIAL_FILES = new Set([
  "dockerfile",
  "vagrantfile",
  "jenkinsfile",
  "makefile",
  "license",
  "changelog",
  "authors",
]);
const isSpecialFile = (name: string) => SPECIAL_FILES.has(name.toLowerCase());

const stripSlash = (name: string) => (name.endsWith("/") ? name.slice(0, -1) : name);

/** A leaf "looks like a file" iff its name has an extension or is a special file. */
const looksLikeFile = (node: { name: string; children: unknown[] }) =>
  node.children.length === 0 && (node.name.includes(".") || isSpecialFile(node.name));

// ---- TreeType[] -> RawNode (single rooted tree with stable path ids) ----------
export function toRawTree(tree: TreeType[], rootName: string): RawNode {
  const build = (node: TreeType, parentPath: string, depth: number): RawNode => {
    const label = stripSlash(node.name);
    const id = `${parentPath}/${node.name}`;
    const type: NodeType =
      node.children.length > 0 || node.name.endsWith("/") || !looksLikeFile(node) ? "dir" : "file";
    return {
      id,
      name: node.name,
      label,
      type,
      depth,
      index: node._index,
      children: node.children.map(c => build(c, id, depth + 1)),
    };
  };
  return {
    id: "__root__",
    name: rootName,
    label: rootName,
    type: "dir",
    depth: 0,
    index: -1,
    children: tree.map(c => build(c, "__root__", 1)),
  };
}

// ---- Build the visible (filtered + collapsed) tree ----------------------------
// Predicates intentionally match treeJsonToString so both panes agree.
const isHidden = (node: RawNode, opts: BuildOpts): boolean => {
  if (node.depth > opts.depthLimit && opts.depthLimit > 0) return true;
  if (opts.hideDots && (node.name.startsWith(".") || isSpecialFile(node.name))) return true;
  if (opts.hideFiles && looksLikeFile(node)) return true;
  return false;
};

function countDescendants(node: RawNode, opts: BuildOpts): number {
  let n = 0;
  node.children.forEach(c => {
    if (isHidden(c, opts)) return;
    n += 1 + countDescendants(c, opts);
  });
  return n;
}

export function buildVisibleTree(root: RawNode, opts: BuildOpts): VisNode {
  const visit = (node: RawNode): VisNode => {
    const candidateKids = node.children.filter(c => !isHidden(c, opts));
    // depth is 1-indexed for entries (root is 0 and never capped)
    const atDepthCap = opts.depthLimit > 0 && node.depth >= opts.depthLimit;
    const isCollapsed = opts.collapsed.has(node.id);
    const hide = (isCollapsed || atDepthCap) && candidateKids.length > 0;
    return {
      id: node.id,
      label: node.label,
      type: node.type,
      depth: node.depth,
      index: node.index,
      collapsed: hide,
      hasHiddenChildren: hide,
      hiddenCount: hide ? countDescendants(node, opts) : 0,
      visKids: hide ? [] : candidateKids.map(visit),
    };
  };
  return visit(root);
}

// Ordered stable ids for the Monaco code panel, one per emitted line. Mirrors
// treeJsonToString's pre-order output (which ignores graph collapse), so line N of
// the editor maps to ids[N - 1]. This is the bridge for cross-pane hover-linking.
export function codeLineIds(root: RawNode, opts: Omit<BuildOpts, "collapsed">): string[] {
  const vis = buildVisibleTree(root, { ...opts, collapsed: new Set<string>() });
  const ids: string[] = [];
  const rec = (n: VisNode) => {
    ids.push(n.id);
    n.visKids.forEach(rec);
  };
  vis.visKids.forEach(rec); // skip the synthetic root (not emitted as a line)
  return ids;
}

// ---- Tidy layout (naive leaf-packing; one leaf per slot) ----------------------
export function layoutTree(visRoot: VisNode, opts: LayoutOpts): LayoutResult {
  const { layout, nodeGap, levelGap } = opts;
  const pos = new Map<string, number>();
  let leafCounter = 0;

  const assignPos = (n: VisNode): number => {
    let p: number;
    if (n.visKids.length === 0) {
      p = leafCounter++;
    } else {
      const kids = n.visKids.map(assignPos);
      p = (kids[0] + kids[kids.length - 1]) / 2;
    }
    pos.set(n.id, p);
    return p;
  };
  assignPos(visRoot);
  const leaves = Math.max(1, leafCounter);

  const nodes: PlacedNode[] = [];
  const links: PlacedLink[] = [];
  let maxDepth = 0;

  const place = (n: VisNode, parent: PlacedNode | null) => {
    maxDepth = Math.max(maxDepth, n.depth);
    const p = pos.get(n.id) as number;
    let x: number;
    let y: number;
    let ang: number | undefined;
    if (layout === "tree-v") {
      x = p * nodeGap;
      y = n.depth * levelGap;
    } else if (layout === "radial") {
      const r = n.depth * (levelGap * 0.82);
      const span = Math.PI * 2 * (leaves <= 1 ? 0 : 0.86);
      ang = (p / leaves) * span - span / 2 - Math.PI / 2;
      x = r * Math.cos(ang);
      y = r * Math.sin(ang);
    } else {
      // tree-h (default)
      x = n.depth * levelGap;
      y = p * nodeGap;
    }
    const rec: PlacedNode = {
      id: n.id,
      label: n.label,
      type: n.type,
      depth: n.depth,
      index: n.index,
      x,
      y,
      ang,
      collapsed: n.collapsed,
      hasHiddenChildren: n.hasHiddenChildren,
      hiddenCount: n.hiddenCount,
      isLeaf: n.visKids.length === 0 && !n.hasHiddenChildren,
    };
    nodes.push(rec);
    if (parent) links.push({ id: `${parent.id}>${n.id}`, from: parent, to: rec, depth: n.depth });
    n.visKids.forEach(k => place(k, rec));
  };
  place(visRoot, null);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  nodes.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  return { nodes, links, bbox: { minX, minY, maxX, maxY }, maxDepth, leaves };
}

// ---- Link path per layout -----------------------------------------------------
export function linkPath(l: PlacedLink, layout: LayoutKind): string {
  const { from, to } = l;
  if (layout === "tree-v") {
    const my = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} C ${from.x} ${my}, ${to.x} ${my}, ${to.x} ${to.y}`;
  }
  if (layout === "radial") {
    const cx = ((from.x + to.x) / 2) * 0.6;
    const cy = ((from.y + to.y) / 2) * 0.6;
    return `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
  }
  const mx = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
}
