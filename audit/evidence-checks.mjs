/**
 * Evidence checks [13]-[15]: whether a `required` claim is backed by something a
 * reader confirmed, and whether the data has the shape the law describes.
 *
 *   [13] a required field carries no `regulationRef.verification` (the quoted
 *        operative sentence). Fields not yet verified are listed in
 *        unverified-required.json, which may only shrink.
 *   [14] a required field cites a safety-data-sheet or label provision. Those
 *        duties land on a document or a physical label, and are conditional on
 *        classification, so they rarely make passport data mandatory. A reviewed
 *        exception goes in known-carriers.json with the reason.
 *   [15] a list field sits beside single-value fields named after its parts
 *        (`ingredients` with `ingredientCasNumber`): one ingredient's values in
 *        scalars cannot represent the list the law asks for.
 *
 * Found by reading the Detergents Regulation: 11 of 18 required detergent fields and
 * all 15 paint fields cited an SDS section or a CLP label article, and the substance
 * list was modelled twice, as a list and as scalar copies.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const loadJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf-8")) : fallback);

const CARRIER = /\bSDS\b|safety data sheet|\blabel\b|\blabelling\b/i;

export function checkVerification(templates, baseline) {
  const listed = new Set(baseline.fields ?? []);
  const findings = [];
  const seen = new Set();
  for (const [, d] of templates)
    for (const f of d.fields) {
      const id = `${d.category}.${f.key}`;
      const required = !!(f.validation ?? {}).required;
      const verified = !!(f.regulationRef ?? {}).verification;
      if (required && !verified) {
        seen.add(id);
        if (!listed.has(id)) findings.push({ id, why: "required, no verification quote" });
      }
    }
  for (const id of listed)
    if (!seen.has(id))
      findings.push({ id, why: "listed in unverified-required.json but verified, optional or gone; remove the entry" });
  return findings;
}

export function checkCarrier(templates, known) {
  const allowed = new Set((known.fields ?? []).map((e) => e.id));
  const findings = [];
  for (const [, d] of templates)
    for (const f of d.fields) {
      if (!(f.validation ?? {}).required) continue;
      const r = f.regulationRef ?? {};
      const text = `${r.provision ?? ""} ${r.article ?? ""}`;
      const id = `${d.category}.${f.key}`;
      if (CARRIER.test(text) && !allowed.has(id)) findings.push({ id, cites: text.trim() });
    }
  return findings;
}

export function checkListScalar(templates, knownDistinct) {
  const allowed = new Set((knownDistinct.pairs ?? []).map((p) => `${p.category}:${[p.a, p.b].sort().join("|")}`));
  const findings = [];
  for (const [, d] of templates) {
    const keys = d.fields.map((f) => f.key);
    for (const f of d.fields) {
      if (f.dataType !== "array" || !f.key.endsWith("s") || f.key.length <= 4) continue;
      const stem = f.key.slice(0, -1);
      for (const k of keys) {
        if (k === f.key || !k.startsWith(stem) || k.length <= stem.length) continue;
        if (!/[A-Z]/.test(k[stem.length])) continue;
        if (allowed.has(`${d.category}:${[f.key, k].sort().join("|")}`)) continue;
        findings.push({ cat: d.category, list: f.key, scalar: k });
      }
    }
  }
  return findings;
}

export function runEvidenceChecks(templates) {
  return {
    unverified: checkVerification(templates, loadJson(join(here, "unverified-required.json"), {})),
    carrier: checkCarrier(templates, loadJson(join(here, "known-carriers.json"), {})),
    listScalar: checkListScalar(templates, loadJson(join(here, "known-distinct.json"), {})),
  };
}
