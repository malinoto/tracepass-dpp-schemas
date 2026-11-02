/**
 * The data-model hash and SemVer helpers for category templates.
 *
 * A template's data model is the part that decides whether a passport is valid and who
 * may see each field. `model-subset.json` lists those keys per level; `projectModel`
 * keeps only them, and `modelHash` is SHA-256 over the RFC 8785 (JCS) canonical form of
 * that projection. A label, description or translation edit leaves the hash unchanged.
 *
 * The platform carries a TypeScript port of this module and must produce the same
 * hashes: its test suite checks every template's hash against `model-versions.json`,
 * which this module computed.
 *
 * Normalisation, so that only meaningful changes move the hash:
 *   - a null value, an empty array and an empty object count as absent;
 *   - `fields` becomes an object keyed by field key (field order is presentation);
 *   - enum values and obligations are sorted (their order carries no meaning).
 */
import { createHash } from 'node:crypto'

/** RFC 8785 JSON Canonicalization Scheme. ES `JSON.stringify` already serialises
 *  strings and numbers exactly as JCS requires; JCS adds sorted object keys (by UTF-16
 *  code units, which is the default string sort) and no whitespace. */
export function jcs(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`JCS: non-finite number ${value}`)
    }
    if (value === undefined || typeof value === 'function' || typeof value === 'bigint') {
      throw new Error(`JCS: unsupported value of type ${typeof value}`)
    }
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) return `[${value.map(jcs).join(',')}]`
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${jcs(value[k])}`).join(',')}}`
}

const isEmpty = (v) =>
  v === null ||
  v === undefined ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)

/** Keep only `include` keys; drop absent-equivalent values. */
function pick(obj, include, transform = {}) {
  const out = {}
  for (const key of include) {
    if (!(key in obj)) continue
    const raw = obj[key]
    const value = transform[key] ? transform[key](raw) : raw
    if (!isEmpty(value)) out[key] = value
  }
  return out
}

const sortedByJcs = (arr) =>
  [...new Map(arr.map((v) => [jcs(v), v])).entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, v]) => v)

/** The model-bearing projection of one template. */
export function projectModel(template, subset) {
  const field = (f) =>
    pick(f, subset.field.include, {
      enumOptions: (opts) =>
        Array.isArray(opts) ? sortedByJcs(opts.map((o) => pick(o, subset.enumOption.include).value).filter((v) => !isEmpty(v))) : opts,
      validation: (v) => (v && typeof v === 'object' ? pick(v, subset.validation.include) : v),
      regulationRef: (r) =>
        r && typeof r === 'object'
          ? pick(r, subset.regulationRef.include, {
              obligations: (obs) =>
                Array.isArray(obs)
                  ? sortedByJcs(obs.map((o) => pick(o, subset.obligation.include)).filter((o) => !isEmpty(o)))
                  : obs,
            })
          : r,
      entryProperties: (props) => {
        if (!props || typeof props !== 'object') return props
        const out = {}
        for (const [name, p] of Object.entries(props)) {
          const projected = pick(p, subset.entryProperty.include, {
            enum: (values) => (Array.isArray(values) ? sortedByJcs(values) : values),
          })
          if (!isEmpty(projected)) out[name] = projected
        }
        return out
      },
    })

  const fields = {}
  for (const f of template.fields ?? []) {
    if (typeof f.key !== 'string' || f.key === '') throw new Error(`${template.category}: a field has no key`)
    if (f.key in fields) throw new Error(`${template.category}: duplicate field key ${f.key}`)
    fields[f.key] = field(f)
  }

  return pick(template, subset.template.include, {
    regulation: (r) => (r && typeof r === 'object' ? pick(r, subset.regulation.include) : r),
    fields: () => fields,
  })
}

/** The canonical string that is hashed, and served byte for byte by the platform. */
export function canonicalModel(template, subset) {
  return jcs(projectModel(template, subset))
}

/** `sha256:<hex>` over the UTF-8 bytes of the canonical model. */
export function modelHash(template, subset) {
  return `sha256:${createHash('sha256').update(canonicalModel(template, subset), 'utf8').digest('hex')}`
}

/** Every key, at every level the subset covers, that is in neither `include` nor
 *  `exclude`. Returns `["battery: field.newKey", …]`. */
