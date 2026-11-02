import type { Access, AccessResult, CollectionConfig } from 'payload'
import {
  adminField,
  adminOnly,
  bloodGroups,
  isAdmin,
  isAppUser,
  isStaff,
} from '@/lib/lifedrop-access'

const requestRead: Access = ({ req }): AccessResult => {
  if (isAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  const user = req.user!
  if (user.role === 'receiver') return { receiver: { equals: user.id } }
  if (isStaff(user)) return { 'hospital.owner': { equals: user.id } }
  if (user.role === 'donor' && user.available && user.bloodGroup)
    return {
      and: [
        { bloodGroup: { equals: user.bloodGroup } },
        { city: { equals: user.city } },
        { status: { in: ['pending', 'coordinating'] } },
      ],
    }
  return false
}
export const BloodRequests: CollectionConfig = {
  slug: 'blood-requests',
  admin: { useAsTitle: 'bloodGroup', group: 'Operations' },
  access: {
    read: requestRead,
    create: ({ req }) =>
      isAdmin(req.user) || (isAppUser(req.user) && req.user!.role === 'receiver'),
    update: ({ req }) =>
      isAdmin(req.user)
        ? true
        : isStaff(req.user)
          ? { 'hospital.owner': { equals: req.user!.id } }
          : false,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && isAppUser(req.user)) {
          data.receiver = req.user!.id
          data.status = 'pending'
        }
        if (data.hospital) {
          const hospital = await req.payload.findByID({
            collection: 'hospitals',
            id: typeof data.hospital === 'object' ? data.hospital.id : data.hospital,
            req,
            overrideAccess: false,
            user: req.user,
          })
          if (!hospital) throw new Error('Select a registered hospital.')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'receiver',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        update: adminField,
        read: ({ req }) => isAdmin(req.user) || (isAppUser(req.user) && req.user!.role !== 'donor'),
      },
    },
    { name: 'bloodGroup', type: 'select', options: bloodGroups, required: true },
    { name: 'city', type: 'text', required: true, maxLength: 80 },
    { name: 'units', type: 'number', required: true, min: 1, max: 10 },
    {
      name: 'fulfilledUnits',
      type: 'number',
      min: 0,
      defaultValue: 0,
      required: false,
      access: {
        update: ({ req }) => isAdmin(req.user) || isStaff(req.user),
      },
    },
    {
      name: 'urgency',
      type: 'select',
      options: ['normal', 'emergency'],
      required: true,
      defaultValue: 'normal',
    },
    { name: 'hospital', type: 'relationship', relationTo: 'hospitals', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'coordinating', 'closed'],
      defaultValue: 'pending',
      access: { create: adminField, update: ({ req }) => isAdmin(req.user) || isStaff(req.user) },
    },
  ],
}
