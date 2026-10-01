/**
 * Proves check [17] still fires. A gate that stays green is indistinguishable
 * from a gate that checks nothing, so each case below reintroduces a defect the
 * check exists to catch and asserts it is reported. Run: npm run test:audit.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { checkQuotes } from "./evidence-checks.mjs";
import { checkUseDataDefaults, checkGuidanceDatapoints, checkEntryShapes } from "./content-checks.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(here, "..", "templates");
const ACTS = join(here, "acts");

const load = () =>
  readdirSync(TEMPLATES)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f, JSON.parse(readFileSync(join(TEMPLATES, f), "utf-8"))])
    .filter(([, d]) => Array.isArray(d.fields));
const field = (t, cat, key) => t.find(([f]) => f === `${cat}.json`)[1].fields.find((f) => f.key === key);
const withActs = (skip, fn) => {
  const dir = mkdtempSync(join(tmpdir(), "acts-"));
  try {
    for (const f of readdirSync(ACTS)) if (!skip(f)) copyFileSync(join(ACTS, f), join(dir, f));
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true });
  }
};

test("the shipped templates pass", () => assert.deepEqual(checkQuotes(load()), []));

test("one changed word in a quote is reported", () => {
  const t = load();
  const o = field(t, "battery", "batteryUniqueIdentifier").regulationRef.obligations[0];
  o.quote = o.quote.replace("links", "points");
  assert.deepEqual(checkQuotes(t).map((f) => f.id), ["battery.batteryUniqueIdentifier"]);
});

test("each piece of an elided quote must occur", () => {
  const t = load();
  const o = field(t, "battery", "batteryUniqueIdentifier").regulationRef.obligations[0];
  o.quote += " … a sentence that is in no act";
  assert.equal(checkQuotes(t).length, 1);
});

test("corrected wording is found only in the corrigendum", () => {
  const t = load();
  field(t, "battery", "separateCollectionSymbol").regulationRef.obligations[0].provision = "Annex XIII 1(q)";
  // The corrigendum text is then quoted by nothing, which is reported as well.
  assert.deepEqual(checkQuotes(t).map((f) => f.id), [
    "battery.separateCollectionSymbol",
    "audit/acts/32023R1542R(13).txt",
  ]);
});

test("a cited act with no stored text is reported", () => {
  const found = withActs((f) => f === "32023R1542R(13).txt", (dir) => checkQuotes(load(), dir));
  assert.ok(found.some((f) => f.id === "battery.separateCollectionSymbol" && /no stored text/.test(f.why)));
});

test("a stored act nothing quotes is reported", () => {
  const found = withActs(() => false, (dir) => {
    writeFileSync(join(dir, "32099R9999.txt"), "unused");
    return checkQuotes(load(), dir);
  });
  assert.deepEqual(found.map((f) => f.id), ["audit/acts/32099R9999.txt"]);
});

// ── [2] the article string must LEAD with its CELEX's instrument ─────────────
// Runs the real audit.mjs over a one-template corpus with planted citations.
import { spawnSync } from "node:child_process";
const auditMismatches = (mutate) => {
  const dir = mkdtempSync(join(tmpdir(), "tpl-"));
  try {
    const t = JSON.parse(readFileSync(join(TEMPLATES, "battery.json"), "utf-8"));
    mutate(t);
    writeFileSync(join(dir, "battery.json"), JSON.stringify(t));
    const r = spawnSync(process.execPath, [join(here, "audit.mjs")], {
      env: { ...process.env, DPP_TEMPLATES_PUBLIC: dir },
      encoding: "utf-8",
    });
    const section = (r.stdout + r.stderr).split("[2]")[1]?.split("\n\n")[0] ?? "";
    return section;
  } finally {
    rmSync(dir, { recursive: true });
  }
};
const cited = (t) => t.fields.find((f) => f.regulationRef?.instrument === "32023R1542");

test("a string leading with another instrument than its CELEX is reported", () => {
  let key;
  const out = auditMismatches((t) => {
    const f = cited(t);
    key = f.key;
    f.regulationRef.article = "ESPR Art. 7(5); Battery Regulation Art. 13(1)";
  });
  assert.match(out, new RegExp(`\\b${key}\\b`));
});

test("a primary-then-secondary string over the primary's CELEX passes", () => {
  let key;
  const out = auditMismatches((t) => {
    const f = cited(t);
    key = f.key;
    f.regulationRef.article = "Battery Regulation Art. 13(1); ESPR Art. 7(5)";
  });
  assert.doesNotMatch(out, new RegExp(`\\b${key}\\b`));
});

import { checkFlattenedUnits, checkAnnexInventory } from "./content-checks.mjs";

test("[18] the shipped templates carry no flattened units in prose", () =>
  assert.deepEqual(checkFlattenedUnits(load()), []));

test("[18] a flattened exponent in a description is reported; the unit key is exempt", () => {
  const t = load();
  const [, jewelry] = t.find(([, d]) => d.category === "jewelry");
  const f = jewelry.fields.find((x) => x.key === "nickelMigrationRate");
  f.description.de = f.description.de.replace("µg/cm²", "µg/cm2");
  f.unit = "ug/cm2/week";
  assert.deepEqual(checkFlattenedUnits(t).map((x) => [x.id, x.where]), [
    ["jewelry.nickelMigrationRate", "description.de"],
  ]);
});

// ── [19] annex inventory ──────────────────────────────────────────────────────

// The shipped templates must all pass the annex-inventory check.
test("[19] the shipped templates have no annex-inventory finding", () => {
  const instruments = JSON.parse(
    readFileSync(join(here, "..", "instruments.json"), "utf-8"),
  ).instruments;
  const findings = checkAnnexInventory(load(), instruments);
  assert.deepEqual(findings.map((f) => `${f.cat}.${f.key}: ${f.annex} on ${f.celex}`), []);
});

test("[19] a field citing an annex not in the act's list is reported", () => {
  const instruments = { "32023R1542": { annexes: ["I", "XIII"] } };
  const t = [["battery.json", { category: "battery", fields: [
    { key: "testField", regulationRef: { instrument: "32023R1542", annex: "Annex XIV" }, validation: { required: false } },
  ] }]];
  const findings = checkAnnexInventory(t, instruments);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].key, "testField");
});

test("[19] a field citing an annex on an act with no annexes is reported", () => {
  const instruments = { "32023R0988": { annexes: [] } };
  const t = [["electronics.json", { category: "electronics", fields: [
    { key: "gpsr_field", regulationRef: { instrument: "32023R0988", annex: "Annex III" }, validation: { required: false } },
  ] }]];
  const findings = checkAnnexInventory(t, instruments);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].validAnnexes.length, 0);
});

test("[19] a field citing a valid annex passes", () => {
  const instruments = { "32023R1542": { annexes: ["I", "VI", "XIII", "XIV", "XV"] } };
  const t = [["battery.json", { category: "battery", fields: [
    { key: "testField", regulationRef: { instrument: "32023R1542", annex: "Annex XIII" }, validation: { required: false } },
    { key: "part_a", regulationRef: { instrument: "32023R1542", annex: "Annex VI Part A" }, validation: { required: false } },
  ] }]];
  assert.deepEqual(checkAnnexInventory(t, instruments), []);
});

test("[19] a field whose instrument has no annexes key is skipped", () => {
  const instruments = { "32024R1781": {} };   // no annexes key at all
  const t = [["electronics.json", { category: "electronics", fields: [
    { key: "espr_field", regulationRef: { instrument: "32024R1781", annex: "Annex I" }, validation: { required: false } },
  ] }]];
  assert.deepEqual(checkAnnexInventory(t, instruments), []);
});

test("[20] the shipped templates carry no default on a battery use-data field", () =>
  assert.deepEqual(checkUseDataDefaults(load()), []));

test("[20] a default state of health of 100 is reported", () => {
  const t = load();
  field(t, "battery", "stateOfHealth").defaultValue = 100;
  field(t, "battery", "negativeEvents").defaultValue = [];
  assert.deepEqual(checkUseDataDefaults(t).map((f) => f.id), ["battery.stateOfHealth", "battery.negativeEvents"]);
});

test("[20] the declared battery status (point 4(c)) may keep its default", () => {
  const t = load();
  assert.equal(field(t, "battery", "batteryStatus").defaultValue, "original");
  assert.deepEqual(checkUseDataDefaults(t), []);
});

const GUIDANCE = JSON.parse(readFileSync(join(here, "..", "guidance", "battery-datapoints-v2.0.json"), "utf-8"));
const DP_MAP = JSON.parse(readFileSync(join(here, "..", "guidance", "battery-field-datapoints.json"), "utf-8"));
const g21 = (t) => checkGuidanceDatapoints(t, GUIDANCE, DP_MAP);

test("[21] the guidance table parses to the Commission's per-category totals", () => {
  const tally = (cat) => Object.values(GUIDANCE.datapoints).reduce((a, d) => ({ ...a, [d[cat]]: (a[d[cat]] ?? 0) + 1 }), {});
  assert.deepEqual(tally("EV"), { mandatory: 47, "certain-cases": 8, optional: 1, "not-to-be-filled": 15 });
  assert.deepEqual(tally("LMT"), { mandatory: 50, "certain-cases": 8, optional: 1, "not-to-be-filled": 12 });
  assert.deepEqual(tally("industrial"), { mandatory: 32, "certain-cases": 26, optional: 1, "not-to-be-filled": 12 });
});

test("[21] the shipped battery template has no field blocking publication without a data point", () =>
  assert.deepEqual(g21(load()), []));

test("[21] a conditional field with no data point is reported (the stateOfHealth hard block)", () => {
  const t = load();
  field(t, "battery", "stateOfHealth").validation.requiredBy = { EV: "conditional", LMT: "conditional", industrial_gt_2kwh: "conditional" };
  assert.deepEqual([...new Set(g21(t).map((f) => f.key))], ["stateOfHealth"]);
});

test("[21] a field required against a deferred data point is reported (due diligence, DP 19)", () => {
  const t = load();
  const k = Object.entries(DP_MAP.fields).find(([, v]) => v.dp.includes(19))?.[0]
    ?? t.find(([f]) => f === "battery.json")[1].fields.find((f) => /dueDiligence/i.test(f.key)).key;
  const f = field(t, "battery", k);
  f.validation.anticipated = false;
  f.validation.required = true;
  delete f.validation.requiredBy;
  DP_MAP.fields[k] ??= { dp: [19], why: "test" };
  const found = g21(t).filter((x) => x.key === k);
  delete DP_MAP.fields[k];
  assert.equal(found.length, 3);
  assert.match(found[0].problem, /not-to-be-filled/);
});

test("[21] SOCE required for LMT is reported (DP 61 is not to be filled for LMT)", () => {
  const t = load();
  field(t, "battery", "stateOfCertifiedEnergy").validation.requiredBy.LMT = "required";
  assert.deepEqual(g21(t).map((f) => f.key), ["stateOfCertifiedEnergy"]);
});

// ── [22] declared entry shape vs extraction hint ───────────────────────────
test("[22] the shipped templates' entry shapes match their hints", () =>
  assert.deepEqual(checkEntryShapes(load()), []));

test("[22] the old composition hint ({name, weightPercent}) is reported against the declared shape", () => {
  const t = load();
  field(t, "battery", "cathodeActiveMaterials").aiHints.expectedFormat =
    "Array of objects: [{name: 'Lithium Nickel Manganese Cobalt Oxide', weightPercent: 85.0}]";
  const problems = checkEntryShapes(t).map((f) => f.problem);
  assert.ok(problems.some((p) => p.includes('"substanceName" is not in')), problems.join("; "));
  assert.ok(problems.some((p) => p.includes('uses "weightPercent"')), problems.join("; "));
});

test("[22] entryProperties on a non-array field is reported", () => {
  const t = load();
  const f = field(t, "battery", "batteryStatus");
  f.entryProperties = { x: { type: "string" } };
  assert.ok(checkEntryShapes(t).some((x) => x.id === "battery.batteryStatus"));
});

test("[22] a URL inside a quoted example value is not read as a member", () => {
  const t = load();
  const f = field(t, "jewelry", "customCertificates");
  assert.ok(f.aiHints.expectedFormat.includes("https://"), "fixture lost its URL example");
  assert.deepEqual(checkEntryShapes(t).filter((x) => x.id === "jewelry.customCertificates"), []);
});

test("[22] an object list without entryProperties is reported", () => {
  const t = load();
  delete field(t, "tyres", "billOfMaterials").entryProperties;
  assert.ok(checkEntryShapes(t).some((x) => x.id === "tyres.billOfMaterials" && /no entryProperties/.test(x.problem)));
});
