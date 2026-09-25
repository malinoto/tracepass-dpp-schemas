#!/usr/bin/env node
/**
 * Locale completeness gate for templates/*.json.
 *
 * schema.json's localizedString requires only `en`, so a field shipped with English
 * help text alone validates. That is how most field descriptions once came to lack
 * Bulgarian and German. This gate requires every label, category label,
 * description, placeholder and enum-option label to carry all 24 official EU
 * languages, none of them empty.
 *
 *   node scripts/check-locales.mjs      # npm run check:locales
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(REPO, "templates");
const schema = JSON.parse(readFileSync(join(REPO, "schema.json"), "utf-8"));
const ALL = schema.$defs.localizedString.propertyNames.enum;

const problems = [];
let strings = 0;

function inspect(where, value) {
  if (value == null) return;
  strings++;
  for (const [lang, text] of Object.entries(value))
    if (typeof text !== "string" || !text.trim()) problems.push(`${where}: empty "${lang}" string`);
  const missing = ALL.filter((l) => !(l in value));
  if (missing.length) problems.push(`${where}: missing ${missing.join(", ")}`);
}

for (const file of readdirSync(TEMPLATES).filter((f) => f.endsWith(".json")).sort()) {
  const t = JSON.parse(readFileSync(join(TEMPLATES, file), "utf-8"));
  if (!Array.isArray(t.fields) || !t.category) continue;
  for (const f of t.fields) {
    const at = `${t.category}.${f.key}`;
    inspect(`${at} label`, f.label);
    inspect(`${at} categoryLabel`, f.categoryLabel);
    inspect(`${at} description`, f.description);
    inspect(`${at} placeholder`, f.placeholder);
    for (const e of f.enumOptions ?? [])
      if (e && typeof e === "object") inspect(`${at} enum ${e.value}`, e.label);
  }
}

console.log(`Locale check: ${strings} localized strings across ${ALL.length} languages.`);
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("✓ every localized string carries all 24 EU languages");