export function unclassifiedKeys(templates, subset) {
  const out = new Set()
  const known = (level) => new Set([...subset[level].include, ...subset[level].exclude])
  const check = (cat, level, obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return
    const k = known(level)
    for (const key of Object.keys(obj)) if (!k.has(key)) out.add(`${cat}: ${level}.${key}`)
  }
  for (const t of templates) {
    const cat = t.category ?? '(no category)'
    check(cat, 'template', t)
    check(cat, 'regulation', t.regulation)
    for (const f of t.fields ?? []) {
      check(cat, 'field', f)
      check(cat, 'validation', f.validation)
      for (const o of f.enumOptions ?? []) check(cat, 'enumOption', o)
      for (const p of Object.values(f.entryProperties ?? {})) check(cat, 'entryProperty', p)
      check(cat, 'regulationRef', f.regulationRef)
      for (const o of f.regulationRef?.obligations ?? []) check(cat, 'obligation', o)
    }
  }
  return [...out].sort()
}

/** Keys listed in both `include` and `exclude` of one level. */
export function subsetConflicts(subset) {
  const out = []
  for (const [level, spec] of Object.entries(subset)) {
    if (level.startsWith('$')) continue
    const ex = new Set(spec.exclude)
    for (const key of spec.include) if (ex.has(key)) out.push(`${level}.${key}`)
  }
  return out
}

