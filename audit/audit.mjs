#!/usr/bin/env node
/**
 * Audit every category template for citation defects that schema validation
 * cannot see. Read-only: prints findings, changes nothing, exits 1 on any finding.
 *
 *   node audit/audit.mjs                # this repo's templates/ (npm run check:audit)
 *   node audit/audit.mjs --platform     # a second template copy (see DIRS below)
 *   node audit/audit.mjs --both         # both, plus the drift between them
 *
 * What each check means and why it exists: audit/README.md.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runContentChecks } from "./content-checks.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const which = process.argv.includes("--platform") ? "platform" : "schemas";
const both = process.argv.includes("--both");

// Paths are overridable so this runs against any template corpus. `platform` is a
// second copy of the templates kept by a downstream consumer; by default it is
// looked for in a sibling checkout and is only read for --platform / --both.
const DIRS = {
  platform: process.env.DPP_TEMPLATES_PRIMARY ?? join(REPO, "..", "tracepass-platform", "templates"),
  schemas: process.env.DPP_TEMPLATES_PUBLIC ?? join(REPO, "templates"),
};
const INSTRUMENTS = process.env.DPP_INSTRUMENTS ?? join(REPO, "instruments.json");
for (const d of both ? Object.values(DIRS) : [DIRS[which]])
  if (!existsSync(d)) {
    console.error(`audit: template directory not found: ${d}`);
    process.exit(2);
  }

const instruments = JSON.parse(
  readFileSync(INSTRUMENTS, "utf-8"),
).instruments;

/**
 * Instruments that mandate NO DATA FIELD.
 *
 * NOT the same as `createsDpp !== true` — that was the first cut of this check
 * and it produced 98 false positives. REACH and CLP create no *passport*, so
 * they are `createsDpp: false`, but they absolutely create field-level
 * obligations (SDS content, hazard classification, the UFI). A field marked
 * required under REACH is correct.
 *
 * The real defect is narrower: a FRAMEWORK that defers everything to a
 * delegated act which does not exist. ESPR is the case — Art. 4 empowers, and
 * Art. 9(2) lists what a delegated act must specify, not product data (both
 * verified against primary text). CPR is `createsDpp: "deferred"` for the same
 * shape of reason.
 */
const MANDATES_NO_FIELD = new Set(
  Object.entries(instruments)
    .filter(([, v]) => v.createsDpp === "framework-only" || v.createsDpp === "deferred")
    .map(([celex]) => celex),
);

function loadTemplates(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [basename(f, ".json"), JSON.parse(readFileSync(join(dir, f), "utf-8"))])
    .filter(([, d]) => Array.isArray(d.fields) && d.category);
}

