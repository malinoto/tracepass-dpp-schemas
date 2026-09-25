/**
 * Content checks: the citation audit's checks [1]-[8] test the FORM of a citation
 * (CELEX vs article text, required-under-a-framework, phantom sub-points, kind).
 * None opens the cited act, so "PPWR Art. 10, 40%", "Art. 11" of an act with ten
 * articles and 42 fields citing ESPR's declaration-of-conformity annex all passed.
 * These three catch what can be caught mechanically:
 *
 *   [9]  a cited article or annex that does not exist in the act
 *        (provision-index.json, built by build-provision-index.mjs)
 *   [10] probable duplicate fields within one template
 *   [11] one key with different units in different templates
 *
 * What stays human: whether a figure or scale matches the law, and whether the
 * right provision is cited. [9] only proves the provision exists.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function loadJson(p, fallback) {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf-8")) : fallback;
}

// ── [9] provision existence ───────────────────────────────────────────────
// Parses the machine-facing `provision` (falling back to `article`) for article
// numbers and annex numerals. Parenthesised text is dropped first: it usually
// names ANOTHER act ("Art. 94 (Reg. (EU) 305/2011 Arts. 4-9 continue…)"), and
// checking its numbers against the cited act would be wrong both ways.
export function citedProvisions(text) {
  let t = String(text ?? "");
  for (let i = 0; i < 3; i++) t = t.replace(/\([^()]*\)/g, " ");
  const articles = new Set();
  for (const m of t.matchAll(/\b(?:Arts?\.|Articles?)\s*((?:\d+[a-z]?(?:\s*(?:,|and|-|–|to)\s*)?)+)/gi)) {
    const nums = m[1].match(/\d+[a-z]?/g) ?? [];
    const range = /\d+\s*[-–]\s*\d+/.test(m[1]) || /\bto\b/i.test(m[1]);
    if (range && nums.length === 2 && +nums[1] - +nums[0] < 50) {
      for (let n = +nums[0]; n <= +nums[1]; n++) articles.add(String(n));
    } else nums.forEach((n) => articles.add(n));
  }
  const annexes = new Set();
  for (const m of t.matchAll(/\bAnnex(?:es)?\s+([IVXLC]+)\b/g)) annexes.add(m[1]);
  return { articles: [...articles], annexes: [...annexes] };
}

export function checkProvisionExistence(templates, index, registry = {}) {
  const out = [];
  let unindexed = new Set();
  const amended = [];
  for (const [, d] of templates) {
    for (const f of d.fields) {
      const rr = f.regulationRef ?? {};
      const celex = rr.instrument;
      if (!celex || !/^3\d{4}[RLD]\d{4}$/.test(celex)) continue;
      const act = index[celex];
      // Only legislation is indexed; a registered voluntary scheme (the EU
      // Ecolabel) or a standard is not an act with articles to check.
      if (!act) { if ((registry[celex]?.kind ?? "legislation") === "legislation") unindexed.add(celex); continue; }
      const { articles, annexes } = citedProvisions(rr.provision || rr.article);
      // The index is built from the act as adopted. Amendments insert articles
      // with a letter ("Article 8a", inserted into the Waste Framework Directive
      // in 2018), so a missing LETTERED article is a note to check the
      // consolidated text, not a finding.
      const missing = articles.filter((a) => !act.articles.includes(a));
      const badArt = missing.filter((a) => !/[a-z]$/.test(a));
      for (const a of missing.filter((a) => /[a-z]$/.test(a))) amended.push(`${d.category}.${f.key} → ${celex} Art. ${a}`);
      const badAnx = annexes.filter((x) => act.annexes.length && !act.annexes.includes(x));
      if (badArt.length || badAnx.length) {
        out.push({ cat: d.category, key: f.key, celex, missing: [...badArt.map((a) => `Art. ${a}`), ...badAnx.map((x) => `Annex ${x}`)],
                   has: `${act.articles.length} articles, annexes ${act.annexes.join(",") || "none"}` });
      }
    }
  }
  return { findings: out, unindexed: [...unindexed].sort(), amended };
}

// ── [10] probable duplicates within a template ────────────────────────────
// Three shapes, all on fields sharing dataType and unit (both unit-less counts):
//   same words  the keys are the same once filler is dropped
//               (tyreWeightKg / totalTyreWeightKg)
//   subset      one key's words all appear in the other, plus any number of
//               qualifiers (annualEnergyConsumption / refrigeratorAnnualEnergyConsumption,
//               vocContent / vocContentReadyToUse)
//   swapped     one word differs on each side and the descriptions are nearly the
//               same once that word is masked (osUpdateSupportYears /
//               securityUpdateSupportYears)
// The swapped shape is also how legitimate siblings look (recycledNickel /
// recycledCobalt), so similarity alone cannot tell them apart. Word pairs that
// are real contrasts are declared once in known-distinct.json `contrasts`, and a
// swapped pair passes only when its two words are in one declared group. Any
// other flagged pair must be merged, or listed in `pairs` with the reason.
const STOP = new Set(["the", "of", "a", "an", "in", "for", "per", "and", "or", "to", "total", "value", "kg", "g", "percentage", "percent", "pct", "rate", "mm", "kpa", "w", "l", "years", "year"]);
const words = (s) => String(s ?? "")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase()
  .split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const x of A) if (B.has(x)) i++;
  return i / (A.size + B.size - i);
};
export const SWAP_SIMILARITY = 0.8;

export function duplicateShape(a, b, contrasts = []) {
  const ka = new Set(words(a.key)), kb = new Set(words(b.key));
  if (!ka.size || !kb.size) return null;
  const onlyA = [...ka].filter((w) => !kb.has(w)), onlyB = [...kb].filter((w) => !ka.has(w));
  if (!onlyA.length && !onlyB.length) return "same words";
  if (!onlyA.length || !onlyB.length) return `subset: +${(onlyA.length ? onlyA : onlyB).join(" ")}`;
  if (onlyA.length !== 1 || onlyB.length !== 1 || onlyA.length + onlyB.length >= ka.size + kb.size) return null;
  const [x, y] = [onlyA[0], onlyB[0]];
  if (contrasts.some((g) => g.includes(x) && g.includes(y))) return null;
  const da = words(a.description?.en).filter((w) => w !== x);
  const db = words(b.description?.en).filter((w) => w !== y);
  const sim = jaccard(da, db);
  return sim >= SWAP_SIMILARITY ? `swapped: ${x}/${y}, descriptions ${sim.toFixed(2)} alike` : null;
}

export function checkDuplicates(templates, knownDistinct) {
  const allowed = new Set((knownDistinct.pairs ?? []).map((p) => `${p.category}:${[p.a, p.b].sort().join("|")}`));
  const contrasts = (knownDistinct.contrasts ?? []).map((c) => c.words);
  const out = [];
  for (const [, d] of templates) {
    const fs = d.fields;
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j];
      if (a.dataType !== b.dataType || (a.unit ?? null) !== (b.unit ?? null)) continue;
      const shape = duplicateShape(a, b, contrasts);
      if (!shape) continue;
      if (allowed.has(`${d.category}:${[a.key, b.key].sort().join("|")}`)) continue;
      out.push({ cat: d.category, a: a.key, b: b.key, unit: a.unit ?? "no unit", shape });
    }
  }
  return out;
}

// ── [11] one key, different units across templates ────────────────────────
// A key is a vocabulary term: the VC profile maps it to one IRI across every
// category, so "ratedCapacity" in kg in one template and Ah in another is one
// predicate with two meanings.
export function checkCrossTemplateUnits(templates) {
  const byKey = new Map();
  for (const [, d] of templates) for (const f of d.fields) {
    if (!f.unit) continue;
    if (!byKey.has(f.key)) byKey.set(f.key, new Map());
    const m = byKey.get(f.key);
    m.set(f.unit, [...(m.get(f.unit) ?? []), d.category]);
  }
  const out = [];
  for (const [key, m] of byKey) if (m.size > 1) out.push({ key, units: [...m].map(([u, cats]) => `${u} (${cats.join(", ")})`) });
  return out;
}

export function runContentChecks(templates, registry = {}) {
  const index = loadJson(join(here, "provision-index.json"), {});
  const known = loadJson(join(here, "known-distinct.json"), { pairs: [] });
  const prov = checkProvisionExistence(templates, index, registry);
  return {
    missingProvision: prov.findings,
    unindexed: prov.unindexed,
    amended: prov.amended,
    duplicates: checkDuplicates(templates, known),
    unitClash: checkCrossTemplateUnits(templates),
  };
}
