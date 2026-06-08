// Guardrail: component styles must reference design-token CSS vars, not raw
// colors. Fails if a hex (#rgb / #rgba / #rrggbb / #rrggbbaa) or an oklch()
// literal appears in a component file under src/app.
//
// The token layer and the few bridges that genuinely need literal colors are
// allowlisted: the color scale lives in tokens.ts, index.css is the global token
// + utility layer, Monaco's theme can't read CSS vars, and depthColor.ts is the
// depth-ramp engine whose hex/oklch values are its data.
//
// Run via `npm run lint` (also wired into CI).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN_DIR = join(ROOT, "src/app");
const EXTS = new Set([".css", ".ts", ".tsx"]);

const ALLOW = new Set([
  "src/app/tokens.ts",
  "src/app/oklch.ts",
  "src/app/theme.ts",
  "src/app/index.css",
  "src/app/HomeView/CodePanel/customLang.ts",
  "src/app/HomeView/ModelPanel/depthColor.ts",
]);

// Hex color (3/4/6/8 digits) or an oklch() literal.
const PATTERNS = [/#[0-9a-fA-F]{3,8}\b/, /oklch\(/i];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Tests legitimately assert on raw color values (e.g. oklch→hex output).
      if (entry === "__tests__") continue;
      walk(full, out);
    } else if (EXTS.has(extname(full))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(SCAN_DIR)) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (ALLOW.has(rel)) continue;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const re of PATTERNS) {
      const m = line.match(re);
      if (m) violations.push(`${rel}:${i + 1}  ${m[0]}  →  ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error(`\n✗ Raw color literals found in component styles (use a --token var instead):\n`);
  for (const v of violations) console.error("  " + v);
  console.error(
    `\nIf a literal is genuinely unavoidable, add the file to ALLOW in scripts/check-tokens.mjs.\n`
  );
  process.exit(1);
}

console.log("✓ check-tokens: no raw hex/oklch in component styles");
