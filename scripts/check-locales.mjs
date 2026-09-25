#!/usr/bin/env node
/**
 * Locale completeness gate for templates/*.json.
 *
 * schema.json's localizedString requires only `en`, so a field shipped with English
 * help text alone validates. That is how most field descriptions came to lack
 * Bulgarian and German. This closes it in two tiers:
 *
 *   hard     every label and categoryLabel carries all 24 EU languages; every
 *            description, placeholder and enum-option label carries at least
 *            en/bg/de/it (the languages the TracePass site and viewer are
 *            reviewed in), and no string is empty.
 *   ratchet  a description or enum label below 24 languages must be listed in
 *            scripts/locale-gaps.json with exactly the languages it lacks. A new
 *            gap, or a wider one, fails. So does a listed gap that has been
 *            closed, so the baseline only ever shrinks: run with --update to
 *            rewrite it after translating.
 *
 *   node scripts/check-locales.mjs            # gate (npm run check:locales)
 *   node scripts/check-locales.mjs --update   # rewrite the baseline to the current gaps
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(REPO, "templates");
const BASELINE = join(REPO, "scripts", "locale-gaps.json");

const schema = JSON.parse(readFileSync(join(REPO, "schema.json"), "utf-8"));
const ALL = schema.$defs.localizedString.propertyNames.enum;
const REVIEWED = ["en", "bg", "de", "it"];

const problems = [];
const gaps = {};
let strings = 0;

function inspect(where, value, required) {
  if (value == null) return;
  strings++;
  for (const [lang, text] of Object.entries(value))
    if (typeof text !== "string" || !text.trim()) problems.push(`${where}: empty "${lang}" string`);
  const missing = ALL.filter((l) => !(l in value));
  const hardMissing = required.filter((l) => !(l in value));
  if (hardMissing.length) problems.push(`${where}: missing ${hardMissing.join(", ")}`);
  else if (missing.length) gaps[where] = missing;
}

for (const file of readdirSync(TEMPLATES).filter((f) => f.endsWith(".json")).sort()) {
  const t = JSON.parse(readFileSync(join(TEMPLATES, file), "utf-8"));
  if (!Array.isArray(t.fields) || !t.category) continue;
  for (const f of t.fields) {
    const at = `${t.category}.${f.key}`;
    inspect(`${at} label`, f.label, ALL);
    inspect(`${at} categoryLabel`, f.categoryLabel, ALL);
    inspect(`${at} description`, f.description, REVIEWED);
    inspect(`${at} placeholder`, f.placeholder, REVIEWED);
    for (const e of f.enumOptions ?? [])
      if (e && typeof e === "object") inspect(`${at} enum ${e.value}`, e.label, REVIEWED);
  }
}

if (process.argv.includes("--update")) {
  writeFileSync(BASELINE, JSON.stringify(gaps, null, 2) + "\n");
  console.log(`locale-gaps.json rewritten: ${Object.keys(gaps).length} partial string(s).`);
} else {
  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf-8")) : {};
  for (const [where, missing] of Object.entries(gaps)) {
    const allowed = new Set(baseline[where] ?? []);
    const extra = missing.filter((l) => !allowed.has(l));
    if (extra.length) problems.push(`${where}: missing ${extra.join(", ")} (not in locale-gaps.json)`);
  }
  for (const [where, allowed] of Object.entries(baseline)) {
    const now = new Set(gaps[where] ?? []);
    const closed = allowed.filter((l) => !now.has(l));
    if (closed.length)
      problems.push(`${where}: ${closed.join(", ")} now present; run --update to shrink locale-gaps.json`);
  }
}

console.log(
  `Locale check: ${strings} localized strings; ${Object.keys(gaps).length} below 24 languages (baselined).`,
);
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("✓ labels carry 24 languages; descriptions and options carry en/bg/de/it; no new gaps");
