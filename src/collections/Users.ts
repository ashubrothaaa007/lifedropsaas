import type { CollectionConfig, AccessResult } from 'payload'
import {
  adminField,
  adminOnly,
  bloodGroups,
  isAdmin,
  isAppUser,
  ownUser,
} from '@/lib/lifedrop-access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: { tokenExpiration: 7200 },
  admin: { useAsTitle: 'name', group: 'LifeDrop' },
  access: {
    admin: () => false,
    create: () => true,
    read: ({ req }): AccessResult => {
      if (isAdmin(req.user)) return true
      if (!isAppUser(req.user)) return false
      if (
        req.user!.role === 'receiver' ||
        (req.user!.role === 'hospital' && req.user!.hospitalVerified)
      )
        return {
          or: [
            { id: { equals: req.user!.id } },
            { and: [{ role: { equals: 'donor' } }, { available: { equals: true } }] },
          ],
        }
      return { id: { equals: req.user!.id } }
    },
    update: ownUser,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: ['donor', 'hospital', 'receiver'],
      saveToJWT: true,
      access: { update: adminField },
    },
    { name: 'city', type: 'text', required: true, maxLength: 80, index: true },
    { name: 'bloodGroup', type: 'select', options: bloodGroups, index: true },
    { name: 'available', type: 'checkbox', defaultValue: false },
    {
      name: 'hospitalVerified',
      type: 'checkbox',
      defaultValue: false,
      saveToJWT: true,
      access: { create: adminField, update: adminField },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      access: {
        read: ({ req, id }) => isAdmin(req.user) || (isAppUser(req.user) && req.user!.id === id),
      },
    },
  ],
}