// ── SemVer ────────────────────────────────────────────────────────────────────

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export function parseSemver(v) {
  const m = typeof v === 'string' ? SEMVER.exec(v) : null
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

export function compareSemver(a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (!pa || !pb) throw new Error(`not a version: ${pa ? b : a}`)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1
  return 0
}

export function bumpSemver(v, level) {
  const p = parseSemver(v)
  if (!p) throw new Error(`not a version: ${v}`)
  if (level === 'major') return `${p[0] + 1}.0.0`
  if (level === 'minor') return `${p[0]}.${p[1] + 1}.0`
  if (level === 'patch') return `${p[0]}.${p[1]}.${p[2] + 1}`
  throw new Error(`unknown level: ${level}`)
}

// ── The gate ──────────────────────────────────────────────────────────────────

const HASH = /^sha256:[0-9a-f]{64}$/

/**
 * Every problem with the templates' versions against the ledger. An empty array means
 * every template's `modelVersion` is the category's latest ledger entry and that
 * entry's hash is the template's hash.
 */
export function checkModelVersions({ templates, ledger, subset }) {
  const errors = []
  for (const c of subsetConflicts(subset)) errors.push(`model-subset.json lists ${c} as both include and exclude`)
  for (const k of unclassifiedKeys(templates, subset)) {
    errors.push(`${k} is not classified: add it to "include" or "exclude" in model-subset.json`)
  }

  for (const [cat, entries] of Object.entries(ledger)) {
    if (cat.startsWith('$')) continue
    if (!Array.isArray(entries) || entries.length === 0) {
      errors.push(`model-versions.json: ${cat} has no entries`)
      continue
    }
    entries.forEach((e, i) => {
      if (!parseSemver(e?.modelVersion)) errors.push(`model-versions.json: ${cat}[${i}] has no valid modelVersion`)
      if (!HASH.test(e?.hash ?? '')) errors.push(`model-versions.json: ${cat}[${i}] has no valid hash`)
      if (i > 0 && parseSemver(e?.modelVersion) && parseSemver(entries[i - 1]?.modelVersion)) {
        if (compareSemver(entries[i - 1].modelVersion, e.modelVersion) >= 0) {
          errors.push(`model-versions.json: ${cat} ${e.modelVersion} is not higher than ${entries[i - 1].modelVersion}`)
        }
      }
    })
  }

  for (const t of templates) {
    const cat = t.category
    const v = t.modelVersion
    if (!parseSemver(v)) {
      errors.push(`${cat}: modelVersion ${JSON.stringify(v)} is not a MAJOR.MINOR.PATCH version`)
      continue
    }
    const entries = Array.isArray(ledger[cat]) ? ledger[cat] : []
    const latest = entries[entries.length - 1]
    if (!latest) {
      errors.push(`${cat}: no entry in model-versions.json`)
      continue
    }
    if (latest.modelVersion !== v) {
      errors.push(`${cat}: modelVersion is ${v}, but the latest recorded version is ${latest.modelVersion}`)
      continue
    }
    const hash = modelHash(t, subset)
    if (latest.hash !== hash) {
      errors.push(
        `${cat}: the data model changed since ${v} was recorded (${latest.hash.slice(0, 19)}… → ${hash.slice(0, 19)}…). ` +
          `Run: npm run bump:model -- ${cat} <major|minor|patch>`,
      )
    }
  }
  return errors
}

// ── The bump classifier ───────────────────────────────────────────────────────

const LEVELS = ['patch', 'minor', 'major']
export const levelRank = (l) => LEVELS.indexOf(l)

const ACCESS_RANK = { public: 0, restricted: 1, authority: 2 }
const REQUIRED_BY_RANK = { notApplicable: 0, conditional: 1, required: 2 }

const same = (a, b) => jcs(a ?? null) === jcs(b ?? null)

function isRequired(f) {
  return f.validation?.required === true || Object.values(f.validation?.requiredBy ?? {}).includes('required')
}

/** Raise a bound where the new value is stricter: `higherIsStricter` for min/minLength. */
function boundChange(changes, where, name, before, after, higherIsStricter) {
  if (same(before, after)) return
  if (before === undefined) return changes.push(['major', `${where}: ${name} added (${after})`])
  if (after === undefined) return changes.push(['minor', `${where}: ${name} removed`])
  const stricter = higherIsStricter ? after > before : after < before
  changes.push([stricter ? 'major' : 'minor', `${where}: ${name} ${before} → ${after}`])
}

function compareField(changes, key, a, b) {
  const where = `field ${key}`
  const handled = new Set(['key', 'dataType', 'unit', 'translatable', 'enumOptions', 'validation', 'defaultAccessLevel', 'regulationRef', 'entryProperties'])

  for (const k of ['dataType', 'unit', 'translatable']) {
    if (!same(a[k], b[k])) changes.push(['major', `${where}: ${k} ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`])
  }

  const ea = new Set((a.enumOptions ?? []).map(jcs))
  const eb = new Set((b.enumOptions ?? []).map(jcs))
  for (const v of ea) if (!eb.has(v)) changes.push(['major', `${where}: allowed value ${v} removed`])
  for (const v of eb) if (!ea.has(v)) changes.push(['minor', `${where}: allowed value ${v} added`])

  const va = a.validation ?? {}
  const vb = b.validation ?? {}
  if ((va.required === true) !== (vb.required === true)) {
    changes.push(vb.required === true ? ['major', `${where}: made required`] : ['minor', `${where}: no longer required`])
  }
  const subcats = new Set([...Object.keys(va.requiredBy ?? {}), ...Object.keys(vb.requiredBy ?? {})])
  for (const sc of subcats) {
    const ra = va.requiredBy?.[sc]
    const rb = vb.requiredBy?.[sc]
    if (ra === rb) continue
    const before = REQUIRED_BY_RANK[ra] ?? 0
    const after = REQUIRED_BY_RANK[rb]
    if (after === undefined) changes.push(['major', `${where}: requiredBy.${sc} ${ra} → ${rb} (unknown status)`])
    else changes.push([after > before ? 'major' : 'minor', `${where}: requiredBy.${sc} ${ra ?? '(none)'} → ${rb ?? '(none)'}`])
  }
  if ((va.anticipated === true) !== (vb.anticipated === true)) {
    changes.push(
      vb.anticipated === true
        ? ['minor', `${where}: obligation now anticipated`]
        : ['major', `${where}: anticipated obligation now applies`],
    )
  }
  if (!same(va.anticipatedUnder, vb.anticipatedUnder)) changes.push(['patch', `${where}: anticipatedUnder changed`])
  boundChange(changes, where, 'min', va.min, vb.min, true)
  boundChange(changes, where, 'minLength', va.minLength, vb.minLength, true)
  boundChange(changes, where, 'max', va.max, vb.max, false)
  boundChange(changes, where, 'maxLength', va.maxLength, vb.maxLength, false)
  if (!same(va.pattern, vb.pattern)) {
    changes.push(vb.pattern === undefined ? ['minor', `${where}: pattern removed`] : ['major', `${where}: pattern changed`])
  }
  const vHandled = new Set(['required', 'requiredBy', 'anticipated', 'anticipatedUnder', 'min', 'minLength', 'max', 'maxLength', 'pattern'])
  for (const k of new Set([...Object.keys(va), ...Object.keys(vb)])) {
    if (!vHandled.has(k) && !same(va[k], vb[k])) changes.push(['major', `${where}: validation.${k} changed`])
  }

  if (a.defaultAccessLevel !== b.defaultAccessLevel) {
    const ra = ACCESS_RANK[a.defaultAccessLevel]
    const rb = ACCESS_RANK[b.defaultAccessLevel]
    const level = ra === undefined || rb === undefined || rb > ra ? 'major' : 'minor'
    changes.push([level, `${where}: access ${a.defaultAccessLevel} → ${b.defaultAccessLevel}`])
  }

  if (!same(a.regulationRef, b.regulationRef)) changes.push(['patch', `${where}: citation changed`])

  const pa = a.entryProperties ?? {}
  const pb = b.entryProperties ?? {}
  for (const name of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
    const x = pa[name]
    const y = pb[name]
    const w = `${where}: entry property ${name}`
    if (y === undefined) { changes.push(['major', `${w} removed`]); continue }
    if (x === undefined) { changes.push([y.required === true ? 'major' : 'minor', `${w} added${y.required === true ? ' as required' : ''}`]); continue }
    for (const k of ['type', 'format']) if (!same(x[k], y[k])) changes.push(['major', `${w}: ${k} changed`])
    if ((x.required === true) !== (y.required === true)) changes.push([y.required === true ? 'major' : 'minor', `${w}: required ${x.required === true} → ${y.required === true}`])
    const xa = new Set((x.enum ?? []).map(jcs))
    const ya = new Set((y.enum ?? []).map(jcs))
    for (const v of xa) if (!ya.has(v)) changes.push(['major', `${w}: allowed value ${v} removed`])
    for (const v of ya) if (!xa.has(v)) changes.push(['minor', `${w}: allowed value ${v} added`])
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (!['type', 'format', 'required', 'enum'].includes(k) && !same(x[k], y[k])) changes.push(['major', `${w}: ${k} changed`])
    }
  }

  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!handled.has(k) && !same(a[k], b[k])) changes.push(['major', `${where}: ${k} changed`])
  }
}

