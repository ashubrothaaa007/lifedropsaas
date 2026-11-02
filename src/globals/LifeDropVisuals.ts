import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/lib/lifedrop-access'
import { refreshVisuals } from '@/lib/lifedrop-cache'

export const LifeDropVisuals: GlobalConfig = {
  slug: 'lifedrop-visuals',
  label: 'LifeDrop photography',
  access: { read: () => true, update: adminOnly },
  hooks: { afterChange: [refreshVisuals] },
  fields: [
    { name: 'elderPortrait', type: 'upload', relationTo: 'media' },
    { name: 'adultPortrait', type: 'upload', relationTo: 'media' },
    { name: 'childPortrait', type: 'upload', relationTo: 'media' },
    { name: 'aboutPhoto', type: 'upload', relationTo: 'media' },
  ],
}