function audit(dir, label) {
  const templates = loadTemplates(dir);
  const findings = { overRequired: [], mismatch: [], noInstrument: [], phantom: [], wrongAnnex: [], staleCount: [], unreasoned: [], kindMismatch: [] };

  for (const [, d] of templates) {
    for (const f of d.fields) {
      const rr = f.regulationRef ?? {};
      const v = f.validation ?? {};
      const art = String(rr.article ?? "");
      const inst = rr.instrument;

      // 1. OVER-REQUIRING. `required` gates publishing, so a field marked
      //    required under a framework-only instrument tells a customer the law
      //    demands something it does not. ESPR is the usual culprit: Art. 9(2)
      //    lists what a DELEGATED ACT must specify, not product data.
      // Two legitimate exceptions, both verified against primary text:
      //   * ESPR Art. 10 / 11 DO govern the passport itself — availability,
      //     retention, access rights. A platform-mechanics field citing them is
      //     correct; it is product-DATA fields citing Art. 9(2) that are wrong.
      //   * CPR is `deferred` for the PASSPORT only. Its CE-marking articles
      //     (Arts. 8-9) are in force, so a CE field required under CPR is fine.
      // ESPR Art. 10/11 govern the passport itself, so a platform-mechanics
      // field citing them is correct — BUT ONLY WHERE A PASSPORT IS REQUIRED AT
      // ALL. Art. 10's requirements attach where Art. 9(1) mandates a passport,
      // i.e. once the category's Art. 4 delegated act applies. A category whose
      // own instrument creates no passport (packaging → PPWR, createsDpp:false)
      // cannot inherit a passport-essential-requirement from ESPR, so the
      // exemption must not apply there. Without this condition the check
      // reported the corpus clean while two packaging fields were `required`
      // under an obligation that cannot bind them.
      const catInstrument = String(d.regulation?.number ?? d.regulation?.celex ?? "");
      const categoryHasPassportDuty =
        /2023\/1542|2026\/405|2025\/2509/.test(catInstrument) ||
        ["battery", "detergents", "toys"].includes(String(d.category ?? ""));
      const govPassport =
        inst === "32024R1781" &&
        /^Art(icle)?\.? ?1[01]\b/.test(String(rr.provision ?? "")) &&
        categoryHasPassportDuty;
      // CPR is `deferred` for the PASSPORT only; its CE-marking articles are in
      // force, so a CE field required under CPR can be correct. But "in force" is
      // not "unconditional", and this exemption was originally written as merely
      // `/Art/i.test(provision)` — which waved through EVERY CPR-cited field that
      // named any article, including ones the obligation cannot bind.
      //
      // CPR CE marking applies IF AND ONLY IF the product is covered by a
      // harmonised technical specification (hEN whose applicability period has
      // started) or an ETA. A construction product with neither cannot be
      // CE-marked at all — no DoP duty, no basis to affix the mark. Harmonised
      // coverage is incomplete, so this is a common state, not an edge case.
      // Steel is the sub-case: structural steelwork under EN 1090-1 is covered;
      // mill products and much rebar are not. Never model steel as always-CE.
      //
      // So a CPR CE field may only be `required` where the citation itself
      // records the condition. `construction` does exactly that and is correct;
      // a bare `Arts. 8-9` does not, and forcing a value there asks for data on
      // a product that legitimately has none — which is why such fields carry a
      // `not_applicable` enum member in the first place.
      const statesTheCondition =
        /harmonised technical specification|harmonised standard|European Technical Assessment|\bETA\b|\bhEN\b|only where/i.test(
          `${rr.provision ?? ""} ${art}`,
        );
      const cprInForce =
        inst === "32024R3110" && /Art/i.test(String(rr.provision ?? "")) && statesTheCondition;
      if (v.required && inst && MANDATES_NO_FIELD.has(inst) && !govPassport && !cprInForce) {
        const alsoNamesReal = /REACH|CLP|GPSR|CBAM|952\/2013|Customs|Toy Safety|Detergents|PPWR|CPR/i.test(art);
        findings.overRequired.push({
          cat: d.category, key: f.key, inst,
          name: instruments[inst]?.shortName ?? inst,
          art: art.slice(0, 60),
          verdict: alsoNamesReal ? "headline wrong (real instrument named too)" : "NO real instrument cited",
        });
      }

      // 2. LAYER MISMATCH. The free-text article and the structured CELEX are
      //    consumed differently — the CELEX drives tooling, the article string
      //    is what a compliance report prints — so they can disagree in
      //    customer-facing output.
      if (art && inst) {
        // Keep this map wide: a citation that names two instruments is a
        // multi-source field, not a contradiction, and the `named.length === 1`
        // guard below only works if BOTH are recognisable. With a narrow map,
        // "CLP (EC) 1272/2008; (EU) 2023/988" looked like a single-source
        // mismatch because the numeric form of GPSR was invisible.
        const names = {
          "32024R1781": /\bESPR\b|2024\/1781/i, "32006R1907": /REACH|1907\/2006/i,
          "32008R1272": /\bCLP\b|1272\/2008/i,  "32023R0988": /GPSR|2023\/988/i,
          "32025R0040": /PPWR|2025\/40\b/i,      "32023R0956": /CBAM|2023\/956/i,
          "32026R0405": /Detergents|2026\/405/i,  "32020R0740": /2020\/740/i,
          "32019R1021": /POPs|2019\/1021/i,       "32023R1464": /2023\/1464/i,
        };
        // A citation legitimately names SEVERAL instruments ("Reg 2023/1464
        // (REACH Entry 77); EN 717-1"), with the CELEX picking the primary one.
        // Only flag when the article names another instrument AND does not name
        // its own — and never when it names two or more, which is the
        // multi-source case, not a contradiction.
        const named = Object.entries(names).filter(([, re]) => re.test(art));
        const claimed = named[0];
        const namesOwn = new RegExp(names[inst]?.source ?? "$^", "i").test(art)
          || new RegExp(String(instruments[inst]?.shortName ?? "$^").split(" ")[0], "i").test(art);
        if (claimed && claimed[0] !== inst && !namesOwn && named.length === 1) {
          findings.mismatch.push({
            cat: d.category, key: f.key,
            says: instruments[claimed[0]]?.shortName ?? claimed[0],
            is: instruments[inst]?.shortName ?? inst,
            art: art.slice(0, 50),
          });
        }
      }

      // 3. NO INSTRUMENT. A bare article with no CELEX silently inherits the
      //    template-level regulation.number — which is how whole categories end
      //    up misattributed.
      //
      //    Only for kind "legislation". EN/ISO standards (EN 10204, EN 71),
      //    certification schemes and specifications legitimately have no CELEX
      //    because they are not EU legal acts, and the template already models
      //    that with `kind`. Ignoring it flagged 10 correct steel/toys fields.
      if (art && !inst && v.required && (rr.kind ?? "legislation") === "legislation") {
        findings.noInstrument.push({ cat: d.category, key: f.key, art: art.slice(0, 55) });
      }

      // 4. PHANTOM SUB-POINTS. ESPR Art. 7(2) has exactly (a)(b)(c).
      if (/7\(2\)\([d-z]\)/.test(art)) {
        findings.phantom.push({ cat: d.category, key: f.key, art: art.slice(0, 55) });
      }

      // 7. OPTIONAL, ASSERTS LAW, NO REASONING. `kind: "legislation"` claims an
      //    instrument backs the field. On a REQUIRED field checks 1-3 interrogate
      //    that claim; on an OPTIONAL one nothing did, so a citation naming a
      //    framework that mandates nothing sat unexamined and invisible. 515 such
      //    fields existed across ten templates when this check was added.
      //
      //    Nothing is necessarily WRONG here — an optional field misleads no
      //    customer, and the honest answer is usually "anticipated under a
      //    delegated act that is not adopted". The defect is the missing
      //    JUDGEMENT: without `regulationRef.description` no reader can tell
      //    whether the citation was checked or merely copied. `description` is
      //    also what the viewer prints in the voluntary-pill tooltip, so writing
      //    it is customer-visible work, not bookkeeping.
      //
      //    Resolve per field against primary text — never bulk-write a note.
      if (!v.required && rr.kind === "legislation" && !rr.description) {
        findings.unreasoned.push({
          cat: d.category, key: f.key,
          inst: inst ?? "(none)",
          prov: String(rr.provision ?? art).slice(0, 40),
        });
      }

      // 5. WRONG ANNEX FOR THE INSTRUMENT. An annex number can be right while
      //    attached to the wrong act — 38 electronics fields cited ESPR
      //    "Annex II"/"Annex III" when they meant Reg (EU) 2019/424 Annex II,
      //    RoHS Annex II/III and WEEE Annex III. Under ESPR, Annex I is the
      //    product parameters, Annex II is the Commission's PROCEDURE for
      //    defining performance requirements, and Annex III is the passport —
      //    so no ESPR annex except I is ever a source of product data.
      const prov = String(rr.provision ?? "");
      if (inst === "32024R1781" && /^Annex (II|III)\b/.test(prov)) {
        findings.wrongAnnex.push({
          cat: d.category, key: f.key, prov: prov.slice(0, 30),
          // /^Annex II\b/ so "Annex III" does not match the Annex II branch —
          // a plain startsWith("Annex II") would classify every Annex III field
          // as Annex II.
          why: /^Annex II\b/.test(prov)
            ? "ESPR Annex II = procedure for DEFINING requirements, not a data source"
            : "ESPR Annex III = the digital product passport, not a data source",
        });
      }
    }
  }

  // 6. STALE DERIVED COUNTS. fieldCount and requiredFieldCount are stored
  //    literals that nothing recomputes — not the seed, not any test. A sync
  //    that fixes `required` flags without recomputing leaves the summary
  //    lying, and seed-templates.ts copies the lie straight into MongoDB.
  //    Found exactly that way: 6 templates claimed 43/20/27/12/12/43 required
  //    while carrying 4/4/4/3/5/2.
  for (const [, d] of templates) {
    const actualReq = d.fields.filter((f) => (f.validation ?? {}).required).length;
    if (d.requiredFieldCount !== actualReq || d.fieldCount !== d.fields.length) {
      findings.staleCount.push({
        cat: d.category,
        req: `${d.requiredFieldCount} vs ${actualReq}`,
        fields: `${d.fieldCount} vs ${d.fields.length}`,
      });
    }
  }

  // [8] The field's `kind` contradicts what instruments.json says the instrument IS.
  //
  // `kind` is the discriminator the required-rule turns on: only `legislation` can
  // make a field required; `standard`, `scheme`, `specification`, `international` and
  // `national` cannot. So a voluntary scheme carrying `kind: "legislation"` is a
  // latent over-require — check [1] keys on the INSTRUMENT being framework-deferral
  // and never looks at `kind`, so it passes such a field even when it is required.
  //
  // Found exactly that way: all 7 EU Ecolabel fields (Reg (EC) 66/2010, registered
  // `kind: "scheme"` — awarding the label is regulated, carrying one is required of
  // nobody) claimed `kind: "legislation"`, several with a description that already
  // said "VOLUNTARY scheme" in the line below. None was required, so nothing was
  // mis-served yet; the defect was one edit away from mattering.
  //
  // The registry is the authority on what an instrument is. A disagreement is a
  // finding either way: fix the field, or — if the registry entry is the wrong one —
  // fix that, but do not leave them contradicting.
  for (const [, d] of templates) {
    for (const f of d.fields) {
      const rr = f.regulationRef ?? {};
      const reg = instruments[rr.instrument];
      if (rr.instrument && rr.kind && reg?.kind && reg.kind !== rr.kind) {
        findings.kindMismatch.push({
          cat: d.category,
          key: f.key,
          inst: rr.instrument,
          registry: reg.kind,
          field: rr.kind,
          required: !!(f.validation ?? {}).required,
        });
      }
    }
  }

  // [9]-[11]: content checks (content-checks.mjs). [1]-[8] test a citation's
  // form; these test whether the cited provision exists, whether two fields hold
  // one datum, and whether one key means two units.
  const content = runContentChecks(templates, instruments);
  findings.missingProvision = content.missingProvision;
  findings.duplicates = content.duplicates;
  findings.unitClash = content.unitClash;

  const n = Object.values(findings).reduce((s, a) => s + a.length, 0);
  console.log(`\n=== ${label} (${templates.length} templates) — ${n} finding(s) ===`);

  if (findings.overRequired.length) {
    console.log(`\n[1] REQUIRED but the cited instrument mandates nothing (${findings.overRequired.length})`);
    for (const f of findings.overRequired)
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.name.slice(0, 16).padEnd(18)} ${f.verdict}`);
  }
  if (findings.mismatch.length) {
    console.log(`\n[2] article names one instrument, CELEX says another (${findings.mismatch.length})`);
    for (const f of findings.mismatch)
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} says ${f.says} / is ${f.is}`);
  }
  if (findings.noInstrument.length) {
    console.log(`\n[3] required, article but NO instrument — inherits template default (${findings.noInstrument.length})`);
    for (const f of findings.noInstrument.slice(0, 15))
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.art}`);
    if (findings.noInstrument.length > 15) console.log(`    … ${findings.noInstrument.length - 15} more`);
  }
  if (findings.phantom.length) {
    console.log(`\n[4] cites ESPR Art. 7(2)(d)/(e) — sub-points that do not exist (${findings.phantom.length})`);
    for (const f of findings.phantom.slice(0, 10))
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.art}`);
  }
  if (findings.wrongAnnex.length) {
    console.log(`\n[5] cites an ESPR annex that is not a data source (${findings.wrongAnnex.length})`);
    for (const f of findings.wrongAnnex.slice(0, 12))
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.prov.padEnd(22)} ${f.why}`);
    if (findings.wrongAnnex.length > 12) console.log(`    … ${findings.wrongAnnex.length - 12} more`);
  }
  if (findings.unreasoned.length) {
    console.log(`\n[7] optional but asserts law, with no recorded reasoning (${findings.unreasoned.length})`);
    console.log(`    Not necessarily wrong — an optional field misleads nobody. What is missing`);
    console.log(`    is the JUDGEMENT: regulationRef.description, which the viewer also prints in`);
    console.log(`    the voluntary-pill tooltip. Resolve per field against primary text.`);
    const byCat = {};
    for (const f of findings.unreasoned) (byCat[f.cat] ??= []).push(f);
    for (const [cat, fs] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length))
      console.log(`    ${cat.padEnd(18)} ${String(fs.length).padStart(4)}   e.g. ${fs.slice(0, 3).map((x) => x.key).join(", ")}`);
  }
  if (findings.staleCount.length) {
    console.log(`\n[6] stored count does not match the fields (${findings.staleCount.length})`);
    for (const f of findings.staleCount)
      console.log(`    ${f.cat.padEnd(12)} requiredFieldCount ${f.req.padEnd(12)} fieldCount ${f.fields}`);
  }
  if (findings.kindMismatch.length) {
    console.log(`\n[8] field \`kind\` contradicts instruments.json (${findings.kindMismatch.length})`);
    console.log(`    Only \`legislation\` can make a field required, so a voluntary scheme`);
    console.log(`    labelled \`legislation\` is a latent over-require. A [REQUIRED] row is live.`);
    for (const f of findings.kindMismatch)
      console.log(
        `    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.inst}  registry=${f.registry} field=${f.field}${f.required ? "  [REQUIRED]" : ""}`,
      );
  }
  if (findings.missingProvision.length) {
    console.log(`\n[9] cites an article or annex that does not exist in the act (${findings.missingProvision.length})`);
    for (const f of findings.missingProvision)
      console.log(`    ${f.cat.padEnd(12)} ${f.key.slice(0, 30).padEnd(32)} ${f.celex}  missing ${f.missing.join(", ")}  (act has ${f.has})`);
  }
  if (content.amended.length)
    console.log(`\n    [9] note: ${content.amended.length} lettered article(s) absent from the text as adopted, probably inserted by amendment; check the consolidated version: ${content.amended.join("; ")}`);
  if (content.unindexed.length)
    console.log(`\n    [9] not checked: ${content.unindexed.length} cited act(s) not in provision-index.json (run build-provision-index.mjs): ${content.unindexed.join(", ")}`);
  if (findings.duplicates.length) {
    console.log(`\n[10] probable duplicate fields in one template (${findings.duplicates.length}) — merge, or record in known-distinct.json with the reason`);
    for (const f of findings.duplicates)
      console.log(`    ${f.cat.padEnd(12)} ${f.a} ~ ${f.b}  [${f.unit}; ${f.shape}]`);
  }
  if (findings.unitClash.length) {
    console.log(`\n[11] one key, different units across templates (${findings.unitClash.length}) — the VC vocabulary maps a key to one IRI`);
    for (const f of findings.unitClash) console.log(`    ${f.key}: ${f.units.join(" | ")}`);
  }
  if (!n) console.log("    clean");
  return n;
}

