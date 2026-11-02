import type { Payload, PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

export const DAY = 86_400_000
export type EligibilityAnswers = {
  ageYears: number
  weightKg: number
  firstDonation: boolean
  lastDonationDate: string | null
  currentlyUnwell: boolean
  hasMedicationHistory: boolean
  medicalDisclosure: string
  recentAlcohol: boolean
}
export type DonationPolicy = {
  enabled?: boolean | null
  reference?: string | null
  minimumAge?: number | null
  maximumAge?: number | null
  minimumWeightKg?: number | null
  intervalDays?: number | null
  screeningValidityHours?: number | null
  alcoholWindowHours?: number | null
}
export type Eligibility = {
  status: 'pending' | 'passed' | 'failed'
  reasons: string[]
  policy: DonationPolicy
  lastDonationDate: string | null
  nextEligibleDate: string | null
  remainingDays: number | null
  intervalComplete: boolean
  activeRequest: boolean
  canRequest: boolean
}

export function parseEligibility(input: Record<string, unknown>): EligibilityAnswers {
  if (
    typeof input.ageYears !== 'number' ||
    !Number.isInteger(input.ageYears) ||
    input.ageYears < 1 ||
    input.ageYears > 120
  )
    throw new Error('Enter your age in whole years.')
  if (
    typeof input.weightKg !== 'number' ||
    !Number.isFinite(input.weightKg) ||
    input.weightKg < 1 ||
    input.weightKg > 400
  )
    throw new Error('Enter your current weight in kilograms.')
  for (const key of ['firstDonation', 'currentlyUnwell', 'hasMedicationHistory', 'recentAlcohol']) {
    if (typeof input[key] !== 'boolean') throw new Error('Answer every eligibility question.')
  }
  let lastDonationDate: string | null = null
  if (!input.firstDonation) {
    const value = input.lastDonationDate
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      Date.parse(value) > Date.now()
    )
      throw new Error('Enter a valid last donation date that is not in the future.')
    if (new Date(value).toISOString().slice(0, 10) !== value.slice(0, 10))
      throw new Error('Enter a real calendar date for your last donation.')
    lastDonationDate = new Date(value).toISOString()
  }
  const medicalDisclosure =
    typeof input.medicalDisclosure === 'string' ? input.medicalDisclosure.trim() : ''
  if (medicalDisclosure.length > 2000)
    throw new Error('Keep the medical disclosure under 2,000 characters.')
  if (input.hasMedicationHistory && !medicalDisclosure)
    throw new Error('Describe medication and relevant medical history for the hospital.')
  return {
    ageYears: input.ageYears,
    weightKg: input.weightKg,
    firstDonation: input.firstDonation as boolean,
    lastDonationDate,
    currentlyUnwell: input.currentlyUnwell as boolean,
    hasMedicationHistory: input.hasMedicationHistory as boolean,
    medicalDisclosure,
    recentAlcohol: input.recentAlcohol as boolean,
  }
}

export function policyReady(policy: DonationPolicy) {
  return !!(
    policy.enabled &&
    policy.reference?.trim() &&
    policy.minimumAge &&
    policy.maximumAge &&
    policy.maximumAge >= policy.minimumAge &&
    policy.minimumWeightKg &&
    policy.intervalDays &&
    policy.screeningValidityHours &&
    policy.alcoholWindowHours
  )
}

export function evaluateScreening(answers: EligibilityAnswers, policy: DonationPolicy): string[] {
  const reasons: string[] = []
  if (answers.ageYears < policy.minimumAge! || answers.ageYears > policy.maximumAge!)
    reasons.push(
      `The approved age range is ${policy.minimumAge}–${policy.maximumAge} years. Contact the blood centre for advice.`,
    )
  if (answers.weightKg < policy.minimumWeightKg!)
    reasons.push(
      `The approved minimum weight is ${policy.minimumWeightKg} kg. Do not attempt donation below this threshold.`,
    )
  if (answers.currentlyUnwell)
    reasons.push(
      'You reported illness or fever. Recover and consult a medical professional before resubmitting.',
    )
  if (answers.hasMedicationHistory)
    reasons.push(
      'Your medication or medical history requires clinical advice before proceeding. Do not stop prescribed medication to donate.',
    )
  if (answers.recentAlcohol)
    reasons.push(
      `You reported alcohol within the policy’s ${policy.alcoholWindowHours}-hour window. Wait and seek guidance from the hospital before resubmitting.`,
    )
  return reasons
}

