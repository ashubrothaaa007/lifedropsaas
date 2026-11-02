import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/lib/lifedrop-access'
import { refreshLifeDrop, deleteLifeDrop } from '@/lib/lifedrop-cache'

export const Hospitals: CollectionConfig = {
  slug: 'hospitals',
  admin: { useAsTitle: 'name', group: 'LifeDrop' },
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  hooks: { afterChange: [refreshLifeDrop], afterDelete: [deleteLifeDrop] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'address', type: 'text', required: true },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      access: { read: ({ req }) => !!req.user },
    },
    { name: 'shortName', type: 'text' },
  ],
}
