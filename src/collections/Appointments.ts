import type { CollectionConfig, AccessResult } from 'payload'
import { adminField, adminOnly, isAdmin, isAppUser, isStaff } from '@/lib/lifedrop-access'
import { calculateInterval, requireEligibility } from '@/lib/donation-eligibility'

const clinicalField = ({ req }: { req: import('payload').PayloadRequest }) => isStaff(req.user)
const idOf = (value: any) => (value && typeof value === 'object' ? value.id : value)

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: { group: 'Operations' },
  access: {
    create: ({ req }) => isStaff(req.user) || (isAppUser(req.user) && req.user!.role === 'donor'),
    read: ({ req }): AccessResult =>
      isAdmin(req.user)
        ? true
        : isAppUser(req.user)
          ? {
              or: [
                { donor: { equals: req.user!.id } },
                { 'hospital.owner': { equals: req.user!.id } },
                { 'request.receiver': { equals: req.user!.id } },
              ],
            }
          : false,
    update: ({ req }): AccessResult =>
      isAdmin(req.user)
        ? true
        : isStaff(req.user)
          ? { 'hospital.owner': { equals: req.user!.id } }
          : isAppUser(req.user) && req.user!.role === 'donor'
            ? { donor: { equals: req.user!.id } }
            : false,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        if (
          operation === 'update' &&
          ['completed', 'cancelled', 'rejected'].includes(originalDoc.status)
        )
          throw new Error('Closed donation records are immutable.')
        const donorRequest = isAppUser(req.user) && req.user!.role === 'donor'
        if (operation === 'update' && donorRequest) {
          if (data.status !== 'cancelled')
            throw new Error(
              'Donors may only cancel an active assessment, not approve or change eligibility.',
            )
          return { status: 'cancelled' }
        }
        if (operation === 'create') {
          if (donorRequest) data.donor = req.user!.id
          data.status = donorRequest ? 'requested' : 'scheduled'
          data.staffEligibilityVerified = false
          data.compatibilityVerified = false
          data.haemoglobin = null
          data.bloodPressure = null
          data.clinicalNotes = null
          data.approvedBy = null
          data.approvedAt = null
          data.completedAt = null
          data.nextEligibleDate = null
        }
        const merged = { ...originalDoc, ...data }
        if (merged.hospital) {
          const hospital = await req.payload.findByID({
            collection: 'hospitals',
            id: typeof merged.hospital === 'object' ? merged.hospital.id : merged.hospital,
            overrideAccess: false,
            user: req.user,
            req,
            depth: 0,
          })
          const owner = idOf(hospital.owner)
          const staff = owner
            ? await req.payload.findByID({
                collection: 'users',
                id: owner,
                depth: 0,
                overrideAccess: true,
                req,
              })
            : null
          if (!staff || !isStaff({ ...staff, collection: 'users' }))
            throw new Error('Select a partner hospital with authorized staff.')
          if (!donorRequest && (!isStaff(req.user) || owner !== req.user!.id))
            throw new Error('Only the assigned hospital may coordinate this appointment.')
        }
        if (merged.donor) {
          // Internal invariant check only; no private user fields leave this hook.
          const donor = await req.payload.findByID({
            collection: 'users',
            id: typeof merged.donor === 'object' ? merged.donor.id : merged.donor,
            overrideAccess: true,
            req,
          })
          if (donor.role !== 'donor') throw new Error('Select a donor account.')
          if (operation === 'create' && !donor.available)
            throw new Error('The donor is not currently available for coordination.')
        }
        if (merged.request && req.payload) {
          const bloodReq = await req.payload.findByID({
            collection: 'blood-requests',
            id: idOf(merged.request),
            overrideAccess: true,
            req,
            depth: 0,
          }).catch(() => null)
          if (!bloodReq) throw new Error('Blood request not found.')
          if (operation === 'create') {
            if (idOf(bloodReq.hospital) !== idOf(merged.hospital))
              throw new Error('Ensure the selected hospital matches the blood request hospital.')
            if (bloodReq.status === 'closed' || ((bloodReq as any).fulfilledUnits ?? 0) >= bloodReq.units)
              throw new Error('This blood request has already been fulfilled.')
          }
        }
        if (
          operation === 'create' ||
          merged.status === 'scheduled' ||
          merged.status === 'approved' ||
          merged.status === 'completed'
        ) {
          const eligibility = await requireEligibility(
            req.payload,
            idOf(merged.donor),
            req,
            operation === 'create',
          )
          if (operation === 'create') {
            if (!Number.isFinite(Date.parse(merged.date)) || Date.parse(merged.date) <= Date.now())
              throw new Error('Choose a future appointment time.')
            // The database rejects simultaneous attempts for the same donor.
            await req.payload.create({
              collection: 'donation-reservations',
              data: { donor: idOf(merged.donor) },
              overrideAccess: true,
              req,
            })
          }
          if (
            operation === 'update' &&
            merged.status === 'scheduled' &&
            originalDoc.status !== 'requested' &&
            originalDoc.status !== 'scheduled'
          )
            throw new Error('Only a pending assessment request can be confirmed.')
          if (merged.status === 'scheduled' && Date.parse(merged.date) <= Date.now())
            throw new Error('Choose a future confirmation time.')
          if (merged.status === 'approved') {
            if (!isStaff(req.user) || originalDoc.status !== 'scheduled')
              throw new Error('Only authorized hospital staff can approve a scheduled assessment.')
            if (Date.parse(merged.date) > Date.now())
              throw new Error(
                'Clinical approval must follow an in-person assessment, not a future appointment.',
              )
            if (
              !merged.staffEligibilityVerified ||
              !merged.compatibilityVerified ||
              !Number.isFinite(merged.haemoglobin) ||
              merged.haemoglobin < 1 ||
              merged.haemoglobin > 25 ||
              !/^\d{2,3}\/\d{2,3}$/.test(merged.bloodPressure || '') ||
              !merged.clinicalNotes?.trim()
            )
              throw new Error(
                'Record measured haemoglobin, blood pressure, other clinical findings, eligibility and compatibility checks.',
              )
            data.approvedBy = req.user!.id
            data.approvedAt = new Date().toISOString()
          }
          if (merged.status === 'completed') {
            if (!isStaff(req.user) || originalDoc.status !== 'approved' || !originalDoc.approvedBy)
              throw new Error(
                'Donation completion requires prior medical approval by authorized hospital staff.',
              )
            data.completedAt = new Date().toISOString()
            data.date = data.completedAt
            data.nextEligibleDate = calculateInterval(
              data.completedAt,
              eligibility.policy.intervalDays!,
            ).nextEligibleDate
            data.requiredIntervalDays = eligibility.policy.intervalDays
            data.policyReference = eligibility.policy.reference
            for (const field of [
              'haemoglobin',
              'bloodPressure',
              'clinicalNotes',
              'staffEligibilityVerified',
              'compatibilityVerified',
            ])
              data[field] = originalDoc[field]
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (
          ['completed', 'cancelled', 'rejected'].includes(doc.status) &&
          doc.status !== previousDoc?.status
        ) {
          await req.payload.delete({
            collection: 'donation-reservations',
            where: { donor: { equals: idOf(doc.donor) } },
            overrideAccess: true,
            req,
          })
        }
        if (!doc.request || !req.payload) return

        const reqId = idOf(doc.request)
        const donorId = idOf(doc.donor)

        if (doc.status === 'scheduled' && previousDoc?.status !== 'scheduled') {
          const bloodReq = await req.payload.findByID({
            collection: 'blood-requests',
            id: reqId,
            overrideAccess: true,
            req,
          }).catch(() => null)
          if (bloodReq && bloodReq.status === 'pending') {
            await req.payload.update({
              collection: 'blood-requests',
              id: reqId,
              overrideAccess: true,
              req,
              data: { status: 'coordinating' },
            }).catch(() => null)
          }
          await req.payload.update({
            collection: 'donor-responses',
            where: {
              and: [
                { donor: { equals: donorId } },
                { request: { equals: reqId } },
              ],
            },
            overrideAccess: true,
            req,
            data: { status: 'scheduled' } as any,
          }).catch(() => null)
        }

        if (doc.status === 'completed' && previousDoc?.status !== 'completed') {
          // Idempotent deterministic count of all completed donations for this request
          const completedCount = await req.payload.count({
            collection: 'appointments',
            where: {
              and: [
                { request: { equals: reqId } },
                { status: { equals: 'completed' } },
              ],
            },
            overrideAccess: true,
            req,
          })
          const bloodReq = await req.payload.findByID({
            collection: 'blood-requests',
            id: reqId,
            overrideAccess: true,
            req,
          }).catch(() => null)
          if (bloodReq) {
            const fulfilled = completedCount.totalDocs
            await req.payload.update({
              collection: 'blood-requests',
              id: reqId,
              overrideAccess: true,
              req,
              data: {
                fulfilledUnits: fulfilled,
                status: fulfilled >= bloodReq.units ? 'closed' : 'coordinating',
              } as any,
            })
          }
          await req.payload.update({
            collection: 'donor-responses',
            where: {
              and: [
                { donor: { equals: donorId } },
                { request: { equals: reqId } },
              ],
            },
            overrideAccess: true,
            req,
            data: { status: 'completed' } as any,
          }).catch(() => null)
          // Blood Inventory Safety: Do not automatically increment available hospital stock.
        }

        if (
          ['cancelled', 'rejected'].includes(doc.status) &&
          doc.status !== previousDoc?.status
        ) {
          await req.payload.update({
            collection: 'donor-responses',
            where: {
              and: [
                { donor: { equals: donorId } },
                { request: { equals: reqId } },
              ],
            },
            overrideAccess: true,
            req,
            data: { status: 'cancelled' } as any,
          }).catch(() => null)

          // Recalculate request progress and status safely
          const [completedCount, activeCount, bloodReq] = await Promise.all([
            req.payload.count({
              collection: 'appointments',
              where: {
                and: [
                  { request: { equals: reqId } },
                  { status: { equals: 'completed' } },
                ],
              },
              overrideAccess: true,
              req,
            }),
            req.payload.count({
              collection: 'appointments',
              where: {
                and: [
                  { request: { equals: reqId } },
                  { status: { in: ['requested', 'scheduled', 'approved'] } },
                ],
              },
              overrideAccess: true,
              req,
            }),
            req.payload.findByID({
              collection: 'blood-requests',
              id: reqId,
              overrideAccess: true,
              req,
            }).catch(() => null),
          ])
          if (bloodReq) {
            const fulfilled = completedCount.totalDocs
            let newStatus = bloodReq.status
            if (fulfilled >= bloodReq.units) {
              newStatus = 'closed'
            } else if (fulfilled > 0 || activeCount.totalDocs > 0) {
              newStatus = 'coordinating'
            } else {
              newStatus = 'pending'
            }
            await req.payload.update({
              collection: 'blood-requests',
              id: reqId,
              overrideAccess: true,
              req,
              data: {
                fulfilledUnits: fulfilled,
                status: newStatus,
              } as any,
            })
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (['requested', 'scheduled', 'approved'].includes(doc.status))
          await req.payload.delete({
            collection: 'donation-reservations',
            where: { donor: { equals: idOf(doc.donor) } },
            overrideAccess: true,
            req,
          })
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
      name: 'hospital',
      type: 'relationship',
      relationTo: 'hospitals',
      required: true,
      access: { update: adminField },
    },
    {
      name: 'request',
      type: 'relationship',
      relationTo: 'blood-requests',
      required: false,
      access: { update: adminField },
    },
    { name: 'date', type: 'date', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['requested', 'scheduled', 'approved', 'completed', 'cancelled', 'rejected'],
      defaultValue: 'requested',
      access: {
        create: clinicalField,
        update: ({ req }) =>
          isStaff(req.user) || (isAppUser(req.user) && req.user!.role === 'donor'),
      },
    },
    {
      name: 'haemoglobin',
      type: 'number',
      min: 1,
      max: 25,
      access: { create: clinicalField, update: clinicalField },
    },
    {
      name: 'staffEligibilityVerified',
      type: 'checkbox',
      defaultValue: false,
      access: { create: clinicalField, update: clinicalField },
    },
    {
      name: 'compatibilityVerified',
      type: 'checkbox',
      defaultValue: false,
      access: { create: clinicalField, update: clinicalField },
    },
    {
      name: 'bloodPressure',
      type: 'text',
      access: { create: clinicalField, update: clinicalField },
    },
    {
      name: 'clinicalNotes',
      type: 'textarea',
      access: { create: clinicalField, update: clinicalField },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
    },
    { name: 'approvedAt', type: 'date', access: { create: () => false, update: () => false } },
    { name: 'completedAt', type: 'date', access: { create: () => false, update: () => false } },
    {
      name: 'nextEligibleDate',
      type: 'date',
      access: { create: () => false, update: () => false },
    },
    {
      name: 'requiredIntervalDays',
      type: 'number',
      access: { create: () => false, update: () => false },
    },
    { name: 'policyReference', type: 'text', access: { create: () => false, update: () => false } },
  ],
}