/**
 * The changes between two projected models, each tagged with the smallest SemVer level
 * it needs. A change the rules do not recognise is MAJOR, so the minimum is never
 * under-stated.
 */
export function classifyModelChanges(before, after) {
  const changes = []
  if (before.category !== after.category) changes.push(['major', `category ${before.category} → ${after.category}`])

  const ra = before.regulation ?? {}
  const rb = after.regulation ?? {}
  for (const k of ['effectiveDate', 'mandatoryDate']) {
    if (same(ra[k], rb[k])) continue
    if (ra[k] === undefined) changes.push(['major', `regulation.${k} added (${rb[k]})`])
    else if (rb[k] === undefined) changes.push(['minor', `regulation.${k} removed`])
    else changes.push([rb[k] < ra[k] ? 'major' : 'minor', `regulation.${k} ${ra[k]} → ${rb[k]}`])
  }
  for (const k of ['dateBasis', 'datePrecision', 'mandatoryDatePrecision']) {
    if (!same(ra[k], rb[k])) changes.push(['minor', `regulation.${k} ${ra[k] ?? '(none)'} → ${rb[k] ?? '(none)'}`])
  }
  if (!same(ra.number, rb.number)) changes.push(['patch', `regulation.number ${ra.number} → ${rb.number}`])
  for (const k of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
    if (!['effectiveDate', 'mandatoryDate', 'dateBasis', 'datePrecision', 'mandatoryDatePrecision', 'number'].includes(k) && !same(ra[k], rb[k])) {
      changes.push(['major', `regulation.${k} changed`])
    }
  }

  const fa = before.fields ?? {}
  const fb = after.fields ?? {}
  for (const key of Object.keys(fa)) if (!(key in fb)) changes.push(['major', `field ${key} removed`])
  for (const key of Object.keys(fb)) {
    if (!(key in fa)) changes.push(isRequired(fb[key]) ? ['major', `field ${key} added as required`] : ['minor', `field ${key} added`])
    else compareField(changes, key, fa[key], fb[key])
  }

  for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (!['category', 'regulation', 'fields'].includes(k) && !same(before[k], after[k])) changes.push(['major', `${k} changed`])
  }

  const minimum = changes.reduce((m, [l]) => (m === null || levelRank(l) > levelRank(m) ? l : m), null)
  return { minimum, changes: changes.map(([level, what]) => ({ level, what })) }
}
