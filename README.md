<div align="center">

<a href="https://www.tracepass.eu">
  <img src="https://www.tracepass.eu/tracepass-logo.svg" alt="TracePass" height="96">
</a>

# EU Digital Product Passport — Field Specifications

**Machine-readable field specs for 12 product categories, with every field traced to the article of EU law that mandates it.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@tracepass/dpp-schemas.svg)](https://www.npmjs.com/package/@tracepass/dpp-schemas)
[![Fields](https://img.shields.io/badge/fields-935-informational)](#whats-in-here)
[![Categories](https://img.shields.io/badge/categories-12-informational)](#whats-in-here)
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

Twelve JSON files, one per product category. **935 fields in total. 307 are required by an instrument in force;
198 are anticipated under a rule that has not yet been adopted.**

| Category | Fields | Required | Instrument |
|---|---:|---:|---|
| `battery` | 117 | 59 | Regulation (EU) 2023/1542 |
| `chemicals` | 96 | 28 | ESPR (EU) 2024/1781 |
| `construction` | 49 | 43 | CPR (EU) 2024/3110 |
| `electronics` | 167 | 20 | ESPR (EU) 2024/1781 |
| `fmcg` | 42 | 11 | ESPR (EU) 2024/1781 |
| `furniture` | 79 | 27 | ESPR (EU) 2024/1781 |
| `jewelry` | 52 | 12 | ESPR (EU) 2024/1781 |
| `packaging` | 66 | 9 | PPWR (EU) 2025/40 |
| `steel` | 84 | 29 | ESPR (EU) 2024/1781 |
| `textile` | 60 | 12 | ESPR (EU) 2024/1781 |
| `toys` | 28 | 14 | ESPR (EU) 2024/1781 |
| `tyres` | 95 | 43 | ESPR (EU) 2024/1781 |

Battery is the only category whose obligation is already in force — Regulation (EU)
2023/1542 Art. 77 applies from 18 February 2027, rather than awaiting a delegated
act. That is why its `required` count is the highest of the twelve. It is not the
case that every battery field is required: the template also carries fields that are
`anticipated` (pending the carbon-footprint and due-diligence implementing acts) and
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

Four things are worth pointing out.

**`regulationRef`** is the reason this data is worth having. Every field says which
article and annex mandates it, so a compliance report can cite its source rather than
assert it.

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
format. All 12 templates validate against it — which is how the format stays honest.

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
that keeps `schema.json` passing.

## License

[Apache-2.0](./LICENSE). Use them, fork them, ship them in a commercial product.
