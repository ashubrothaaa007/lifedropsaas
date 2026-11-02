import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/lib/lifedrop-access'
import { refreshLifeDrop, deleteLifeDrop } from '@/lib/lifedrop-cache'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: { useAsTitle: 'title', group: 'LifeDrop' },
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  hooks: { afterChange: [refreshLifeDrop], afterDelete: [deleteLifeDrop] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'time', type: 'text', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'label', type: 'text' },
  ],
}
