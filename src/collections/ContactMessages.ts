import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/lib/lifedrop-access'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: { group: 'LifeDrop', useAsTitle: 'name' },
  access: { create: () => true, read: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true, minLength: 10, maxLength: 2000 },
  ],
}
