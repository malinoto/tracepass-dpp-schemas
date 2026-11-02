#!/usr/bin/env node
/**
 * Give a category's changed data model a new version.
 *
 *   npm run bump:model -- <category> <major|minor|patch> [--dry-run] [--base <git-ref>]
 *
 * It finds the recorded model (the latest `model-versions.json` entry) in the git
 * history of `templates/<category>.json`, diffs that against the working copy, and
 * works out the smallest level the changes need (see `classifyModelChanges`). A lower
 * level is refused; a higher one is allowed. It then sets `modelVersion` in the
 * template and appends the ledger entry. Mirror both files to the platform afterwards
 * (`ship-template-change.sh` does it).
 *
 * --base <ref> reads the old template from that git ref instead of searching history.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bumpSemver, classifyModelChanges, levelRank, modelHash, projectModel } from './model-hash.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const option = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--base')
const [category, level] = positional

if (!category || !['major', 'minor', 'patch'].includes(level)) {
  console.error('usage: npm run bump:model -- <category> <major|minor|patch> [--dry-run] [--base <git-ref>]')
  process.exit(2)
}

const templatePath = join('templates', `${category}.json`)
const subset = JSON.parse(readFileSync(join(root, 'model-subset.json'), 'utf8'))
const ledgerPath = join(root, 'model-versions.json')
const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
const current = JSON.parse(readFileSync(join(root, templatePath), 'utf8'))
const entries = ledger[category]
if (!Array.isArray(entries) || entries.length === 0) {
  console.error(`✗ ${category} has no entry in model-versions.json`)
  process.exit(1)
}
const latest = entries[entries.length - 1]
const currentHash = modelHash(current, subset)

if (currentHash === latest.hash) {
  console.log(`✓ ${category}: the data model is unchanged since ${latest.modelVersion}; nothing to bump.`)
  process.exit(0)
}

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

/** The template as it was when `latest` was recorded. */
function recordedTemplate() {
  const base = option('--base')
  if (base) return JSON.parse(git('show', `${base}:${templatePath}`))
  const commits = git('log', '--format=%H', '--', templatePath).split('\n').filter(Boolean)
  for (const sha of commits) {
    let t
    try {
      t = JSON.parse(git('show', `${sha}:${templatePath}`))
    } catch {
      continue
    }
    if (modelHash(t, subset) === latest.hash) return t
  }
  return null
}

const before = recordedTemplate()
if (!before) {
  console.error(
    `✗ ${category}: no commit of ${templatePath} has the recorded ${latest.modelVersion} model (${latest.hash}).\n` +
      '  Pass --base <git-ref> naming a commit whose template is that version.',
  )
  process.exit(1)
}

const { minimum, changes } = classifyModelChanges(projectModel(before, subset), projectModel(current, subset))
console.log(`${category}: changes since ${latest.modelVersion}`)
for (const c of changes) console.log(`  ${c.level.padEnd(5)}  ${c.what}`)

if (minimum && levelRank(level) < levelRank(minimum)) {
  console.error(`✗ ${level} is too small: these changes need at least ${minimum}.`)
  process.exit(1)
}

const next = bumpSemver(latest.modelVersion, level)
if (flag('--dry-run')) {
  console.log(`(dry run) ${category} would become ${next} (${currentHash})`)
  process.exit(0)
}

const text = readFileSync(join(root, templatePath), 'utf8')
const replaced = text.replace(/("modelVersion":\s*")[^"]*(")/, `$1${next}$2`)
if (replaced === text) {
  console.error(`✗ ${templatePath} has no "modelVersion" to update`)
  process.exit(1)
}
writeFileSync(join(root, templatePath), replaced)
entries.push({ modelVersion: next, hash: currentHash })
writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`)
console.log(`✓ ${category} ${latest.modelVersion} → ${next}. Mirror ${templatePath} and model-versions.json to the platform.`)