export function calculateInterval(
  lastDonationDate: string | null,
  intervalDays: number,
  now = Date.now(),
) {
  const nextEligibleDate = lastDonationDate
    ? new Date(Date.parse(lastDonationDate) + intervalDays * DAY).toISOString()
    : null
  const remainingDays = nextEligibleDate
    ? Math.max(0, Math.ceil((Date.parse(nextEligibleDate) - now) / DAY))
    : 0
  return {
    lastDonationDate,
    nextEligibleDate,
    remainingDays,
    intervalComplete: remainingDays === 0,
  }
}

// Internal invariant reads include unavailable donors and all hospitals' history.
// Only the derived eligibility result is returned to an authorized caller.
export async function getEligibility(
  payload: Payload,
  donorId: User['id'],
  req?: PayloadRequest,
): Promise<Eligibility> {
  const [policy, screenings, history, declarations, active] = await Promise.all([
    payload.findGlobal({ slug: 'donation-policy', overrideAccess: true, req }),
    payload.find({
      collection: 'donor-screenings',
      where: { owner: { equals: donorId } },
      sort: '-createdAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'appointments',
      where: { and: [{ donor: { equals: donorId } }, { status: { equals: 'completed' } }] },
      sort: '-date',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'donor-screenings',
      where: { and: [{ owner: { equals: donorId } }, { lastDonationDate: { exists: true } }] },
      sort: '-lastDonationDate',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    }),
    payload.count({
      collection: 'appointments',
      where: {
        and: [
          { donor: { equals: donorId } },
          { status: { in: ['requested', 'scheduled', 'approved'] } },
        ],
      },
      overrideAccess: true,
      req,
    }),
  ])
  const latest = screenings.docs[0]
  const reasons: string[] = []
  let status: Eligibility['status'] = 'pending'
  if (!policyReady(policy))
    reasons.push(
      'The blood centre must configure an approved donation policy before requests can proceed.',
    )
  else if (!latest?.eligibilityVersion)
    reasons.push('Submit the mandatory eligibility screening to continue.')
  else if (Date.now() - Date.parse(latest.createdAt) >= policy.screeningValidityHours! * 3_600_000)
    reasons.push('Your screening has expired. Submit a fresh questionnaire.')
  else {
    try {
      reasons.push(
        ...evaluateScreening(
          parseEligibility(latest as unknown as Record<string, unknown>),
          policy,
        ),
      )
      status = reasons.length ? 'failed' : 'passed'
    } catch {
      reasons.push('Your screening is incomplete. Please submit it again.')
    }
  }
  // Never let a declaration erase or move a recorded donation backwards.
  const completed = history.docs.map((d) => d.completedAt || d.date)
  const declared = declarations.docs[0]?.lastDonationDate || null
  const lastDonationDate =
    [...completed, ...(declared ? [declared] : [])].sort(
      (a, b) => Date.parse(b) - Date.parse(a),
    )[0] || null
  if (latest && completed.some((d) => Date.parse(d) >= Date.parse(latest.createdAt))) {
    status = 'pending'
    reasons.push('A donation was completed after this screening. Submit a fresh questionnaire.')
  }
  const interval = policyReady(policy)
    ? calculateInterval(lastDonationDate, policy.intervalDays!)
    : { lastDonationDate, nextEligibleDate: null, remainingDays: null, intervalComplete: false }
  return {
    status,
    reasons,
    policy,
    ...interval,
    activeRequest: active.totalDocs > 0,
    canRequest: status === 'passed' && interval.intervalComplete && active.totalDocs === 0,
  }
}

export async function requireEligibility(
  payload: Payload,
  donorId: User['id'],
  req: PayloadRequest,
  creating = false,
) {
  const eligibility = await getEligibility(payload, donorId, req)
  if (eligibility.status !== 'passed')
    throw new Error(eligibility.reasons.join(' ') || 'Preliminary screening must pass first.')
  if (!eligibility.intervalComplete)
    throw new Error(
      `Wait until ${eligibility.nextEligibleDate?.slice(0, 10)} (${eligibility.remainingDays} days remaining).`,
    )
  if (creating && eligibility.activeRequest)
    throw new Error('You already have an active donation request or appointment.')
  return eligibility
}
