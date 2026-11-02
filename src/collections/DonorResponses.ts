import type { CollectionConfig, AccessResult } from 'payload'
import { adminField, adminOnly, isAdmin, isAppUser, isStaff } from '@/lib/lifedrop-access'

export const DonorResponses: CollectionConfig = {
  slug: 'donor-responses',
  admin: { group: 'Operations' },
  access: {
    create: ({ req }) => isAdmin(req.user) || (isAppUser(req.user) && req.user!.role === 'donor'),
    read: ({ req }): AccessResult =>
      isAdmin(req.user)
        ? true
        : !isAppUser(req.user)
          ? false
          : req.user!.role === 'donor'
            ? { donor: { equals: req.user!.id } }
            : isStaff(req.user)
              ? { 'request.hospital.owner': { equals: req.user!.id } }
              : { 'request.receiver': { equals: req.user!.id } },
    update: ({ req }) => isAdmin(req.user) || (isAppUser(req.user) && req.user!.role === 'donor'),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        if (operation === 'update' && isAppUser(req.user) && req.user!.role === 'donor') {
          if (data.status !== 'withdrawn') {
            throw new Error('Donors may only withdraw pending interest before an appointment is scheduled.')
          }
          if (originalDoc.status && originalDoc.status !== 'interested') {
            throw new Error('You can only withdraw interest before an appointment is scheduled. Please cancel your appointment instead.')
          }
          return { status: 'withdrawn' }
        }
        if (operation === 'create' && isAppUser(req.user)) {
          data.donor = req.user!.id
          data.status = data.decision === 'accepted' ? 'interested' : 'cancelled'
          const request = await req.payload.findByID({
            collection: 'blood-requests',
            id: typeof data.request === 'object' ? data.request.id : data.request,
            overrideAccess: false,
            user: req.user,
            req,
          })
          if (
            !request.status ||
            !['pending', 'coordinating'].includes(request.status) ||
            request.bloodGroup !== req.user!.bloodGroup ||
            request.city !== req.user!.city ||
            !req.user!.available
          )
            throw new Error('This request is not available for your profile.')
          if (((request as unknown as { fulfilledUnits?: number }).fulfilledUnits ?? 0) >= request.units)
            throw new Error('This blood request has already been fulfilled.')
          const existing = await req.payload.find({
            collection: 'donor-responses',
            where: {
              and: [
                { donor: { equals: req.user!.id } },
                { request: { equals: typeof data.request === 'object' ? data.request.id : data.request } },
                { status: { in: ['interested', 'scheduled', 'completed'] } },
              ],
            },
            overrideAccess: false,
            user: req.user,
            req,
            limit: 1,
          })
          if (existing.totalDocs) throw new Error('You have already responded to this request.')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'donor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: { update: adminField },
    },
    {
      name: 'request',
      type: 'relationship',
      relationTo: 'blood-requests',
      required: true,
      access: { update: adminField },
    },
    { name: 'decision', type: 'select', options: ['accepted', 'rejected'], required: true },
    {
      name: 'status',
      type: 'select',
      options: ['interested', 'scheduled', 'completed', 'cancelled', 'withdrawn'],
      defaultValue: 'interested',
      required: false,
    },
  ],
}
