# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Structure (https://structure.codes) is an interactive web tool for designing and exploring repository directory structures. The user pastes a GitHub repo URL or picks a community template; the app renders the file tree two ways at once — as editable ASCII tree text (Monaco editor) and as a pannable/zoomable node graph (SVG) — and lets them filter by depth, hide files/dot-entries, then copy or download the result as a `.tree` file.

It is a React SPA served by Netlify, with a handful of serverless functions acting as a CORS/User-Agent proxy in front of the GitHub API and a remote templates repo. There is no database and no app-owned backend state.

## Commands

```sh
npm start            # netlify dev — runs Vite (port 3000) proxied on :8888 with the /api functions
npm run build        # tsc type-check then vite build -> dist/
npm run lint         # eslint . (flat config in eslint.config.mjs)
npm test             # vitest run (all tests, one pass)
npm run test:watch   # vitest in watch mode
npm run test:functions  # vitest run netlify — only the serverless-function tests
```

Run a single test file or test by name:

```sh
npx vitest run src/app/HomeView/Dropdown/__tests__/Dropdown.test.tsx
npx vitest run -t "returns template names"
```

Always run the app with `npm start` (`netlify dev`), **not** bare `vite` — the `/api/*` routes are Netlify functions and won't exist under plain Vite. The functions self-register their routes via the exported `config.path` in each file (e.g. `/api/github`), so there are no redirect rules wiring them up.

## Test environment

Vitest runs two environments from one config (`vite.config.mts`):
- `src/**` → **jsdom**, given a real origin (`http://localhost:3000/`) so the app's relative `fetch("/api/...")` calls resolve to absolute URLs that **msw** can intercept.
- `netlify/**` → **node** (matched via `environmentMatchGlobs`). Function tests stub `global.fetch` directly rather than using msw.

`src/setupTests.ts` is the shared setup file.

## Architecture

### Shared tree model and the two-pane bridge

The whole app revolves around one data type, `TreeType` (from the external `@structure-codes/utils` package): a recursive `{ _index, name, children }` node. The package also provides the two canonical converters used everywhere:
- `treeStringToJson(str)` — ASCII tree text → `TreeType[]`
- `treeJsonToString({ tree, tabChar, options })` — `TreeType[]` → ASCII text, applying the visibility `options` (depth limit, hideFiles, hideDots)

State lives in **Recoil** atoms in [src/store.ts](src/store.ts):
- `treeAtom` — the current `TreeType[]` (the source of truth for structure)
- `settingsAtom` — `{ depth, hideFiles, hideDots }` visibility filters
- `baseTreeAtom` — a string identifying where the current tree came from (a GitHub URL or a template name); used to derive repo name/link and to reset the graph on source change
- `hoveredNodeAtom` / `selectedNodeAtom` — **transient, non-persisted** cross-pane link state holding a node's stable path id

The two panes must agree on *exactly* which nodes are visible. This is the central invariant: the filtering predicates in [src/app/HomeView/ModelPanel/layout.ts](src/app/HomeView/ModelPanel/layout.ts) (`isHidden`, `looksLikeFile`, the `SPECIAL_FILES` set) are hand-mirrored from `treeJsonToString`'s behavior so the graph and the Monaco text never disagree. **If you change visibility logic, change it in both places or the panes desync.**

Cross-pane hover/select linking works through stable path ids (e.g. `__root__/src/app`):
- `layout.ts:toRawTree` assigns each node an id from its path; `codeLineIds` produces the ordered id list mirroring `treeJsonToString`'s pre-order line output, so **editor line N ↔ ids[N-1]**.
- [CodePanel](src/app/HomeView/CodePanel/index.tsx) maps Monaco mouse events → line → id → sets the hover/select atoms, and conversely renders Monaco line decorations from those atoms.
- [ModelPanel](src/app/HomeView/ModelPanel/index.tsx) sets the same atoms from SVG node events, highlights the hovered node's lineage to the root, and recenters on selection.

So hovering a node in either pane lights up the matching row/node in the other, and clicking recenters the graph.

### The layout pipeline (ModelPanel)

[layout.ts](src/app/HomeView/ModelPanel/layout.ts) is a pure pipeline, ported from a design prototype and decoupled from React:

```
TreeType[] --toRawTree--> RawNode --buildVisibleTree--> VisNode --layoutTree--> { nodes, links, bbox } --linkPath--> SVG path
```

`buildVisibleTree` applies filters + collapse state; `layoutTree` does naive leaf-packing positioning for three layout kinds (`tree-h` default, `tree-v`, `radial`). ModelPanel memoizes this pipeline aggressively so pan/zoom/hover re-renders (which only touch transform + atoms) don't recompute geometry. Above ~600 visible nodes it drops the per-node glow filter to stay responsive (`heavy` flag). Pan/zoom is hand-rolled on an SVG `<g transform>` (pointer events + a non-passive wheel listener), not a library.

### CodePanel (Monaco)

