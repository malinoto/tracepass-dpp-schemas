#!/usr/bin/env node
/**
 * The model-version gate: every template's `modelVersion` must be its category's latest
 * entry in `model-versions.json`, and that entry's hash must be the template's
 * data-model hash. A change to the model without a version bump fails here, as does a
 * template key that `model-subset.json` does not classify.
 *
 *   node scripts/check-model-versions.mjs           # check
 *   node scripts/check-model-versions.mjs --print   # print each category's version and hash
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkModelVersions, modelHash } from './model-hash.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const subset = readJson('model-subset.json')
const ledger = readJson('model-versions.json')
const templates = readdirSync(join(root, 'templates'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => readJson(join('templates', f)))
  .filter((t) => Array.isArray(t.fields))

if (process.argv.includes('--print')) {
  for (const t of templates) console.log(`${t.category.padEnd(16)} ${String(t.modelVersion).padEnd(8)} ${modelHash(t, subset)}`)
  process.exit(0)
}

const errors = checkModelVersions({ templates, ledger, subset })
if (errors.length) {
  console.error(`✗ model versions: ${errors.length} problem(s)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`✓ model versions: ${templates.length} templates match model-versions.json`)
