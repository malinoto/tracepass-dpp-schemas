import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  bumpSemver,
  canonicalModel,
  checkModelVersions,
  classifyModelChanges,
  compareSemver,
  jcs,
  modelHash,
  projectModel,
  unclassifiedKeys,
} from './model-hash.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const subset = readJson('model-subset.json')
const ledger = readJson('model-versions.json')
const battery = () => readJson('templates/battery.json')
const clone = (o) => structuredClone(o)

test('JCS matches the RFC 8785 § 3.2.3 example', () => {
  const input = JSON.parse(String.raw`{
    "numbers": [333333333.33333329, 1E30, 4.50, 2e-3, 0.000000000000000000000000001],
    "string": "\u20ac$\u000F\u000aA'\u0042\u0022\u005c\\\"\/",
    "literals": [null, true, false]
  }`)
  const expected = String.raw`{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\u000f\nA'B\"\\\\\"/"}`
  assert.equal(jcs(input), expected)
})

test('JCS sorts keys by UTF-16 code units and rejects non-finite numbers', () => {
  assert.equal(jcs({ b: 1, a: 2, A: 3, é: 4 }), '{"A":3,"a":2,"b":1,"é":4}')
  assert.throws(() => jcs({ x: Number.NaN }))
})

test('label, description, translation, order and version edits leave the hash unchanged', () => {
  const t = battery()
  const h = modelHash(t, subset)
  const u = clone(t)
  u.fields[0].label.de = 'geändert'
  u.fields[0].description.en = 'changed'
  u.fields[0].aiHints = { changed: true }
  u.fields[0].sortOrder = 9999
  u.fields.reverse()
  u.version = 99
  u.modelVersion = '99.0.0'
  u.changelog = []
  u.fieldCount = 1
  const withEnum = u.fields.find((f) => (f.enumOptions ?? []).length > 1)
  withEnum.enumOptions.reverse()
  withEnum.enumOptions[0].label = { en: 'relabelled' }
  assert.equal(modelHash(u, subset), h)
})

test('null, empty array and absent are the same model', () => {
  const t = battery()
  const u = clone(t)
  const f = u.fields.find((x) => x.validation.minLength === null)
  delete f.validation.minLength
  const g = u.fields.find((x) => x.enumOptions === null)
  g.enumOptions = []
  const h = u.fields.find((x) => x.enumOptions === null && x !== g)
  delete h.enumOptions
  assert.equal(modelHash(u, subset), modelHash(t, subset))
})

test('a required flag, an allowed value, an access level or a citation changes the hash', () => {
  const t = battery()
  const h = modelHash(t, subset)
  const edits = [
    (u) => { u.fields[0].validation.required = !u.fields[0].validation.required },
    (u) => { u.fields.find((f) => f.enumOptions?.length).enumOptions.pop() },
    (u) => { u.fields[0].defaultAccessLevel = u.fields[0].defaultAccessLevel === 'public' ? 'restricted' : 'public' },
    (u) => { u.fields[0].regulationRef.provision = 'Art. 999' },
    (u) => { u.regulation.mandatoryDate = '2030-01-01' },
  ]
  for (const edit of edits) {
    const u = clone(t)
    edit(u)
    assert.notEqual(modelHash(u, subset), h, edit.toString())
  }
})

test('the canonical model is the hashed string and carries no excluded key', () => {
  const s = canonicalModel(battery(), subset)
  // `"label":` as a key; "label" also occurs as an obligation carrier value.
  assert.ok(!s.includes('"label":'))
  assert.ok(!s.includes('"aiHints":'))
  assert.ok(!s.includes('"quote":'))
  assert.ok(s.includes('"defaultAccessLevel"'))
})

test('every key in every template is classified', () => {
  const templates = ['battery', 'textile', 'construction', 'steel', 'detergents'].map((c) => readJson(`templates/${c}.json`))
  assert.deepEqual(unclassifiedKeys(templates, subset), [])
  const u = clone(templates[0])
  u.fields[0].surpriseKey = 1
  u.fields[0].validation.surprise = 1
  assert.deepEqual(unclassifiedKeys([u], subset), ['battery: field.surpriseKey', 'battery: validation.surprise'])
})

test('the gate passes the shipped templates against the shipped ledger', () => {
  assert.deepEqual(checkModelVersions({ templates: [battery()], ledger, subset }), [])
})

test('the gate fails a model change without a version bump', () => {
  const u = battery()
  u.fields[0].validation.required = !u.fields[0].validation.required
  const errors = checkModelVersions({ templates: [u], ledger, subset })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /changed since 7\.0\.0/)
})

test('the gate fails a version that is not the latest, and a ledger that does not go up', () => {
  const u = battery()
  u.modelVersion = '6.0.0'
  assert.match(checkModelVersions({ templates: [u], ledger, subset }).join('\n'), /latest recorded version is 7\.0\.0/)

  const bad = clone(ledger)
  bad.battery = [...bad.battery, { modelVersion: '7.0.0', hash: bad.battery[0].hash }]
  assert.match(checkModelVersions({ templates: [], ledger: bad, subset }).join('\n'), /7\.0\.0 is not higher than 7\.0\.0/)
})

