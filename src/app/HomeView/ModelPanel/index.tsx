import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import {
  treeAtom,
  settingsAtom,
  baseTreeAtom,
  hoveredNodeAtom,
  selectedNodeAtom,
} from "../../../store";
import {
  toRawTree,
  buildVisibleTree,
  layoutTree,
  linkPath,
  LayoutKind,
  PlacedNode,
} from "./layout";
import { depthColor, DEFAULT_ACCENT_HUE } from "./depthColor";
import classes from "./style.module.css";
import { GitHubMark } from "../../../components/GitHubMark";
import "./tree.css";

// View options — these live as local defaults in Phase 1. Phase 3 lifts them to a
// persisted viewOptionsAtom driven by the Tweaks popover.
const DEFAULT_VIEW = {
  layout: "tree-h" as LayoutKind,
  nodeGap: 40,
  levelGap: 155,
  accentHue: DEFAULT_ACCENT_HUE,
};

const nodeR = (n: PlacedNode) => (n.depth === 0 ? 13 : n.type === "file" ? 5.5 : 9);

// Labels extend rightward with no collision avoidance; cap very long names so a
// single deeply-named file can't blow out the layout / overlap the next column.
const MAX_LABEL = 32;
const truncateLabel = (s: string) => (s.length > MAX_LABEL ? `${s.slice(0, MAX_LABEL - 1)}…` : s);

/** Friendly repo name for the root node + chip, derived from the active source. */
function deriveRepoName(baseTree: string): string {
  if (!baseTree) return "structure";
  const gh = baseTree.match(/github\.com\/[^/]+\/([^/]+)/);
  if (gh) return gh[1];
  return baseTree;
}

/** The GitHub URL for a source string (a raw repo URL or a template's url), else null. */
function deriveRepoUrl(source: string): string | null {
  return /^https?:\/\/github\.com\//i.test(source) ? source : null;
}

interface TemplateMeta {
  name: string;
  url: string;
}

const ANIM_MS = 520;

