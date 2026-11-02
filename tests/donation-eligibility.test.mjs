import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateInterval,
  parseEligibility,
  evaluateScreening,
  policyReady,
  getEligibility,
  requireEligibility,
  DAY,
} from '../src/lib/donation-eligibility.ts'

const policy = {
  enabled: true,
  reference: 'Test programme only',
  minimumAge: 18,
  maximumAge: 65,
  minimumWeightKg: 50,
  intervalDays: 120,
  screeningValidityHours: 24,
  alcoholWindowHours: 24,
}
const answers = {
  ageYears: 28,
  weightKg: 65,
  firstDonation: true,
  lastDonationDate: null,
  currentlyUnwell: false,
  hasMedicationHistory: false,
  medicalDisclosure: '',
  recentAlcohol: false,
}
const fresh = () => ({
  ...answers,
  id: 'screening',
  eligibilityVersion: 1,
  createdAt: new Date().toISOString(),
  outcome: 'passed',
})
function backend({
  rules = policy,
  screening = fresh(),
  history = [],
  declarations = [],
  active = 0,
} = {}) {
  return {
    findGlobal: async () => rules,
    find: async (args) => ({
      docs:
        args.collection === 'appointments'
          ? history
          : args.sort === '-lastDonationDate'
            ? declarations
            : screening
              ? [screening]
              : [],
    }),
    count: async () => ({ totalDocs: active }),
  }
}

test('complete policy is mandatory and disabled rules never authorize donation', () => {
  assert.equal(policyReady(policy), true)
  assert.equal(policyReady({ ...policy, enabled: false }), false)
  assert.equal(policyReady({ ...policy, intervalDays: null }), false)
  assert.equal(policyReady({ ...policy, reference: '' }), false)
})
test('all declarations must have valid types', () => {
  assert.deepEqual(parseEligibility(answers), answers)
  for (const key of ['currentlyUnwell', 'hasMedicationHistory', 'recentAlcohol', 'firstDonation']) {
    assert.throws(() => parseEligibility({ ...answers, [key]: undefined }), /every eligibility/)
  }
  assert.throws(() => parseEligibility({ ...answers, ageYears: '28' }), /age/)
  assert.throws(() => parseEligibility({ ...answers, weightKg: NaN }), /weight/)
})
test('previous donors must provide a real non-future donation date', () => {
  for (const value of [null, 'invalid', new Date(Date.now() + DAY).toISOString()]) {
    assert.throws(
      () => parseEligibility({ ...answers, firstDonation: false, lastDonationDate: value }),
      /donation date/,
    )
  }
})
test('medication and relevant history require a disclosure, never advice to stop treatment', () => {
  assert.throws(() => parseEligibility({ ...answers, hasMedicationHistory: true }), /Describe/)
  const reasons = evaluateScreening(
    { ...answers, hasMedicationHistory: true, medicalDisclosure: 'Prescribed medication' },
    policy,
  )
  assert.match(reasons[0], /Do not stop prescribed medication/)
})
test('age, weight, illness, medication/history and alcohol all block preliminary screening', () => {
  for (const change of [
    { ageYears: 17 },
    { ageYears: 66 },
    { weightKg: 49 },
    { currentlyUnwell: true },
    { hasMedicationHistory: true },
    { recentAlcohol: true },
  ]) {
    assert.ok(evaluateScreening({ ...answers, ...change }, policy).length)
  }
  assert.deepEqual(evaluateScreening(answers, policy), [])
})
test('interval is blocked until the exact boundary, including partial days', () => {
  const last = '2026-01-01T10:00:00.000Z'
  const eligible = Date.parse(last) + 120 * DAY
  assert.equal(calculateInterval(last, 120, eligible - 1).remainingDays, 1)
  assert.equal(calculateInterval(last, 120, eligible - DAY - 1).remainingDays, 2)
  assert.equal(calculateInterval(last, 120, eligible).intervalComplete, true)
  assert.equal(calculateInterval(last, 120, eligible + DAY).remainingDays, 0)
  assert.equal(calculateInterval(null, 120).intervalComplete, true)
})
test('missing policy, absent questionnaire, legacy screening and expired screening fail closed', async () => {
  for (const options of [
    { rules: { enabled: false } },
    { screening: null },
    { screening: { ...fresh(), eligibilityVersion: null } },
    { screening: { ...fresh(), createdAt: new Date(Date.now() - 25 * 3_600_000).toISOString() } },
  ]) {
    const result = await getEligibility(backend(options), 'donor')
    assert.equal(result.status, 'pending')
    assert.equal(result.canRequest, false)
    await assert.rejects(requireEligibility(backend(options), 'donor', {}, true))
  }
})
test('stored outcome or client eligibility cannot override server evaluation', async () => {
  const result = await getEligibility(
    backend({
      screening: { ...fresh(), currentlyUnwell: true, outcome: 'passed', status: 'passed' },
    }),
    'donor',
  )
  assert.equal(result.status, 'failed')
  assert.equal(result.canRequest, false)
})
test('valid screening alone is insufficient when donation interval is incomplete', async () => {
  const date = new Date(Date.now() - 10 * DAY).toISOString()
  const api = backend({
    history: [{ date }],
    screening: { ...fresh(), createdAt: new Date(Date.now() - 1000).toISOString() },
  })
  const result = await getEligibility(api, 'donor')
  assert.equal(result.status, 'passed')
  assert.equal(result.intervalComplete, false)
  assert.equal(result.remainingDays, 110)
  await assert.rejects(requireEligibility(api, 'donor', {}, true), /Wait until/)
})
test('first-donation declaration cannot erase recorded history or previous external donation declaration', async () => {
  const date = new Date(Date.now() - 20 * DAY).toISOString()
  for (const options of [{ history: [{ date }] }, { declarations: [{ lastDonationDate: date }] }]) {
    const result = await getEligibility(backend(options), 'donor')
    assert.equal(result.lastDonationDate, date)
    assert.equal(result.canRequest, false)
  }
})
test('completed donation after screening invalidates the screening', async () => {
  const result = await getEligibility(
    backend({
      screening: { ...fresh(), createdAt: new Date(Date.now() - 1000).toISOString() },
      history: [{ date: new Date().toISOString() }],
    }),
    'donor',
  )
  assert.equal(result.status, 'pending')
  assert.equal(result.canRequest, false)
})
test('one active request blocks a second request but not a staff eligibility recheck', async () => {
  const api = backend({ active: 1 })
  assert.equal((await getEligibility(api, 'donor')).canRequest, false)
  await assert.rejects(requireEligibility(api, 'donor', {}, true), /already have an active/)
  await assert.doesNotReject(requireEligibility(api, 'donor', {}, false))
})
test('both gates and no active request permit requesting assessment, not medical self-approval', async () => {
  const result = await getEligibility(backend(), 'donor')
  assert.equal(result.status, 'passed')
  assert.equal(result.intervalComplete, true)
  assert.equal(result.canRequest, true)
  assert.equal('medicallyApproved' in result, false)
})
