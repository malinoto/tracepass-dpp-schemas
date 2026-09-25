<div align="center">

<a href="https://www.tracepass.eu">
  <img src="https://www.tracepass.eu/tracepass-logo.svg" alt="TracePass" height="96">
</a>

# EU Digital Product Passport — Field Specifications

**Machine-readable field specs for 13 product categories, with every field traced to the article of EU law that mandates it.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@tracepass/dpp-schemas.svg)](https://www.npmjs.com/package/@tracepass/dpp-schemas)
[![Fields](https://img.shields.io/badge/fields-972-informational)](#whats-in-here)
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

Thirteen JSON files, one per product category. **972 fields in total. 131 are required by
an instrument in force; 221 are anticipated under a rule that has not yet been adopted.**

| Category | Fields | Required | Instrument |
|---|---:|---:|---|
| `battery` | 120 | 50 | Regulation (EU) 2023/1542 |
| `construction` | 49 | 4 | CPR (EU) 2024/3110 |
| `detergents` | 75 | 12 | Regulation (EU) 2026/405 |
| `electronics` | 160 | 4 | ESPR (EU) 2024/1781 |
| `fmcg` | 42 | 9 | ESPR (EU) 2024/1781 |
| `furniture` | 79 | 4 | ESPR (EU) 2024/1781 |
| `jewelry` | 53 | 3 | ESPR (EU) 2024/1781 |
| `packaging` | 64 | 8 | PPWR (EU) 2025/40 |
| `paints-coatings` | 65 | 0 | Directive 2004/42/EC |
| `steel` | 84 | 16 | ESPR (EU) 2024/1781 |
| `textile` | 60 | 5 | ESPR (EU) 2024/1781 |
| `toys` | 28 | 14 | Regulation (EU) 2025/2509 |
| `tyres` | 93 | 2 | ESPR (EU) 2024/1781 |

Battery carries the most required fields because Regulation (EU) 2023/1542 Art. 77 sets a
real statutory date — 18 February 2027 — rather than awaiting a delegated act. The only
other categories whose passport duty rests on an adopted instrument are `detergents` and
`toys` (`dateBasis: "statutory"`); the remaining ten are `"indicative"` — either awaiting
an ESPR delegated act, or citing an instrument that creates no passport duty at all
(`paints-coatings`, `packaging`, `construction`).

It is not the case that every battery field is required: the template also carries fields that are
`anticipated` (pending the carbon-footprint and due-diligence acts, and — per the
Commission's data-points guidance v2.0 — the Article 8 recycled-content act) and
fields that apply only to some battery sub-categories via `validation.requiredBy`.

**`required` means an instrument in force compels the data.** ESPR (EU) 2024/1781 is a
framework: it mandates no field directly, and every Digital Product Passport obligation
flows through a delegated act adopted under its Article 4. No product-group delegated act
has been adopted. Fields expected under a future act carry `validation.anticipated`
rather than `required`, with the CELEX of the instrument expected to impose them.

**An obligation does not always apply uniformly across a category.** Where the governing
instrument distinguishes sub-categories, the field carries `validation.requiredBy` — a map
from sub-category to `required`, `conditional`, or `notApplicable`. Battery uses the
Regulation (EU) 2023/1542 split (`EV`, `LMT`, `industrial_gt_2kwh`): everything applies to
EV batteries, LMT is exempt from the capacity-threshold-for-exhaustion field, and industrial
batteries are largely conditional on gates such as having a battery management system or
containing Annex X materials. `conditional` means the instrument compels the field only when
its stated gate is met — so a passport legitimately leaves it empty otherwise. Fields with no
`requiredBy` apply to the whole category.

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
  "regulationRef": { "article": "Art. 77", "annex": "Annex VI" },
  "aiHints": {
    "alternateNames": ["capacity", "nominal capacity", "battery capacity", "Ah rating"],
    "expectedFormat": "Numeric value in Ah",
    "extractionPriority": 9
  }
}
```

Five things are worth pointing out.

**`regulation.effectiveDate` is the date the passport obligation begins — not the date
the regulation applies.** Those are different dates and can sit years apart. PPWR
(EU) 2025/40 has applied since 12 August 2026, but its packaging DPP provisions phase
in from 2027, so `packaging` carries `2027`, not `2026-08-12`.

Read both dates with their precision marker. `datePrecision` / `mandatoryDatePrecision`
are `"day"` or `"year"`; absent means `"day"`:

- **`"day"`** — a real statutory date. Battery is `2027-02-18`, set by Regulation (EU)
  2023/1542 Article 77.
- **`"year"`** — only the year is known, because the governing delegated or implementing
  act is not yet adopted. The day and month are filler. **Do not render these as a
  deadline.** Nine of the thirteen categories are currently `"year"`; the other four
  carry an exact date.

**`datePrecision` is not the same question as `dateBasis`, and you usually want the
latter.** Precision asks *how exact is this date*; basis asks *does an adopted
instrument set it at all*. `dateBasis: "statutory"` means a provision in force fixes
the date and it can be cited — exactly three categories: `battery` (2027-02-18,
Reg (EU) 2023/1542 Art. 77(1)), `detergents` (2029-09-23) and `toys` (2030-08-01).
The other ten are `"indicative"`: no adopted act sets the date, so it is a planning
target with no legal force.

The two are independent, and `paints-coatings` is why the distinction matters — it has
`datePrecision: "day"` (2010-01-01 is exact) but `dateBasis: "indicative"`, because the
Decopaint Directive creates no passport duty at all. An exact date for an obligation
that does not exist. Filter on `dateBasis`, not on precision, when you need to know
what is actually mandated.

```python
r = template["regulation"]
if r.get("datePrecision", "day") == "year":
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
assert it. A required field's `regulationRef.verification` quotes the operative sentence
from the act, says where it sits, and states any condition the law attaches (for
example, the Detergents Regulation's substance list does not bind industrial products).
Required fields not yet verified against the primary text are listed in
`audit/unverified-required.json`, which only shrinks.

**`label`** is provided in the 24 official EU languages, because ESPR Article 8 requires
the passport to be available in the language of the member state where the product is
placed on the market.

**`defaultAccessLevel`** encodes who may read the field: `public` (anyone scanning the
QR code), `restricted` (holders of a granted token, such as a recycler), or `authority`
(market-surveillance bodies). A DPP is not one document — it is several views of one
record.

**`aiHints`** lists the synonyms a supplier datasheet might use for the field. If you are
extracting values from unstructured PDFs, these are the search terms that work.

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

## Related

- **[tracepass-open](https://github.com/malinoto/tracepass-open)** — the compliance
  validator, EPCIS 2.0 event mapper, and GS1 utilities that consume these specs.
  Apache-2.0, zero dependencies.

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
