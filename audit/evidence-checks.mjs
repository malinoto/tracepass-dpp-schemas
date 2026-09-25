/**
 * Evidence checks [13]-[15]: whether a `required` claim is backed by something a
 * reader confirmed, and whether the data has the shape the law describes.
 *
 *   [13] a required field has no `regulationRef.obligations` entry putting it in a
 *        passport for every product (carrier "passport", no condition). Fields not
 *        yet verified are listed in unverified-required.json, which may only shrink.
 *   [16] the reverse: an optional field records such an obligation (under-requiring).
 *   [14] a required field cites a safety-data-sheet or label provision. Those
 *        duties land on a document or a physical label, and are conditional on
 *        classification, so they rarely make passport data mandatory. A reviewed
 *        exception goes in known-carriers.json with the reason.
 *   [15] a list field sits beside single-value fields named after its parts
 *        (`ingredients` with `ingredientCasNumber`): one ingredient's values in
 *        scalars cannot represent the list the law asks for.
 *   [17] an obligation's `quote` does not occur in the text of its instrument.
 *        The acts are stored in audit/acts/<CELEX>.txt (fetched with the
 *        fetch-eur-lex skill); a corrigendum cited in `provision` ("as corrected
 *        by 32023R1542R(13)") is searched too. A quote may elide with "…": each
 *        piece must occur. Without this, a quote is only as good as the typing.
 *
 * Found by reading the Detergents Regulation: 11 of 18 required detergent fields and
 * all 15 paint fields cited an SDS section or a CLP label article, and the substance
 * list was modelled twice, as a list and as scalar copies.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const loadJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf-8")) : fallback);

const CARRIER = /\bSDS\b|safety data sheet|\blabel\b|\blabelling\b/i;

/** An obligation that makes the field passport-mandatory for every product. */
const bindsPassport = (o) => o?.carrier === "passport" && !o.condition;

export function checkVerification(templates, baseline) {
  const listed = new Set(baseline.fields ?? []);
  const findings = [];
  const seen = new Set();
  for (const [, d] of templates)
    for (const f of d.fields) {
      const id = `${d.category}.${f.key}`;
      const required = !!(f.validation ?? {}).required;
      const obligations = (f.regulationRef ?? {}).obligations ?? [];
      const passport = obligations.some(bindsPassport);
      if (required && !passport) {
        if (obligations.length) {
          findings.push({ id, why: "required, but no obligation puts it in a passport for every product" });
        } else {
          seen.add(id);
          if (!listed.has(id)) findings.push({ id, why: "required, no verified obligation" });
        }
      }
      // [16] the other direction: a verified, unconditional passport duty on an optional field.
      if (!required && passport)
        findings.push({ id, why: "[16] an unconditional passport obligation is recorded, but the field is optional" });
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

/** Collapse the differences between EUR-Lex text and a typed quote that are not wording. */
const normalise = (t) =>
  t
    .replace(/[\u2018\u2019\u201a\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function checkQuotes(templates, actsDir = join(here, "acts")) {
  const cache = new Map();
  const act = (celex) => {
    if (!cache.has(celex)) {
      const p = join(actsDir, `${celex}.txt`);
      cache.set(celex, existsSync(p) ? normalise(readFileSync(p, "utf-8")) : null);
    }
    return cache.get(celex);
  };
  const findings = [];
  for (const [, d] of templates)
    for (const f of d.fields)
      for (const o of (f.regulationRef ?? {}).obligations ?? []) {
        const id = `${d.category}.${f.key}`;
        const corrections = (o.provision ?? "").match(/\b3\d{4}[A-Z]\d{4}R\(\d+\)/g) ?? [];
        const texts = [o.instrument, ...corrections].map((c) => [c, act(c)]);
        const missing = texts.filter(([, t]) => t === null).map(([c]) => c);
        if (missing.length) {
          findings.push({ id, why: `no stored text for ${missing.join(", ")} in audit/acts/` });
          continue;
        }
        const pieces = normalise(o.quote ?? "").split(/\s*(?:…|\.\.\.)\s*/).filter((x) => x.length);
        const absent = pieces.filter((q) => !texts.some(([, t]) => t.includes(q)));
        if (absent.length)
          findings.push({ id, why: `quote not in ${o.instrument} ${o.provision}: "${absent[0].slice(0, 60)}"` });
      }
  // A stored act nothing cites is dead weight in the repo.
  if (existsSync(actsDir)) {
    const cited = new Set([...cache.keys()]);
    for (const f of readdirSync(actsDir).filter((x) => x.endsWith(".txt")))
      if (!cited.has(f.slice(0, -4))) findings.push({ id: `audit/acts/${f}`, why: "no obligation quotes this act; delete it" });
  }
  return findings;
}

export function runEvidenceChecks(templates) {
  return {
    unverified: checkVerification(templates, loadJson(join(here, "unverified-required.json"), {})),
    carrier: checkCarrier(templates, loadJson(join(here, "known-carriers.json"), {})),
    listScalar: checkListScalar(templates, loadJson(join(here, "known-distinct.json"), {})),
    quotes: checkQuotes(templates),
  };
}
