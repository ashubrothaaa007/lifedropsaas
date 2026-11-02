import type { CollectionConfig, AccessResult } from 'payload'
import { adminOnly, isAdmin, isAppUser, isStaff } from '@/lib/lifedrop-access'
import { screeningQuestions } from '@/lib/donor-screening'
import { parseEligibility, evaluateScreening, policyReady } from '@/lib/donation-eligibility'

export const DonorScreenings: CollectionConfig = {
  slug: 'donor-screenings',
  admin: {
    group: 'Operations',
    useAsTitle: 'createdAt',
    description:
      'Private preliminary self-assessments. These records never constitute clinical approval.',
  },
  access: {
    create: ({ req }) => isAppUser(req.user) && req.user!.role === 'donor',
    read: async ({ req }): Promise<AccessResult> => {
      if (isAdmin(req.user)) return true
      if (isAppUser(req.user) && req.user!.role === 'donor')
        return { owner: { equals: req.user!.id } }
      if (isStaff(req.user)) {
        const appointments = await req.payload.find({
          collection: 'appointments',
          where: { status: { in: ['requested', 'scheduled', 'approved'] } },
          depth: 0,
          pagination: false,
          overrideAccess: false,
          user: req.user,
          req,
        })
        const ids = appointments.docs.map((a) =>
          typeof a.donor === 'object' ? a.donor.id : a.donor,
        )
        return { owner: { in: ids } }
      }
      return false
    },
    update: () => false,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data || !isAppUser(req.user) || req.user!.role !== 'donor')
          throw new Error('A donor account is required.')
        if (data.answersConfirmed !== true)
          throw new Error('Confirm your answers and consent before submitting.')
        const answers = parseEligibility(data)
        const policy = await req.payload.findGlobal({
          slug: 'donation-policy',
          overrideAccess: true,
          req,
        })
        const reasons = policyReady(policy)
          ? evaluateScreening(answers, policy)
          : ['Approved donation policy is pending.']
        return {
          ...data,
          ...answers,
          owner: req.user!.id,
          eligibilityVersion: 1,
          outcome: !policyReady(policy) ? 'pending' : reasons.length ? 'failed' : 'passed',
          explanation: reasons.join(' '),
          policySnapshot: {
            reference: policy.reference,
            minimumAge: policy.minimumAge,
            maximumAge: policy.maximumAge,
            minimumWeightKg: policy.minimumWeightKg,
            intervalDays: policy.intervalDays,
            screeningValidityHours: policy.screeningValidityHours,
            alcoholWindowHours: policy.alcoholWindowHours,
          },
          status: reasons.length ? 'discussion-needed' : 'submitted',
        }
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    ...screeningQuestions.map(({ key, title }) => ({
      name: key,
      label: title,
      type: 'checkbox' as const,
      defaultValue: false,
    })),
    { name: 'answersConfirmed', type: 'checkbox', defaultValue: false },
    { name: 'ageYears', type: 'number' },
    { name: 'weightKg', type: 'number' },
    { name: 'firstDonation', type: 'checkbox' },
    { name: 'lastDonationDate', type: 'date' },
    { name: 'hasMedicationHistory', type: 'checkbox' },
    { name: 'medicalDisclosure', type: 'textarea', maxLength: 2000 },
    {
      name: 'eligibilityVersion',
      type: 'number',
      access: { create: () => false, update: () => false },
    },
    {
      name: 'outcome',
      type: 'select',
      options: ['pending', 'passed', 'failed'],
      access: { create: () => false, update: () => false },
    },
    { name: 'explanation', type: 'textarea', access: { create: () => false, update: () => false } },
    { name: 'policySnapshot', type: 'json', access: { create: () => false, update: () => false } },
    {
      name: 'status',
      type: 'select',
      options: ['submitted', 'discussion-needed'],
      defaultValue: 'submitted',
      access: { create: () => false, update: () => false },
    },
  ],
}
