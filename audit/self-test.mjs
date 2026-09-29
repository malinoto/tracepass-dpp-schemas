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