export const ModelPanel = React.memo(() => {
  const treeState = useAtomValue(treeAtom);
  const settings = useAtomValue(settingsAtom);
  const baseTree = useAtomValue(baseTreeAtom);

  const view = DEFAULT_VIEW;
  const repoName = deriveRepoName(baseTree);

  // Template sources (e.g. "react-boilerplate") carry their origin repo in the
  // templates manifest, so resolve the GitHub link from there. Shares react-query's
  // cache with the Dropdown (same key), and resolves reactively to cover deep links
  // where the manifest loads after the tree.
  const { data: templates } = useQuery<TemplateMeta[]>({
    queryKey: ["templatesData"],
    queryFn: () => fetch("/api/templates").then(res => res.json()),
  });
  const repoUrl = useMemo(() => {
    const direct = deriveRepoUrl(baseTree);
    if (direct) return direct;
    const match = Array.isArray(templates) ? templates.find(t => t.name === baseTree) : undefined;
    return match ? deriveRepoUrl(match.url) : null;
  }, [baseTree, templates]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [transform, setTransform] = useState({ tx: 400, ty: 300, k: 1 });
  const [animate, setAnimate] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const movedRef = useRef(false);

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const hoveredId = useAtomValue(hoveredNodeAtom);
  const selectedId = useAtomValue(selectedNodeAtom);
  const setHoveredId = useSetAtom(hoveredNodeAtom);
  const setSelectedId = useSetAtom(selectedNodeAtom);

  // measure container
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Geometry is a pure function of the tree + filters + collapse + layout opts.
  // Memoizing keeps pan/zoom/hover re-renders (which only change transform/atoms)
  // from recomputing buildVisibleTree + layoutTree on every frame.
  const { nodes, links, bbox, maxDepth } = useMemo(() => {
    const raw = toRawTree(treeState, repoName);
    const visRoot = buildVisibleTree(raw, {
      collapsed,
      hideFiles: settings.hideFiles,
      hideDots: settings.hideDots,
      depthLimit: settings.depth,
    });
    return layoutTree(visRoot, {
      layout: view.layout,
      nodeGap: view.nodeGap,
      levelGap: view.levelGap,
    });
  }, [
    treeState,
    repoName,
    collapsed,
    settings.hideFiles,
    settings.hideDots,
    settings.depth,
    view.layout,
    view.nodeGap,
    view.levelGap,
  ]);

  // Above ~600 visible nodes, drop the per-node glow filter (the most expensive
  // paint) so large GitHub repos stay responsive.
  const heavy = nodes.length > 600;

  // child id -> parent id, so we can walk a node's lineage back to the root.
  const parentOf = useMemo(() => {
    const m = new Map<string, string>();
    links.forEach(l => m.set(l.to.id, l.from.id));
    return m;
  }, [links]);

  // The set of node ids on the path from the hovered node up to the root
  // (inclusive). Drives the "highlight lineage on hover" treatment below.
  const hoverPath = useMemo(() => {
    if (!hoveredId) return null;
    const set = new Set<string>();
    let cur: string | undefined = hoveredId;
    while (cur && !set.has(cur)) {
      set.add(cur);
      cur = parentOf.get(cur);
    }
    return set;
  }, [hoveredId, parentOf]);

  const fit = useCallback(() => {
    const pad = 90;
    const w = bbox.maxX - bbox.minX || 1;
    const h = bbox.maxY - bbox.minY || 1;
    const k = Math.max(
      0.25,
      Math.min(1.4, Math.min((size.w - pad * 2) / w, (size.h - pad * 2) / h))
    );
    const cx = (bbox.minX + bbox.maxX) / 2;
    const cy = (bbox.minY + bbox.maxY) / 2;
    setAnimate(true);
    setTransform({ tx: size.w / 2 - cx * k, ty: size.h / 2 - cy * k, k });
    window.setTimeout(() => setAnimate(false), ANIM_MS);
  }, [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY, size.w, size.h]);

  // Auto-fit on first measure and whenever the layout type changes.
  useEffect(() => {
    if (size.w > 1) fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, view.layout]);

  // Source changed → reset collapse + selection and refit.
  useEffect(() => {
    setCollapsed(new Set());
    setSelectedId(null);
    setHoveredId(null);
    if (size.w > 1) fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTree]);

  const centerNode = useCallback(
    (n: PlacedNode) => {
      setAnimate(true);
      setTransform(v => ({ ...v, tx: size.w / 2 - n.x * v.k, ty: size.h / 2 - n.y * v.k }));
      window.setTimeout(() => setAnimate(false), ANIM_MS);
    },
    [size.w, size.h]
  );

  // Recenter whenever the selection changes (covers both graph clicks and
  // code-panel clicks, which set selectedNodeAtom from the other pane).
  useEffect(() => {
    if (!selectedId) return;
    const n = nodes.find(p => p.id === selectedId);
    if (n) centerNode(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ---- pan ----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, tx: transform.tx, ty: transform.ty };
    movedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) movedRef.current = true;
    setTransform(v => ({ ...v, tx: drag.current!.tx + dx, ty: drag.current!.ty + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  // ---- wheel zoom toward cursor (native non-passive listener) ----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setTransform(v => {
        const factor = Math.exp(-e.deltaY * 0.0014);
        const k = Math.max(0.2, Math.min(3, v.k * factor));
        const tx = mx - (mx - v.tx) * (k / v.k);
        const ty = my - (my - v.ty) * (k / v.k);
        return { tx, ty, k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    setAnimate(true);
    setTransform(v => {
      const k = Math.max(0.2, Math.min(3, v.k * factor));
      const cx = size.w / 2;
      const cy = size.h / 2;
      const tx = cx - (cx - v.tx) * (k / v.k);
      const ty = cy - (cy - v.ty) * (k / v.k);
      return { tx, ty, k };
    });
    window.setTimeout(() => setAnimate(false), 300);
  };

  // Keyboard controls when the panel is focused: a = zoom in, d = zoom out,
  // c = center (on the current selection if any, else fit the whole tree).
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "a") {
      e.preventDefault();
      zoomBy(1.25);
    } else if (key === "d") {
      e.preventDefault();
      zoomBy(0.8);
    } else if (key === "c") {
      e.preventDefault();
      const sel = selectedId ? nodes.find(p => p.id === selectedId) : null;
      if (sel) centerNode(sel);
      else fit();
    }
  };

  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    setSelectedId(id);
  };

  const legendCount = Math.min(7, maxDepth + 1);

  return (
    <div className={classes.modelContainer}>
      <div
        className="viz-wrap"
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg width={size.w} height={size.h} className="viz-svg">
          <g
            transform={`translate(${transform.tx},${transform.ty}) scale(${transform.k})`}
            style={{
              transition: animate ? `transform ${ANIM_MS}ms cubic-bezier(.4,0,.2,1)` : "none",
            }}
          >
            {/* links */}
            <g className="viz-links">
              {links.map(l => {
                // A link is on the hovered node's lineage when its child end is.
                const onPath = hoverPath?.has(l.to.id) ?? false;
                const active = onPath || selectedId === l.to.id || selectedId === l.from.id;
                return (
                  <path
                    key={l.id}
                    d={linkPath(l, view.layout)}
                    fill="none"
                    stroke={depthColor(l.depth, view.accentHue)}
                    strokeWidth={active ? 2.1 : 1.3}
                    strokeOpacity={active ? 0.9 : 0.32}
                  />
                );
              })}
            </g>
            {/* nodes */}
            <g className="viz-nodes">
              {nodes.map(n => {
                const col = depthColor(n.depth, view.accentHue);
                const r = nodeR(n);
                const isHover = hoveredId === n.id;
                const isSel = selectedId === n.id;
                const onPath = hoverPath?.has(n.id) ?? false;
                const active = isHover || isSel;
                // Keep the hovered node's whole lineage lit; dim everything else.
                const dim = hoveredId && !onPath && !isSel ? 0.45 : 1;
                const canToggle = n.type === "dir" && !n.isLeaf;

                // label placement per layout
                let lx = r + 9;
                let ly = 0;
                let anchor: "start" | "middle" | "end" = "start";
                if (view.layout === "tree-v") {
                  lx = 0;
                  ly = r + 15;
                  anchor = "middle";
                } else if (view.layout === "radial") {
                  const left = Math.cos(n.ang ?? 0) < -0.01;
                  lx = (left ? -1 : 1) * (r + 9);
                  anchor = left ? "end" : "start";
                }

                return (
                  <g
                    key={n.id}
                    className="viz-node"
                    transform={`translate(${n.x},${n.y})`}
                    style={{ opacity: dim }}
                    onMouseEnter={() => setHoveredId(n.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onPointerDown={e => {
                      e.stopPropagation();
                      if (movedRef.current) {
                        movedRef.current = false;
                        return;
                      }
                      // setSelectedId triggers the recenter effect above.
                      setSelectedId(n.id);
                    }}
                  >
                    {active && (
                      <circle
                        r={r + 7}
                        fill="none"
                        stroke={col}
                        strokeOpacity={0.35}
                        strokeWidth={2}
                      />
                    )}
                    <circle
                      className="viz-dot"
                      r={r + (active ? 2 : 0)}
                      fill={col}
                      stroke={n.type === "file" ? "transparent" : "rgba(10,10,14,0.55)"}
                      strokeWidth={1.5}
                      style={{ filter: active && !heavy ? `drop-shadow(0 0 9px ${col})` : "none" }}
                    />
                    {n.hasHiddenChildren && (
                      <>
                        <circle
                          r={r + 4}
                          fill="none"
                          stroke={col}
                          strokeOpacity={0.55}
                          strokeWidth={1.3}
                          strokeDasharray="2 2.5"
                        />
                        <text
                          className="viz-plus"
                          x={0}
                          y={0.5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="rgba(10,10,14,0.8)"
                        >
                          +
                        </text>
                      </>
                    )}
                    {canToggle && (
                      <circle
                        className="viz-toggle"
                        r={r + 12}
                        fill="transparent"
                        onClick={e => {
                          e.stopPropagation();
                          toggle(n.id);
                        }}
                      />
                    )}
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={anchor}
                      dominantBaseline="middle"
                      className="viz-label"
                      style={{
                        fill:
                          active || onPath
                            ? "var(--text)"
                            : n.type === "file"
                              ? "var(--faint)"
                              : "var(--muted)",
                        fontWeight: active || onPath ? 600 : n.type === "file" ? 400 : 500,
                      }}
                    >
                      {n.label.length > MAX_LABEL && <title>{n.label}</title>}
                      {truncateLabel(n.label)}
                      {n.hiddenCount ? (
                        <tspan className="viz-count" dx={6}>
                          {n.hiddenCount}
                        </tspan>
                      ) : null}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* repo chip (top-left) */}
        <div className="glass viz-overlay viz-repochip">
          <span className="repo-dot" />
          <span className="repo-name">{repoName}</span>
          {repoUrl && <GitHubMark size={14} url={repoUrl} />}
          <span className="repo-meta">{nodes.length} nodes</span>
        </div>

        {/* depth legend (bottom-left) */}
        <div className="glass viz-overlay viz-legend">
          <div className="legend-title">Depth</div>
          <div className="legend-swatches">
            {Array.from({ length: legendCount }).map((_, d) => (
              <div className="legend-item" key={d}>
                <span
                  className="legend-dot"
                  style={{ background: depthColor(d, view.accentHue) }}
                />
                <span>{d === 0 ? "root" : d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* zoom cluster (bottom-right) */}
        <div className="viz-zoom">
          <button
            className="glass"
            onPointerDown={() => zoomBy(1.25)}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="glass"
            onPointerDown={() => zoomBy(0.8)}
            title="Zoom out"
            aria-label="Zoom out"
          >
            &minus;
          </button>
          <button
            onPointerDown={fit}
            title="Fit to view"
            aria-label="Fit to view"
            className="glass zoom-fit"
          >
            ⤢
          </button>
        </div>
      </div>
    </div>
  );
});
