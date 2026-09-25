# Citation audit

`audit.mjs` checks every template in `templates/` for citation defects that
`schema.json` cannot see: the schema checks that a citation has the right *shape*, not
that it supports the obligation it claims. It is read-only and exits 1 on any
finding. `npm run check` runs it, and CI runs that on every push.

```bash
npm run check:audit                  # this repo's templates
node audit/audit.mjs --platform      # a second copy of the templates
node audit/audit.mjs --both          # both, plus the drift between them
```

`--platform` reads `DPP_TEMPLATES_PRIMARY`, or a sibling checkout's
`tracepass-platform/templates`. `DPP_TEMPLATES_PUBLIC` and `DPP_INSTRUMENTS` override
this repo's own paths, so the audit runs against any template corpus.

## Form checks [1]–[8]

**[1] Required under an instrument that mandates nothing.** `validation.required` gates
publishing, so this tells a user the law demands something it does not. The usual case
is ESPR (EU) 2024/1781: Art. 4 *empowers* the Commission to adopt delegated acts, and
Art. 9(2) lists what a delegated act must *specify*. Neither mandates product data. The
check keys on `createsDpp` being `framework-only` or `deferred` in `instruments.json`,
**not** on an instrument creating no passport: REACH and CLP create no passport, yet
impose real field-level duties (SDS content, classification, the UFI). Keying on
"creates no DPP" produced 98 false positives.

CPR (EU) 2024/3110 is `deferred` for the passport only; its CE-marking articles bind
today, but **only where** a harmonised technical specification or a European Technical
Assessment covers the product. So a CPR CE field may be required only when its citation
states that condition. An exemption should key on whether the citation records the
condition the law attaches, never on which instrument is named.

Two verdicts: *NO real instrument cited* (de-require it, or find the instrument that
applies) and *headline wrong* (a real instrument is named too; fix the article string
and keep `required`).

**[2] The article names one instrument, the CELEX another.** The CELEX drives tooling,
the free-text article is what a compliance report prints, so they can contradict each
other in output.

**[3] Required, has an article, but no instrument.** A bare article with no CELEX
silently inherits the template-level `regulation.number`.

**[4] ESPR Art. 7(2)(d)/(e).** Art. 7(2) has exactly three sub-points, (a)–(c).

**[5] Cites an ESPR annex that is not a data source.** Annex II is the procedure for
*defining* requirements and Annex III describes the passport itself; product parameters
come from Annex I.

**[6] Stored count does not match the fields.** `fieldCount` and `requiredFieldCount`
are literals in each template and must equal what the `fields` array holds.

**[7] Optional, asserts law, no recorded reasoning.** `kind: "legislation"` claims an
instrument backs the field. On an optional field nothing else interrogates that claim,
so `regulationRef.description` must say why it is optional (usually: anticipated under
a delegated act not yet adopted).

**[8] The field's `kind` contradicts `instruments.json`.** Only `legislation` can make a
field required; a voluntary scheme marked `legislation` is a latent over-require.

## Content checks [9]–[11] (`content-checks.mjs`)

**[9] The cited article or annex does not exist in the act.** Reads
`provision-index.json`: the articles and annexes each cited act has, taken from the
Official Journal text. Parenthesised text is dropped first, because it usually names
another act. The index is the act **as adopted**, so a missing *lettered* article (one
inserted by amendment, such as Waste Framework Directive Art. 8a) is a note to check
the consolidated text, not a finding. It proves existence, not relevance.

**[10] Probable duplicate fields in one template.** Same `dataType` and unit, and keys
that are the same words once filler is dropped, or one key plus a single qualifier, with
overlapping labels. Pairs judged distinct go in `known-distinct.json` **with the
reason**; if you cannot say why two fields differ, they are probably duplicates.

**[11] One key, different units across templates.** A vocabulary maps each key to one
IRI in every category, so one key in kg and in Ah is one term with two meanings.

## Maintaining the data files

- `provision-index.json` is rebuilt when a template starts citing a new act. EUR-Lex
  answers automated clients with an anti-bot challenge, so the builder drives a browser
  and lives outside this repo. For an act that cannot be fetched that way, derive the
  headings from the PDF text: lines reading `Article N` and `ANNEX N`, with
  non-breaking spaces normalised.
- `known-distinct.json` holds reviewed pairs with the reason each is distinct.

## What stays human

Whether a figure or scale matches the law, and whether the cited provision is the
*right* one. Only reading the primary text answers those. Never bulk-rewrite citations
from one reading: resolve per field.
