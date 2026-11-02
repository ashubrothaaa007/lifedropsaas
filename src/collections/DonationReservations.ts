import type { CollectionConfig } from 'payload'

// A database unique key, not a check-then-create query, serializes concurrent requests.
// Hooks create/release this reservation in the appointment's transaction.
export const DonationReservations: CollectionConfig = {
  slug: 'donation-reservations',
  admin: { hidden: true },
  access: { create: () => false, read: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'donor', type: 'relationship', relationTo: 'users', required: true, unique: true },
  ],
}