[CodePanel](src/app/HomeView/CodePanel/index.tsx) registers a custom `"tree"` Monaco language ([customLang.ts](src/app/HomeView/CodePanel/customLang.ts)) and theme, and a folding-range provider derived from the tree. The editor is currently **read-only**: it renders `treeJsonToString(treeState)` and reflects atom-driven hover/select decorations. There is a large `handleEditorChange` function for live tree-prefix auto-formatting that is **intentionally disabled** (the `onDidChangeModelContent` wiring is commented out) — it's WIP, not dead code; leave it unless explicitly working on edit support. The branch-glyph constants/helpers live in [treeHelper.ts](src/app/HomeView/CodePanel/treeHelper.ts) (`│`, `├──`, `└──`).

### Data loading (Dropdown) and serverless functions

[Dropdown](src/app/HomeView/Dropdown/index.tsx) is the only place that loads trees. It reads the source from the URL on mount (deep-linkable: `/template/:template`, and `/template/github?owner=&repo=&branch=`), fetches via **react-query**, and writes `treeAtom` + `baseTreeAtom`. ModelPanel reuses the same react-query key (`"templatesData"`) to resolve a template's origin GitHub link from the manifest.

The three Netlify functions in [netlify/functions/](netlify/functions/) are thin proxies (each adds a `User-Agent`, which GitHub requires, and handles errors):
- `github.ts` (`POST /api/github`) — fetches a repo's recursive git tree from the GitHub API, tries the requested branch then falls back `main`→`master`, and converts to `TreeType[]` via `netlify/lib/tree.ts:githubToTree`.
- `templates.ts` (`GET /api/templates`) — lists templates from the remote `structure-templates` repo.
- `template.ts` (`GET /api/template/:template`) — fetches one template's `.tree` text.

Templates and `.tree` files are **not** in this repo — they live in `structure-codes/structure-templates` on GitHub and are fetched at runtime.

## Conventions

- **Routing/dev:** `netlify dev` on `:8888` is the real entry point; Vite is the proxied framework server.
- **Component styles: CSS Modules.** Each component has a sibling `style.module.css` imported as `import classes from "./style.module.css"` (default import named `classes`, so call sites stay `classes.foo`). All values come from the token CSS vars — no hardcoded colors/fonts/dimensions. The component library is **MUI v5+ (`@mui/material`, emotion engine)**; there are no `makeStyles`/`useStyles` `style.ts` files. **Gotcha:** MUI's internal classes (`.MuiOutlinedInput-root`, `.MuiSlider-thumb`, …) are global, so wrap them in `:global(...)`. [main.tsx](src/app/main.tsx) wraps the app in `<StyledEngineProvider injectFirst>` so emotion injects its styles *first* and the CSS Modules win the cascade on order; as a belt-and-suspenders specificity margin, overrides applied to the *same element* as a MUI base class also double the local class (`.button.button`). Plain `.css` (non-module) is still used for the viz/Monaco internals ([tree.css](src/app/HomeView/ModelPanel/tree.css), [codePanel.css](src/app/HomeView/CodePanel/codePanel.css)) and the global utilities in [index.css](src/app/index.css).
- **Design tokens:** the color scale is authored once, in oklch, in [src/app/tokens.ts](src/app/tokens.ts). `applyTokens()` (called in `main.tsx` before render) injects the colors, `--accent`, and the font vars (`--font-ui`, `--font-mono`) onto `:root`; the `tokens` hex mirror and the `FONT_*` constants are exported for the JS-only consumers that can't read CSS vars / parse `oklch()` — the MUI theme ([theme.ts](src/app/theme.ts)) and Monaco ([customLang.ts](src/app/HomeView/CodePanel/customLang.ts), CodePanel editor options). `--accent` is the one accent definition (also feeds `depthColor.ts`). The hex mirror is *derived* via [oklch.ts](src/app/oklch.ts) — don't reintroduce a hand-maintained hex or font-stack table. Structural scales (`--radius`, `--radius-lg`, `--dur-fast`, `--dur`, `--space-1..4`) and the reusable `.glass` overlay utility live in [index.css](src/app/index.css); use them rather than hardcoding values.
- **Token guardrail:** component styles under `src/app` must use the `--token` vars, not raw colors. `npm run lint` (and CI) runs [scripts/check-tokens.mjs](scripts/check-tokens.mjs), which fails on any hex/`oklch()` literal outside the allowlisted token/bridge files (`tokens.ts`, `oklch.ts`, `theme.ts`, `index.css`, `customLang.ts`, `depthColor.ts`). Add a new literal home to that script's `ALLOW` set only if a JS bridge genuinely can't read a CSS var.
- **Facelift status:** all phases complete. The MUI v4→v5+ upgrade landed (`@mui/material` + `@emotion/*`, `palette.mode`, Autocomplete imported from core, `slotProps.input` replacing the removed `InputProps`, no `.MuiButton-label` wrapper). MUI tests run under jsdom because `@mui`/`@emotion` are **inlined** in [vite.config.mts](vite.config.mts) — their native ESM bare-imports `react/jsx-runtime`, which React 17 doesn't expose via an exports map.
- **Lint:** flat ESLint config. `@typescript-eslint/no-explicit-any` is **off** by design (API payloads + MUI handlers lean on `any`); unused vars are an error but `_`-prefixed names are ignored. The React Compiler hook ruleset is intentionally not enabled — only classic rules-of-hooks + exhaustive-deps (as a warning).
- React 17, `react-jsx` runtime, TS `strict`, `noEmit` (Vite/esbuild does the transpile; `tsc` is type-check only).
