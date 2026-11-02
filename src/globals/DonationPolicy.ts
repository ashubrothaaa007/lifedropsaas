import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/lib/lifedrop-access'
import { policyReady } from '@/lib/donation-eligibility'

export const DonationPolicy: GlobalConfig = {
  slug: 'donation-policy',
  label: 'Approved donation policy',
  admin: {
    group: 'Operations',
    description:
      'Qualified medical governance must approve these rules for the supported whole-blood donation programme. Requests stay blocked until a complete policy is enabled. This is not a universal medical rule set.',
  },
  access: { read: () => true, update: adminOnly },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.enabled && !policyReady(data))
          throw new Error(
            'Provide every threshold and the approved policy reference before enabling requests.',
          )
        return data
      },
    ],
  },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'reference', type: 'text', label: 'Approved guideline / jurisdiction / donation type' },
    { name: 'minimumAge', type: 'number', min: 1, max: 120 },
    { name: 'maximumAge', type: 'number', min: 1, max: 120 },
    { name: 'minimumWeightKg', type: 'number', min: 1, max: 400 },
    {
      name: 'intervalDays',
      type: 'number',
      min: 1,
      max: 1000,
      label: 'Required whole-blood waiting period (days)',
    },
    { name: 'screeningValidityHours', type: 'number', min: 1, max: 168 },
    { name: 'alcoholWindowHours', type: 'number', min: 1, max: 168 },
  ],
}
