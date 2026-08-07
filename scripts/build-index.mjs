#!/usr/bin/env node
// Regenerates index.json from templates/*.json.
//
// The manifest is derived, never hand-edited: every count in it (and in the
// README badges) has to agree with the JSON, and a hand-typed number silently
// stops agreeing the first time a template moves. Run this after any template
// change, then `npm run validate`.
//
// Usage: npm run build:index        (writes index.json)
//        npm run check:index        (verifies it is current; non-zero if not)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const templatesDir = join(root, 'templates')
const indexPath = join(root, 'index.json')

const read = (p) => JSON.parse(readFileSync(p, 'utf8'))

const categories = readdirSync(templatesDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((file) => {
    const t = read(join(templatesDir, file))
    const fields = t.fields ?? []
    // required and anticipated are mutually exclusive per schema.json; count
    // them off validation.* so the manifest reflects the data, not the prose.
    const requiredFieldCount = fields.filter((f) => f.validation?.required === true).length
    const anticipatedFieldCount = fields.filter((f) => f.validation?.anticipated === true).length
    return {
      category: t.category,
      // The manifest carries the English label only. `categoryLabel` in a
      // template is the full 24-EU-language object; inlining all of it here
      // would bloat the index and change a published field's type.
      label: typeof t.categoryLabel === 'string' ? t.categoryLabel : t.categoryLabel.en,
      file: `templates/${file}`,
      version: t.version,
      fieldCount: fields.length,
      requiredFieldCount,
      anticipatedFieldCount,
      regulation: t.regulation,
    }
  })

const existing = read(indexPath)
const next = {
  name: existing.name,
  license: existing.license,
  maintainer: existing.maintainer,
  totals: {
    categories: categories.length,
    fields: categories.reduce((n, c) => n + c.fieldCount, 0),
    requiredFields: categories.reduce((n, c) => n + c.requiredFieldCount, 0),
    anticipatedFields: categories.reduce((n, c) => n + c.anticipatedFieldCount, 0),
  },
  categories,
}

const serialised = JSON.stringify(next, null, 2) + '\n'

if (process.argv.includes('--check')) {
  if (readFileSync(indexPath, 'utf8') !== serialised) {
    console.error('index.json is stale — run `npm run build:index`.')
    process.exit(1)
  }
  console.log('index.json is current.')
} else {
  writeFileSync(indexPath, serialised)
  const { totals } = next
  console.log(
    `index.json written: ${totals.categories} categories, ${totals.fields} fields ` +
      `(${totals.requiredFields} required, ${totals.anticipatedFields} anticipated).`,
  )
}
