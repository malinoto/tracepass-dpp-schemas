<div align="center">

<a href="https://www.tracepass.eu">
  <img src="https://www.tracepass.eu/tracepass-logo.svg" alt="TracePass" height="96">
</a>

# EU Digital Product Passport — Field Specifications

**Machine-readable field specs for 13 product categories, with every field traced to the article of EU law that mandates it.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@tracepass/dpp-schemas.svg)](https://www.npmjs.com/package/@tracepass/dpp-schemas)
[![Fields](https://img.shields.io/badge/fields-994-informational)](#whats-in-here)
[![Categories](https://img.shields.io/badge/categories-13-informational)](#whats-in-here)
[![Dependencies](https://img.shields.io/badge/dependencies-none-success)](#no-build-step)
[![Schema](https://img.shields.io/badge/JSON%20Schema-2020--12-orange)](./schema.json)

Maintained by **[TracePass](https://www.tracepass.eu)** · [Platform](https://app.tracepass.eu) · [API docs](https://www.tracepass.eu/docs)

</div>

---

## What is a Digital Product Passport?

A **Digital Product Passport (DPP)** is a structured, machine-readable record of a
product's composition, origin, environmental performance, and end-of-life handling,
accessible by scanning a data carrier on the product — usually a QR code.

It is mandated by the EU's **Ecodesign for Sustainable Products Regulation (ESPR),
Regulation (EU) 2024/1781**, and by product-specific instruments such as the **EU
Battery Regulation (EU) 2023/1542**. Different product categories become mandatory on
different dates: battery passports are required from **18 February 2027**, with
textiles, steel, packaging, construction, and others following.

The hard part of implementing one is not the QR code. It is knowing **which fields your
product category legally requires, and which article mandates each one.** That is what
this repository contains.

## What's in here

Thirteen JSON files, one per product category. **994 fields in total. 66 are required by
a law that creates a passport; 176 are anticipated under a rule that has not yet been adopted.**
Every other legal duty (on the product, the label, a safety data sheet, a document) is
recorded per field in `regulationRef.obligations` instead of being marked required.

| Category | Fields | Required | Instrument |
|---|---:|---:|---|
| `battery` | 124 | 40 | Regulation (EU) 2023/1542 |
| `construction` | 50 | 0 | CPR (EU) 2024/3110 |
| `detergents` | 77 | 12 | Regulation (EU) 2026/405 |
| `electronics` | 160 | 0 | ESPR (EU) 2024/1781 |
| `fmcg` | 42 | 0 | none scheduled (ESPR could apply; not in the working plan) |
| `furniture` | 79 | 0 | ESPR (EU) 2024/1781 |
| `jewelry` | 54 | 0 | none scheduled (ESPR could apply; not in the working plan) |
| `packaging` | 64 | 0 | PPWR (EU) 2025/40 |
| `paints-coatings` | 65 | 0 | none scheduled (VOC limits: Directive 2004/42/EC) |
| `steel` | 84 | 0 | ESPR (EU) 2024/1781 |
| `textile` | 60 | 0 | ESPR (EU) 2024/1781 |
| `toys` | 42 | 14 | Regulation (EU) 2025/2509 |
| `tyres` | 93 | 0 | ESPR (EU) 2024/1781 |

Battery carries the most required fields because Regulation (EU) 2023/1542 Art. 77 sets a
real statutory date — 18 February 2027 — rather than awaiting a delegated act. The only
other categories whose passport duty rests on an adopted instrument are `detergents` and
`toys` (`dateBasis: "statutory"`); the remaining ten are `"indicative"` — either awaiting
an ESPR delegated act, or citing an instrument that creates no passport duty at all
(`paints-coatings`, `packaging`, `construction`). Those three passport categories are the only ones
with required fields; construction's passport points are recorded as obligations
conditional on the delegated act under Reg (EU) 2024/3110 Art. 75(1).

It is not the case that every battery field is required: the template also carries fields that are
`anticipated`: data the Commission's data-points guidance v2.0 says is not to be filled or
displayed at the February 2027 start (carbon footprint, pending its acts; the due-diligence
report, required from 18 August 2027; recycled-content shares, pending the Article 8 act).
The dates live in `phasedObligations` (see below). The template also carries
fields that apply only to some battery sub-categories via `validation.requiredBy`.

**`required` means an instrument in force compels the data.** ESPR (EU) 2024/1781 is a
framework: it mandates no field directly, and every Digital Product Passport obligation
flows through a delegated act adopted under its Article 4. No product-group delegated act
has been adopted. Fields expected under a future act carry `validation.anticipated`
rather than `required`, with the CELEX of the instrument expected to impose them.

**`anticipated` needs a concrete basis.** Either an act in force requires the data but when
or how it applies waits on a further act that isn't adopted, so there's no fixed date (the
battery carbon-footprint fields waiting on their delegated act); or the Commission has
scheduled an act for the product group. An act in force that compels the data from a fixed
date, even a future one, makes the field `required` (the battery, detergents and toy
passports). The ESPR working plan COM(2025) 187 schedules textiles, furniture, tyres,
mattresses, iron and steel, aluminium, and horizontal requirements for electrical and
electronic equipment. Where a group is covered only by horizontal acts for specific aspects (electronics:
repairability, recycled content and recyclability), only the passport mechanics and fields
within those aspects are anticipated. That ESPR *could* reach a product doesn't qualify. The working plan
leaves detergents, paints and lubricants out, so those templates carry no ESPR-anticipated
fields; their passport duties come from their own acts, where one exists.

**An obligation does not always apply uniformly across a category.** Where the governing
instrument distinguishes sub-categories, the field carries `validation.requiredBy` — a map
from sub-category to `required`, `conditional`, or `notApplicable`. Battery uses the
Regulation (EU) 2023/1542 split (`EV`, `LMT`, `industrial_gt_2kwh`). The capacity threshold
for exhaustion (Annex XIII point 1(k)) and the state of certified energy are EV-only; the
remaining-capacity, power, round-trip-efficiency, self-discharge, resistance and throughput
parameters of Annex VII apply to LMT (and stationary storage) but not to EV. Industrial
batteries are largely conditional on gates such as being rechargeable, having a battery
management system, or containing Annex X materials. `conditional` means the instrument compels the field only when
its stated gate is met — so a passport legitimately leaves it empty otherwise. Fields with no
`requiredBy` apply to the whole category.

## Phased obligation dates

A passport's start date (`dppMandatoryFrom` in `instruments.json`) is not the date every
data group binds. Where parts of an instrument phase in later, the instrument carries
`phasedObligations`, one entry per data group:

| Key | Meaning |
|---|---|
| `id` | Stable identifier, e.g. `battery-due-diligence` |
| `provision` | The articles and annex points that impose it |
| `passportFrom` | ISO date the data is required in the passport; `null` when it waits on an act not yet adopted |
| `status` | `dated`; `dated-earliest` (that date or a later one set by an act); `pending-act` (no date can be stated) |
| `byCategory` | A different date for one battery category (e.g. LMT recycled content) |
| `otherDates` | Other dates legitimately tied to the obligation (a postponed original date, later minimum-share steps) |
| `source` | The primary text or Commission guidance the date comes from, with its edition |

For batteries, `guidance/` holds the Commission's own data-point list: DG GROW, *Digital
Batteries Passport – data point by category*, 2nd edition (15 Aug 2026), as
`battery-datapoints-v2.0.json` (71 data points × EV / LMT / industrial: `mandatory`,
`certain-cases`, `optional`, `not-to-be-filled`). `battery-field-datapoints.json` records
which data point each publish-blocking field carries. Audit check [21] fails any field that
is required for a category without a mandatory data point behind it, or conditional
without a mandatory or certain-cases one. Fields the guidance omits but the primary text
is read to require are listed under `primaryTextOnly`, with the reason. The map is
empty: the Annex VII Part B lifetime fields (capacity and energy throughput, date of
putting into service) have no data point, so they follow the Commission's list and
stay optional.

This is the one place those dates are kept. Copy that states them (the TracePass
marketing site checks every sentence against this registry) and the templates' own
`anticipated` flags follow it.

## Planned acts

`instruments.json` also holds `plannedActs`: acts that are planned but **not adopted**,
keyed by a stable id (`espr-da-textiles`). Each entry records the act it would be adopted
under (`framework`, `article`), what it covers (`productGroup`, a plain name; any
qualification goes in `note`; and `kind`: `product-group`, `horizontal` or
`procedural`), its planning `stage`, and the planned adoption date with its precision:

| Source | `stage` | `planned.precision` |
|---|---|---|
| A Have Your Say initiative (`hysId`, `source.kind: hys`) | `planned` or `consultation` | `quarter` (the portal's planned period) |
| The ESPR working plan COM(2025) 187 only (`source.kind: working_plan`) | `not-scheduled` | `year` |
| Only the empowering article (`source.kind: act`) | `not-scheduled` | `none` (`date: null`) |

A planned date is the Commission's intention, never an obligation date: render a quarter
or a year as "planned", never as "from" or "by". When an act is adopted, its entry leaves
`plannedActs` in the same release that adds the act to `instruments`. `lastChecked` is
the day the entry was last read against its source. `npm run check:planned` enforces the
shape, and that a date says no more than its source does.

```js
import instruments from "@tracepass/dpp-schemas/instruments.json" with { type: "json" };
```

## Standards

[`standards.json`](./standards.json) is a registry of the technical standards a field — or
a DPP system — relates to. A field names them in `regulationRef.standards`, as keys into the
registry:

```jsonc
"regulationRef": {
  "article": "EN 10204, EN 10025, EN 10088 (stainless)",   // human-facing, unchanged
  "kind": "standard",
  "standards": ["EN 10204", "EN 10025", "EN 10088"]          // machine-facing
}
```

- **A standard never makes a field required.** Only `kind: "legislation"` can. A standard
  supports a presumption of conformity; it binds nothing on its own.
- **Only an Official Journal citation confers that presumption.** Entries with
  `kind: "harmonised-standard"` carry `ojCitation` — the implementing decision and the
  provisions it covers. Today that is the six CEN/CLC/JTC 24 system standards
  (EN 18216, 18219, 18220, 18221, 18222, 18223) cited by Implementing Decision (EU)
  2026/1736 for ESPR Articles 10 and 11. EN 18239 and EN 18246 are still drafts.
- **National adoptions are aliases, not separate standards.** Every CEN/CENELEC member
  publishes an EN unchanged (DIN EN 18219, BDS EN …); confirmed ones are listed under
  `nationalAdoptions`.
- **`verified: true`** means the title and status were checked against the OJ or the
  standard's own text. Otherwise `subject` is a descriptive label, not the official title.
- **Naming a standard is not a conformity claim** — for this dataset or for any system
  built on it.

`npm run check:standards` fails if any field references a key the registry does not hold.

## What a field looks like

```jsonc
// templates/battery.json → fields[]
{
  "key": "ratedCapacity",
  "label": {
    "en": "Rated Capacity",
    "de": "Nennkapazität",
    "bg": "Номинален капацитет"
    // ... 21 more, one per official EU language
  },
  "dataType": "number",
  "unit": "Ah",
  "validation": { "required": true, "min": 0, "max": null },
  "defaultAccessLevel": "public",
  "regulationRef": {
    "article": "Battery Regulation Annex XIII 1(g)",   // human-facing: short name + provision
    "annex": "Annex XIII",
    "instrument": "32023R1542",                        // CELEX, machine-facing
    "provision": "Annex XIII 1(g)",
    "kind": "legislation"
  },
  "aiHints": {
    "alternateNames": ["capacity", "nominal capacity", "battery capacity", "Ah rating"],
    "expectedFormat": "Numeric value in Ah",
    "extractionPriority": 9
  }
}
```

Five things are worth pointing out.

**`regulation.effectiveDate` is the date the passport obligation begins — not the date
the regulation applies.** Those are different dates and can sit years apart, and
some categories have no passport obligation at all. PPWR (EU) 2025/40 has applied since
12 August 2026 but creates no packaging passport: Article 12 is a labelling regime (a
harmonised material label, with a QR code optional except on reusable packaging), so
`packaging` carries `dateBasis: "none"`, not `2026-08-12`.

Read both dates with their precision marker. `datePrecision` / `mandatoryDatePrecision`
are `"day"` or `"year"`; absent means `"day"`:

- **`"day"`** — a real statutory date. Battery is `2027-02-18`, set by Regulation (EU)
  2023/1542 Article 77.
- **`"year"`** — only the year is known, because the governing delegated or implementing
  act is not yet adopted. The day and month are filler. **Do not render these as a
  deadline.** Six of the thirteen categories are currently `"year"`.

**`datePrecision` is not the same question as `dateBasis`, and you usually want the
latter.** Precision asks *how exact is this date*; basis asks *does an adopted
instrument set it at all*. `dateBasis: "statutory"` means a provision in force fixes
the date and it can be cited — exactly three categories: `battery` (2027-02-18,
Reg (EU) 2023/1542 Art. 77(1)), `detergents` (2029-09-23) and `toys` (2030-08-01).
Six are `"indicative"`: no adopted act sets the date, so it is a planning target with
no legal force. Four are `"none"` — `fmcg`, `jewelry`, `packaging` and `paints-coatings`:
no adopted act creates a passport for them and none is scheduled, so a passport is
voluntary and both dates carry the sentinel `9999-12-31`, which must never be shown or
compared. Filter on `dateBasis`, not on precision, when you need to know what is
actually mandated.

```python
r = template["regulation"]
if r.get("dateBasis") == "none":
    print("No passport obligation; a passport is voluntary")      # sentinel dates: ignore
elif r.get("datePrecision", "day") == "year":
    print(f"DPP obligation expected in {r['effectiveDate'][:4]}")   # "2027"
else:
    print(f"DPP obligation from {r['effectiveDate']}")              # "2027-02-18"
```

> **Upgrading from 0.3.x?** The date values did not change and no key was removed, so
> code that reads this data keeps working. One case does break: if you **vendored a copy
> of `schema.json` from 0.3.x** and validate 0.4.0 template data against it, eleven of
> the twelve templates are rejected — that version closed the `regulation` object with
> `additionalProperties: false`, so the new precision keys are refused. Take the
> `schema.json` shipped in this package alongside the data. From 0.4.1 the `regulation`
> object is open, so later additive keys will not do this again.

**`regulationRef`** is the reason this data is worth having. Every field says which
article and annex mandates it, so a compliance report can cite its source rather than
assert it. `regulationRef.obligations` lists every law that requires the datum, each with
the provision, where the law puts it (the passport, the product, the label, a safety data
sheet, a notification, a document, a customs declaration), any condition, and the
operative sentence quoted from the act. A field is `required` only when a passport law puts
it in the passport for every product; a duty elsewhere is recorded, not required. So a
manufacturer name can be required in the battery passport and, in a category with no
passport law yet, optional with GPSR Art. 9(6) recorded as the duty to show it on the
product.

**`regulationRef.verifiedAgainstPrimaryText`** records that a person read the cited
provision in the official EUR-Lex text and confirmed the field's requirement, scale and
unit match. It is absent on most fields today — marking a field requires reading the act,
which is intentionally not done in bulk. The citation audit (`npm run check:audit`) reports
the verified share per category. When present, the shape is:

```jsonc
"verifiedAgainstPrimaryText": {
  "on": "2026-09-28",           // ISO 8601 date the act was read
  "celex": "32023R1542",        // consolidated version consulted
  "by": "TracePass"             // who verified
}
```

**`label`** is provided in the 24 official EU languages, because ESPR Article 8 requires
the passport to be available in the language of the member state where the product is
placed on the market.

**`defaultAccessLevel`** encodes who may read the field: `public` (anyone scanning the
QR code), `restricted` (holders of a granted token, such as a recycler), or `authority`
(market-surveillance bodies). A DPP is not one document — it is several views of one
record.

**`aiHints`** lists the synonyms a supplier datasheet might use for the field. If you are
extracting values from unstructured PDFs, these are the search terms that work.

**`entryProperties`** types the entries of an `array` field whose entries are objects:
each member has a `type` (`string` | `number` | `boolean`), and optionally `required`,
`enum`, `format` (`date`, `iso3166-alpha2`, `cas-number`) and a `description`. Battery
composition, for example, is a list of `{substanceName, casNumber, massPercent}`, with
`massPercent` as a share of the battery's total mass. Audit check [22] requires
`aiHints.expectedFormat` to name every declared member, and to use no member that is
not declared, so the extraction hint and the declared shape cannot drift apart. Every object list in
every category declares one.

## No build step

There is nothing to compile and nothing to install. Read the JSON.

```bash
curl -O https://raw.githubusercontent.com/malinoto/tracepass-dpp-schemas/main/templates/battery.json
```

```python
import json, urllib.request

url = "https://raw.githubusercontent.com/malinoto/tracepass-dpp-schemas/main/templates/battery.json"
template = json.load(urllib.request.urlopen(url))

required = [f for f in template["fields"] if f["validation"]["required"]]
print(f"{template['category']}: {len(required)} required fields under {template['regulation']['number']}")

for f in required[:3]:
    ref = f.get("regulationRef") or {}
    print(f"  {f['key']:24} {ref.get('article', '—')}  {ref.get('annex', '')}")
```

For TypeScript users, `@tracepass/dpp-schemas` ships the same files on npm, and
[`@tracepass/dpp-types`](https://github.com/malinoto/tracepass-open) provides the
matching types.

```bash
npm install @tracepass/dpp-schemas
```

## Validating the specs themselves

[`schema.json`](./schema.json) is a JSON Schema (Draft 2020-12) describing the template
format. All 13 templates validate against it — which is how the format stays honest.

```bash
pip install jsonschema
python -c "
import json, glob
from jsonschema import Draft202012Validator
v = Draft202012Validator(json.load(open('schema.json')))
for p in sorted(glob.glob('templates/*.json')):
    errs = list(v.iter_errors(json.load(open(p))))
    print(('ok   ' if not errs else 'FAIL '), p)
"
```

Two conventions the schema pins down, both of which will bite you otherwise:

- **Absent optional values are explicit `null`, not omitted keys.** A field with no unit
  carries `"unit": null`. A validation rule with no upper bound carries `"max": null`.
  Treat `null` as *no constraint*, and be careful not to coerce it to `0`.
- **Dates are ISO 8601 strings** (`"2027-02-18"`), not timestamps.

The schema checks shape only. `npm run check` adds the gates it cannot express, and CI
runs it on every push:

- **Locales** (`scripts/check-locales.mjs`): every label, description and option label
  carries all 24 official EU languages, none empty.
- **Citations** (`audit/`): whether each field's citation supports the obligation it
  claims. It catches a field required under an act that mandates nothing, an article
  missing from the act it cites, duplicate fields, and one key with two units. See
  [`audit/README.md`](./audit/README.md).
- **Planned acts** (`scripts/check-planned-acts.mjs`): every `plannedActs` entry names
  an instrument it is adopted under, and its planned date matches its source's precision.

## Recent changes

**1.13.0** (unreleased) — battery template corrections and primary-text verification.

*Legal corrections (Battery Regulation consolidated text 02023R1542-20260813):*

- **Pre-consumer recycled-content fields relabelled.** `preConsumerRecycled{Nickel,Cobalt,Lithium}Share` labels now use the Art. 3(1)(51) official term "battery manufacturing waste" across all 24 EU languages. The field names are unchanged.
- **Recycled-content split fields made optional.** Art. 8(1) and Annex XIII 1(e) require ONE combined recycled-content figure per metal. The pre-consumer / post-consumer breakdown is voluntary; both split fields lose their `requiredBy` entries. The share becomes binding only if a future Art. 8(1) delegated act mandates the split (not yet adopted).
- **`cadmiumLeadSymbolsUrl` corrected.** Provision reference fixed from "Annex XIII (1s)" to "Annex XIII (1q)" per corrigendum 32023R1542R(13). `requiredBy` entries changed from `"required"` to `"conditional"` for all three battery categories — Art. 13(5) applies only to batteries with >0.002 % cadmium or >0.004 % lead.
- **`componentPartNumbersUrl` and `sparePartsSourcesUrl` made optional.** Annex XIII 2(b) mandates the part-number and spare-parts data (carried by the array fields), not a URI format. The URL fields are a GEFEG data-model choice, not an independent legal duty.
- **A4 description corrections.** `stateOfCertifiedEnergy` (EV-only, Art. 14 + Annex VII), `remainingCapacity`, `evolutionOfSelfDischargeRate` (LMT + stationary storage, not EV), and `initialEnergyRoundTripEfficiency` all carry corrected `regulationRef.article` and `regulationRef.description`.
- **Per-category required-field counts after corrections:** EV 53, LMT 53, industrial >2 kWh 38 (flat required-field count stays at 38).

*Primary-text verification:*

- **`verifiedAgainstPrimaryText` set on 55 battery fields** read against the consolidated Battery Regulation 02023R1542-20260813. The eight legally-corrected fields listed above are deliberately NOT marked (they required a correction, not a confirmation).
- **Audit script reports verified-share per category** — informational, not a gate.

Two new battery state-of-health fields added: `remainingPowerCapabilityAt80Soc` (EV-only, Annex XIII 4(b)) and `remainingPowerCapabilityAt20Soc` (EV-only, Annex XIII 4(b)) — see 1.12.x notes.

## Related

- **[tracepass-open](https://github.com/malinoto/tracepass-open)** — the compliance
  validator, EPCIS 2.0 event mapper, and GS1 utilities that consume these specs.
  Apache-2.0, zero dependencies.

Plain-language explainers of the law these specs encode:

- [Article 77 battery passport — Regulation (EU) 2023/1542](https://www.tracepass.eu/regulatory/battery-articles/article-77)
  — the article behind the `battery` template's required fields.
- [EU Battery Regulation: the February 2027 compliance guide](https://www.tracepass.eu/resources/eu-battery-regulation-february-2027)
  — who has to issue a battery passport, and from when.
- [ESPR delegated acts, category by category](https://www.tracepass.eu/regulatory/delegated-acts)
  — why most templates carry `anticipated` rather than `required` fields.
- [Standards are not law](https://www.tracepass.eu/regulatory/standards-are-not-law)
  — what makes a DPP field mandatory, and what does not.
- [DPP glossary](https://www.tracepass.eu/glossary) — ESPR, PPWR, delegated act, economic operator, EPCIS.

## Provenance and limits

These specs are hand-authored from the regulations and the relevant standards, and are
cross-checked against published guidance where it exists — the battery template against
the Battery Pass Consortium content guidance, for instance. They are maintained because
[TracePass](https://www.tracepass.eu) runs a DPP compliance platform on them.

They are **not legal advice, and not an official EU artefact.** Delegated acts are still
landing and several categories have no delegated act yet; where a field anticipates one,
the `regulationRef` cites the parent instrument. Verify against
[EUR-Lex](https://eur-lex.europa.eu) before relying on any single field for a
market-placement decision. Corrections are welcome — open an issue.

## Contributing

Corrections to a field's regulatory citation, datatype, or translation are the most
valuable contributions. Open an issue with the article you're citing, or a pull request
that keeps `npm run check` passing.

## License

[Apache-2.0](./LICENSE). Use them, fork them, ship them in a commercial product.
