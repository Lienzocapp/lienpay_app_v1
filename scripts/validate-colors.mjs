// @ts-check
/**
 * LienPay — non-token color validation for TypeScript / TSX (Req 1.3, 1.8).
 *
 * stylelint validates CSS; this companion validator covers JS-driven styles in
 * `.ts` / `.tsx` so a hard-coded product color cannot sneak in through inline
 * styles or style objects. Components must consume color exclusively through the
 * seven design tokens (via `colorVar(...)` / `var(--color-*)`), never a raw
 * literal.
 *
 * What is flagged (raw color literals): hex colors (`#RGB`..`#RRGGBBAA`) and the
 * raw color functions `rgb()/rgba()/hsl()/hsla()/hwb()/lab()/lch()/color()/
 * oklab()/oklch()`, plus the disallowed named UI colors from Req 1.8
 * (blue/teal/purple/cyan and close variants).
 *
 * What is NOT flagged: `var(--...)` token references, `currentColor`,
 * `transparent`, `inherit`, and other browser/system keywords — because the
 * approved path is to reference tokens, and these keywords carry no product color.
 *
 * ALLOWLIST: the single token-definition source `design-system/tokens/tokens.ts`
 * is the only file permitted to contain the seven locked hex values literally.
 * Test files (`*.test.*`) and type decls (`*.d.ts`) are skipped.
 *
 * Exit code 0 = clean, 1 = violations found (build-time failure).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");

/** Files allowed to contain literal color values (the single token source). */
const ALLOWLISTED_FILES = new Set(["src/design-system/tokens/tokens.ts"]);

/** Raw color-literal patterns. */
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|color|oklab|oklch)\s*\(/gi;
// Disallowed named UI colors (Req 1.8) as whole words.
const NAMED = /\b(?:blue|teal|purple|cyan|aqua|indigo|violet|navy|magenta|fuchsia)\b/gi;

/** Recursively collect .ts/.tsx files under src, skipping tests and decls. */
function collect(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collect(full));
      continue;
    }
    const name = basename(full);
    if (!/\.(ts|tsx)$/.test(name)) continue;
    if (name.endsWith(".d.ts")) continue;
    if (/\.(test|spec)\.(ts|tsx)$/.test(name)) continue;
    out.push(full);
  }
  return out;
}

/** Strip line/block comments so attributions/URLs in comments are not flagged. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
}

/** @type {{file:string,line:number,literal:string}[]} */
const violations = [];

for (const file of collect(SRC)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (ALLOWLISTED_FILES.has(rel)) continue;

  const code = stripComments(readFileSync(file, "utf8"));
  const lines = code.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const re of [HEX, COLOR_FN, NAMED]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        violations.push({ file: rel, line: i + 1, literal: m[0] });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(
    `\n✖ Non-token color validation failed: ${violations.length} hard-coded color literal(s) found in TS/TSX.\n` +
      `  Consume the design tokens via colorVar(...) / var(--color-*) (design-system/tokens).\n` +
      `  The seven locked values may only be defined in design-system/tokens/tokens.ts.\n`
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ->  ${v.literal}`);
  }
  process.exit(1);
}

console.log("✔ Non-token color validation (TS/TSX): no hard-coded color literals found.");
