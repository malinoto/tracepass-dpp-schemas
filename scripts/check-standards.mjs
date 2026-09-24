// Every `regulationRef.standards[]` key must exist in standards.json, and every
// registry entry must be well-formed. Run by `npm run check`.
import { readFileSync, readdirSync } from 'node:fs'

const reg = JSON.parse(readFileSync('standards.json', 'utf8'))
const kinds = new Set(Object.keys(reg.kinds))
let bad = 0
const fail = (m) => { console.error(`✗ ${m}`); bad++ }

for (const [id, s] of Object.entries(reg.standards)) {
  if (!kinds.has(s.kind)) fail(`${id}: unknown kind "${s.kind}"`)
  if (s.kind === 'harmonised-standard' && !s.ojCitation) fail(`${id}: harmonised-standard without ojCitation`)
  if (s.ojCitation && s.kind !== 'harmonised-standard') fail(`${id}: ojCitation on a non-harmonised entry`)
  if (s.verified && !s.title) fail(`${id}: verified entry without an official title`)
  if (!s.title && !s.subject) fail(`${id}: neither title nor subject`)
}

let refs = 0
for (const file of readdirSync('templates').filter((f) => f.endsWith('.json'))) {
  const t = JSON.parse(readFileSync(`templates/${file}`, 'utf8'))
  for (const f of t.fields ?? []) {
    for (const id of f.regulationRef?.standards ?? []) {
      refs++
      if (!reg.standards[id]) fail(`${file} ${f.key}: "${id}" is not in standards.json`)
    }
  }
}

if (bad) process.exit(1)
console.log(`standards.json: ${Object.keys(reg.standards).length} entries; ${refs} field references resolve.`)
