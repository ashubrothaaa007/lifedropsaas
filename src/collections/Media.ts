import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { refreshLifeDrop, deleteLifeDrop } from '@/lib/lifedrop-cache'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [refreshLifeDrop], afterDelete: [deleteLifeDrop] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
      return headers
    },
  },
}
