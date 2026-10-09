// `plannedActs` in instruments.json: acts that are planned but not adopted.
// Every entry must be well-formed, and its planned date must say no more than
// its source does: a Have Your Say quarter, a working-plan year, or nothing.
// Run by `npm run check`; scripts/check-planned-acts.test.mjs proves each rule
// fires on a reintroduced defect.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const KINDS = new Set(['product-group', 'horizontal', 'procedural'])
const STAGES = new Set(['planned', 'consultation', 'not-scheduled'])
const SOURCES = new Set(['hys', 'working_plan', 'act'])
const FORMAT = {
  day: /^\d{4}-\d{2}-\d{2}$/,
  month: /^\d{4}-(0[1-9]|1[0-2])$/,
  quarter: /^\d{4}-Q[1-4]$/,
  year: /^\d{4}$/,
}
const HYS_URL = 'https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/'

/** Errors in the plannedActs block of an instruments.json registry (empty = valid). */
export function checkPlannedActs(registry) {
  const errors = []
  const block = registry.plannedActs
  if (block === undefined) return errors
  if (!block || typeof block !== 'object' || Array.isArray(block)) return ['plannedActs must be an object keyed by id']
  for (const [id, a] of Object.entries(block)) {
    const fail = (m) => errors.push(`plannedActs.${id}: ${m}`)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('id must be lowercase words joined by hyphens')
    if (!a || typeof a !== 'object') { fail('must be an object'); continue }
    const parent = registry.instruments?.[a.framework]
    if (!parent) fail(`framework "${a.framework}" is not an instrument in instruments.json`)
    else if (parent.kind !== 'legislation') fail(`framework "${a.framework}" is not legislation`)
    if (registry.instruments?.[id]) fail('an adopted act is an instrument, not a planned one')
    if (typeof a.article !== 'string' || !a.article.startsWith('Art. ')) fail('article must name the empowering article ("Art. 4")')
    if (!KINDS.has(a.kind)) fail(`kind "${a.kind}" is not one of ${[...KINDS].join(', ')}`)
    if (typeof a.productGroup !== 'string' || !a.productGroup.trim()) fail('productGroup is empty')
    if (/[()]/.test(a.productGroup ?? '')) fail('productGroup is a name; put any qualification in note')
    if (a.note !== undefined && (typeof a.note !== 'string' || !a.note.trim())) fail('note, when present, is a non-empty string')
    if (!STAGES.has(a.stage)) fail(`stage "${a.stage}" is not one of ${[...STAGES].join(', ')}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.lastChecked ?? '')) fail('lastChecked must be YYYY-MM-DD')

    const p = a.planned
    if (!p || typeof p !== 'object') fail('planned is missing')
    else {
      if (p.event !== 'adoption') fail(`planned.event "${p.event}" must be "adoption"`)
      if (p.precision === 'none') {
        if (p.date !== null) fail('a planned date with precision none must be null')
      } else if (!FORMAT[p.precision]) fail(`planned.precision "${p.precision}" is not day, month, quarter, year or none`)
      else if (typeof p.date !== 'string' || !FORMAT[p.precision].test(p.date)) fail(`planned.date "${p.date}" does not match precision ${p.precision}`)
    }

    const s = a.source
    if (!s || !SOURCES.has(s.kind)) { fail(`source.kind "${s?.kind}" is not one of ${[...SOURCES].join(', ')}`); continue }
    if (typeof s.url !== 'string' || !/^https?:\/\//.test(s.url)) fail('source.url is missing')
    if (s.kind === 'hys') {
      if (!Number.isInteger(a.hysId)) fail('a Have Your Say source needs the initiative id (hysId)')
      else if (s.url !== `${HYS_URL}${a.hysId}`) fail(`source.url must be the page of initiative ${a.hysId}`)
      if (a.stage === 'not-scheduled') fail('an initiative on Have Your Say is scheduled: stage planned or consultation')
      if (p && p.precision !== 'quarter' && p.precision !== 'none') fail('Have Your Say plans by quarter: precision quarter (or none)')
    } else {
      if (a.hysId !== undefined) fail(`hysId given, but the source is ${s.kind}`)
      if (a.stage !== 'not-scheduled') fail('without a Have Your Say initiative the stage is not-scheduled')
    }
    if (s.kind === 'working_plan') {
      if (p && p.precision !== 'year') fail('the working plan states years: precision year')
      if (!s.document) fail('a working-plan source names its document (COM(2025) 187)')
    }
    if (s.kind === 'act' && p && p.precision !== 'none') fail('an empowering article states no planned date: precision none')
  }
  return errors
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const registry = JSON.parse(readFileSync('instruments.json', 'utf8'))
  const errors = checkPlannedActs(registry)
  for (const e of errors) console.error(`✗ ${e}`)
  if (errors.length) process.exit(1)
  console.log(`instruments.json plannedActs: ${Object.keys(registry.plannedActs ?? {}).length} planned acts, well-formed.`)
}
