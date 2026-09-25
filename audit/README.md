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
other in output. Every instrument in `instruments.json` is recognised by the number its
title carries (`2024/1252`, `1907/2006`) and by its acronym. A hand-kept list once
omitted one act, and thirteen citations reading "CRMA" over an ESPR CELEX passed.

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

**[10] Probable duplicate fields in one template.** Fields sharing `dataType` and unit
(two unit-less fields count), in three shapes:

- *same words*: identical keys once filler is dropped (`tyreWeightKg` / `totalTyreWeightKg`);
- *subset*: one key's words all appear in the other, plus any number of qualifiers
  (`vocContent` / `vocContentReadyToUse`);
- *swapped*: one word differs on each side and the descriptions are at least 80% alike
  once that word is masked (`osUpdateEndDate` / `securityUpdateEndDate`).

Real siblings look exactly like the swapped shape (`recycledNickel` / `recycledCobalt`),
and no similarity threshold separates them from duplicates. So word pairs that are
genuine contrasts are declared once in `known-distinct.json` under `contrasts`, each
group with its reason, and a swapped pair passes only when its two words share a group.
Any other flagged pair is merged, or listed under `pairs` **with the reason**. If you
cannot say why two fields differ, they are probably duplicates.

**[11] One key, different units across templates.** A vocabulary maps each key to one
IRI in every category, so one key in kg and in Ah is one term with two meanings.

## Evidence checks [13]–[17] (`evidence-checks.mjs`)

**[13] and [16] `required` must match the recorded obligations.** `regulationRef.obligations`
lists every law, read in its primary text, that requires the datum: the act (`instrument`),
the `provision`, the `carrier` it puts the datum on (`passport`, `product`, `label`,
`sds`, `notification`, `document`, `customs`), any `condition`, and the verbatim `quote`.
A field is required exactly when one obligation has carrier `passport` and no condition:
[13] fails a required field without one, [16] an optional field with one (under-
requiring). Other obligations record duties elsewhere, which make the datum worth having
without making it passport-mandatory. Obligations are added only by reading the act.
`unverified-required.json` lists required fields still to be read; it is empty and may
only stay so or shrink.

**[14] A required field cites a safety-data-sheet or label provision.** Those duties land
on a document or a physical label, and REACH Art. 31 and the CLP labelling articles apply
only to classified mixtures, so they rarely make passport data mandatory for every
product. That pattern made 11 of 18 required detergent fields and all 15 paint fields
wrong. A reviewed exception goes in `known-carriers.json` with the reason.

**[15] A list field beside single-value copies of its parts.** `ingredients` next to
`ingredientCasNumber` holds one substance's values in scalars beside the list the law asks
for. Keep the list and move the parts into its entries.

**[17] An obligation's `quote` is not in the act.** Each cited act's text is stored in
`audit/acts/<CELEX>.txt`, and every quote must occur in it after whitespace, quote marks
and dashes are normalised. A quote may elide with `…`; each piece must occur. A
corrigendum named in `provision` (`as corrected by 32023R1542R(13)`) is searched as well,
since corrected wording is not in the act as adopted. Also reported: a cited act with no
stored text, and a stored text nothing quotes. `audit/self-test.mjs` (`npm run
test:audit`, part of `npm run check`) reintroduces each defect and asserts it is caught.

The texts are fetched with the `fetch-eur-lex` skill (`--out`; `--min-chars 300` for a
corrigendum, which is genuinely short) with non-breaking spaces normalised. They are
committed so CI can run without EUR-Lex, and are not in the npm package: `files` in
`package.json` is a whitelist that leaves `audit/` out. Refetch one only when a
consolidated or corrected version changes the wording a template quotes.

**[12] The cited instrument is not in `instruments.json`.** Every other check looks the
CELEX up in the registry and treats a miss as "nothing known", so an unregistered or
mistyped CELEX would pass them all while pointing at nothing. Register the act, or fix
the citation.

## Maintaining the data files

- `provision-index.json` is rebuilt when a template starts citing a new act. EUR-Lex
  answers automated clients with an anti-bot challenge, so the builder drives a browser
  and lives outside this repo. For an act that cannot be fetched that way, derive the
  headings from the PDF text: lines reading `Article N` and `ANNEX N`, with
  non-breaking spaces normalised.
- `known-distinct.json` holds reviewed pairs with the reason each is distinct.

## What stays human

Whether a figure or scale matches the law, and whether the cited provision is the
*right* one. [17] proves a quote is real text of the act; it cannot prove the quoted
sentence is the one that imposes the duty. Only reading the primary text answers those. Never bulk-rewrite citations
from one reading: resolve per field.
