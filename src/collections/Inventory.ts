import type { CollectionConfig } from 'payload'
import {
  adminField,
  adminOnly,
  bloodGroups,
  isAdmin,
  isAppUser,
  isStaff,
  staffOwnRecord,
} from '@/lib/lifedrop-access'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
  admin: { group: 'Operations', useAsTitle: 'bloodGroup' },
  access: {
    read: staffOwnRecord,
    update: staffOwnRecord,
    create: ({ req }) => isAdmin(req.user) || isStaff(req.user),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && isAppUser(req.user)) data.owner = req.user!.id
        if (operation === 'create' && data.owner && data.bloodGroup) {
          const existing = await req.payload.find({
            collection: 'inventory',
            where: {
              and: [{ owner: { equals: data.owner } }, { bloodGroup: { equals: data.bloodGroup } }],
            },
            user: req.user,
            overrideAccess: false,
            req,
            limit: 1,
          })
          if (existing.totalDocs)
            throw new Error('This hospital already has a stock entry for this blood group.')
        }
        if (data.units !== undefined && !Number.isInteger(data.units))
          throw new Error('Units must be a whole number.')
        return data
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: { update: adminField },
    },
    {
      name: 'bloodGroup',
      type: 'select',
      options: bloodGroups,
      required: true,
      access: { update: adminField },
    },
    { name: 'units', type: 'number', min: 0, max: 10000, required: true },
  ],
}