test('the gate fails a key the subset does not classify', () => {
  const u = battery()
  u.fields[0].newThing = true
  assert.match(checkModelVersions({ templates: [u], ledger, subset }).join('\n'), /field\.newThing is not classified/)
})

test('SemVer compare and bump', () => {
  assert.equal(compareSemver('7.10.0', '7.9.9'), 1)
  assert.equal(bumpSemver('7.1.3', 'major'), '8.0.0')
  assert.equal(bumpSemver('7.1.3', 'minor'), '7.2.0')
  assert.equal(bumpSemver('7.1.3', 'patch'), '7.1.4')
})

function addField(t, key, required) {
  const f = clone(t.fields.find((x) => x.validation.required === false && !x.validation.requiredBy))
  f.key = key
  f.validation.required = required
  t.fields.push(f)
}

test('the classifier tags each kind of change with its minimum level', () => {
  const t = battery()
  const before = projectModel(t, subset)
  const min = (edit) => {
    const u = clone(t)
    edit(u)
    return classifyModelChanges(before, projectModel(u, subset)).minimum
  }
  assert.equal(min(() => {}), null)
  assert.equal(min((u) => { u.fields[0].label.en = 'x' }), null)
  assert.equal(min((u) => addField(u, 'brandNewRequired', true)), 'major')
  assert.equal(min((u) => addField(u, 'brandNewOptional', false)), 'minor')
  assert.equal(min((u) => { u.fields.pop() }), 'major')
  assert.equal(min((u) => { u.fields[0].regulationRef.provision = 'Art. 999' }), 'patch')
  const opt = t.fields.findIndex((f) => f.validation.required === false && !f.validation.requiredBy)
  assert.equal(min((u) => { u.fields[opt].validation.required = true }), 'major')
  const req = t.fields.findIndex((f) => f.validation.required === true)
  assert.equal(min((u) => { u.fields[req].validation.required = false }), 'minor')
  const pub = t.fields.findIndex((f) => f.defaultAccessLevel === 'public')
  assert.equal(min((u) => { u.fields[pub].defaultAccessLevel = 'authority' }), 'major')
  const auth = t.fields.findIndex((f) => f.defaultAccessLevel === 'authority')
  assert.equal(min((u) => { u.fields[auth].defaultAccessLevel = 'public' }), 'minor')
  const en = t.fields.findIndex((f) => f.enumOptions?.length > 1)
  assert.equal(min((u) => { u.fields[en].enumOptions.pop() }), 'major')
  assert.equal(min((u) => { u.fields[en].enumOptions.push({ value: 'zz-new', label: { en: 'New' } }) }), 'minor')
  assert.equal(min((u) => { u.regulation.mandatoryDate = '2026-01-01' }), 'major')
  assert.equal(min((u) => { u.regulation.mandatoryDate = '2030-01-01' }), 'minor')
  assert.equal(min((u) => { u.fields[0].dataType = 'weird' }), 'major')
})

test('bump:model refuses a patch for an added required field and records a major', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bump-model-'))
  try {
    mkdirSync(join(dir, 'templates'))
    cpSync(join(root, 'scripts'), join(dir, 'scripts'), { recursive: true })
    for (const f of ['model-subset.json', 'model-versions.json', 'templates/battery.json']) cpSync(join(root, f), join(dir, f))
    const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.invalid', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.invalid' }
    const git = (...a) => execFileSync('git', a, { cwd: dir, env, stdio: 'pipe' })
    git('init', '-q')
    git('add', '.')
    git('commit', '-qm', 'base')

    const t = JSON.parse(readFileSync(join(dir, 'templates/battery.json'), 'utf8'))
    addField(t, 'brandNewRequired', true)
    writeFileSync(join(dir, 'templates/battery.json'), `${JSON.stringify(t, null, 2)}\n`)

    const run = (level) => spawnSync('node', ['scripts/bump-model.mjs', 'battery', level], { cwd: dir, encoding: 'utf8' })
    const patch = run('patch')
    assert.equal(patch.status, 1, patch.stdout + patch.stderr)
    assert.match(patch.stderr, /need at least major/)

    const major = run('major')
    assert.equal(major.status, 0, major.stdout + major.stderr)
    const after = JSON.parse(readFileSync(join(dir, 'templates/battery.json'), 'utf8'))
    assert.equal(after.modelVersion, '8.0.0')
    const led = JSON.parse(readFileSync(join(dir, 'model-versions.json'), 'utf8'))
    assert.deepEqual(led.battery.map((e) => e.modelVersion), ['7.0.0', '8.0.0'])
    assert.equal(led.battery[1].hash, modelHash(after, subset))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
