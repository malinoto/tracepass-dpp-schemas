/**
 * Proves the plannedActs check fires. Each case reintroduces a defect the
 * check exists to catch and asserts it is reported. Run: npm run test:planned.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkPlannedActs } from './check-planned-acts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const load = () => JSON.parse(readFileSync(join(here, '..', 'instruments.json'), 'utf8'))
const errorsAfter = (mutate) => {
  const r = load()
  mutate(r.plannedActs, r)
  return checkPlannedActs(r).join('\n')
}

test('the shipped block passes', () => assert.deepEqual(checkPlannedActs(load()), []))

test('the block exists and covers the ESPR product groups and the CPR system act', () => {
  const ids = Object.keys(load().plannedActs)
  for (const id of ['espr-da-iron-steel', 'espr-da-textiles', 'espr-da-aluminium', 'espr-da-tyres', 'espr-da-furniture', 'espr-da-mattresses', 'cpr-art75-da']) {
    assert.ok(ids.includes(id), id)
  }
})

test('a quarter written as a day is reported (a planned date says no more than its source)', () => {
  assert.match(errorsAfter((p) => { p['espr-da-textiles'].planned.date = '2027-03-31' }), /does not match precision quarter/)
})

test('a working-plan year given a quarter is reported', () => {
  assert.match(errorsAfter((p) => { p['espr-da-aluminium'].planned = { date: '2027-Q2', precision: 'quarter', event: 'adoption' } }), /working plan states years/)
})

test('a Have Your Say entry without its initiative id, or pointing at another initiative, is reported', () => {
  assert.match(errorsAfter((p) => { delete p['espr-da-iron-steel'].hysId }), /needs the initiative id/)
  assert.match(errorsAfter((p) => { p['espr-da-iron-steel'].hysId = 16116 }), /must be the page of initiative 16116/)
})

test('a not-scheduled entry with a Have Your Say source is reported', () => {
  assert.match(errorsAfter((p) => { p['espr-da-textiles'].stage = 'not-scheduled' }), /is scheduled/)
})

test('an unknown framework, an adopted act left in the block, and precision none with a date are reported', () => {
  assert.match(errorsAfter((p) => { p['espr-da-tyres'].framework = '32099R9999' }), /is not an instrument/)
  assert.match(errorsAfter((p) => { p['32024R1781'] = p['espr-da-tyres'] }), /an adopted act is an instrument|lowercase words/)
  assert.match(errorsAfter((p) => { p['cpr-art75-da'].planned.date = '2027-Q1' }), /precision none must be null/)
})

test('a qualification written into the product group name is reported (answers print the name as is)', () => {
  assert.match(errorsAfter((p) => { p['espr-horizontal-repairability'].productGroup = 'Horizontal repairability (consumer electronics)' }), /put any qualification in note/)
})