let total = audit(DIRS[which], which);

if (both) {
  const other = which === "platform" ? "schemas" : "platform";
  total += audit(DIRS[other], other);
  // Copy drift: same keys, different content.
  console.log("\n=== copy drift (platform vs schemas) ===");
  let drift = 0;
  for (const f of readdirSync(DIRS.platform).filter((x) => x.endsWith(".json"))) {
    const a = join(DIRS.platform, f), b = join(DIRS.schemas, f);
    const da = JSON.parse(readFileSync(a, "utf-8"));
    // `templates/` is not all category templates: units.json and
    // instruments.json are helper registries with no category+fields pair, and
    // the platform's own loader skips them. Skip before the existence check or
    // they report as "missing in schemas" forever.
    if (!Array.isArray(da.fields) || !da.category) continue;
    if (!existsSync(b)) { console.log(`    ${basename(f, ".json")}: missing in schemas`); drift++; continue; }
    const db = JSON.parse(readFileSync(b, "utf-8"));
    const ka = new Set(da.fields.map((x) => x.key)), kb = new Set(db.fields.map((x) => x.key));
    const only = [...ka].filter((k) => !kb.has(k)).concat([...kb].filter((k) => !ka.has(k)));
    const fa = Object.fromEntries(da.fields.map((x) => [x.key, x]));
    const fb = Object.fromEntries(db.fields.map((x) => [x.key, x]));
    const differing = [...ka].filter((k) => kb.has(k) && JSON.stringify(fa[k]) !== JSON.stringify(fb[k])).length;
    if (only.length || differing) {
      console.log(`    ${basename(f, ".json").padEnd(13)} keyDelta=${only.length ? only.join(",") : "-"} fieldsDiffering=${differing}`);
      drift++;
    }
  }
  if (!drift) console.log("    in sync");
  total += drift;
}

process.exit(total ? 1 : 0);
