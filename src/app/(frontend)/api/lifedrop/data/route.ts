import { getPayload } from 'payload'
import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { bloodGroups, isStaff } from '@/lib/lifedrop-access'
import { requireJSON, safeUser, text, wholeNumber } from '@/lib/lifedrop-http'
import type { User, Hospital } from '@/payload-types'
import { getEligibility, parseEligibility } from '@/lib/donation-eligibility'

function publicHospital(hospital: string | number | Hospital | null | undefined) {
  return hospital && typeof hospital === 'object'
    ? { id: hospital.id, name: hospital.name, city: hospital.city, address: hospital.address }
    : hospital
}

export async function GET() {
  const user = await appAuth.currentUser()
  if (!user) return Response.json({ error: 'Please sign in to continue.' }, { status: 401 })
  const payload = await getPayload({ config })
  const [
    requests,
    responses,
    appointments,
    hospitals,
    inventory,
    donors,
    screenings,
    donationCount,
  ] = await Promise.all([
    user.role === 'receiver' ||
    isStaff(user) ||
    (user.role === 'donor' && user.available && user.bloodGroup)
      ? payload.find({
          collection: 'blood-requests',
          user,
          overrideAccess: false,
          depth: 1,
          limit: 100,
          sort: '-createdAt',
        })
      : { docs: [] },
    payload.find({
      collection: 'donor-responses',
      user,
      overrideAccess: false,
      depth: 1,
      limit: 100,
    }),
    payload.find({ collection: 'appointments', user, overrideAccess: false, depth: 1, limit: 100 }),
    payload.find({ collection: 'hospitals', user, overrideAccess: false, depth: 0, limit: 100 }),
    isStaff(user)
      ? payload.find({ collection: 'inventory', user, overrideAccess: false, depth: 0, limit: 100 })
      : { docs: [] },
    user.role === 'receiver' || isStaff(user)
      ? payload.find({
          collection: 'users',
          user,
          overrideAccess: false,
          where: { and: [{ role: { equals: 'donor' } }, { available: { equals: true } }] },
          select: { name: true, city: true, bloodGroup: true, available: true },
          limit: 100,
        })
      : { docs: [] },
    user.role === 'donor' || isStaff(user)
      ? payload.find({
          collection: 'donor-screenings',
          user,
          overrideAccess: false,
          depth: 0,
          limit: isStaff(user) ? 100 : 1,
          sort: '-createdAt',
        })
      : { docs: [] },
    user.role === 'donor'
      ? payload.count({
          collection: 'appointments',
          user,
          overrideAccess: false,
          where: { status: { equals: 'completed' } },
        })
      : null,
  ])
  const eligibility = user.role === 'donor' ? await getEligibility(payload, user.id) : null
  return Response.json(
    {
      user: safeUser(user),
      requests: requests.docs.map((r) => ({
        id: r.id,
        bloodGroup: r.bloodGroup,
        city: r.city,
        units: r.units,
        fulfilledUnits: (r as any).fulfilledUnits ?? 0,
        urgency: r.urgency,
        status: r.status,
        hospital: publicHospital(r.hospital),
        createdAt: r.createdAt,
      })),
      responses: responses.docs.map((r) => ({
        id: r.id,
        decision: r.decision,
        status: (r as any).status || (r.decision === 'accepted' ? 'interested' : 'cancelled'),
        request: r.request && typeof r.request === 'object' ? r.request.id : r.request,
        donor:
          r.donor && typeof r.donor === 'object'
            ? {
                id: r.donor.id,
                name: r.donor.name,
                bloodGroup: (r.donor as any).bloodGroup,
                city: (r.donor as any).city,
              }
            : r.donor,
      })),
      appointments: appointments.docs.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        nextEligibleDate: a.nextEligibleDate,
        completedAt: a.completedAt,
        approvedAt: a.approvedAt,
        hospital: publicHospital(a.hospital),
        request: (a as any).request && typeof (a as any).request === 'object' ? (a as any).request.id : (a as any).request,
        donor:
          a.donor && typeof a.donor === 'object' ? { id: a.donor.id, name: a.donor.name } : a.donor,
      })),
      hospitals: hospitals.docs.map((h) => ({
        ...(publicHospital(h) as object),
        ...(isStaff(user) ? { owner: typeof h.owner === 'object' ? h.owner?.id : h.owner } : {}),
      })),
      inventory: inventory.docs.map((i) => ({
        id: i.id,
        bloodGroup: i.bloodGroup,
        units: i.units,
      })),
      donors: donors.docs.map((d) => ({
        id: d.id,
        name: d.name,
        city: d.city,
        bloodGroup: d.bloodGroup,
        available: d.available,
      })),
      ...(user.role === 'donor'
        ? {
            donorStats: { totalDonations: donationCount?.totalDocs || 0 },
            eligibility,
          }
        : {}),
      ...(isStaff(user)
        ? {
            clinicalScreenings: screenings.docs.map((s) => ({
              donor: typeof s.owner === 'object' ? s.owner.id : s.owner,
              ageYears: s.ageYears,
              weightKg: s.weightKg,
              lastDonationDate: s.lastDonationDate,
              medicalDisclosure: s.medicalDisclosure,
              currentlyUnwell: s.currentlyUnwell,
              recentAlcohol: s.recentAlcohol,
              createdAt: s.createdAt,
              outcome: s.outcome,
            })),
          }
        : {}),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request) {
  const user = await appAuth.currentUser()
  if (!user)
    return Response.json(
      { error: 'Your session has expired. Please sign in again.' },
      { status: 401 },
    )
  try {
    requireJSON(request)
    const body = await request.json()
    const payload = await getPayload({ config })
    if (body.action === 'screening') {
      if (user.role !== 'donor') throw new Error('Only donor accounts can submit a pre-screening.')
      const answers = parseEligibility(body)
      if (body.answersConfirmed !== true)
        throw new Error('Confirm your answers and consent before submitting.')
      await payload.create({
        collection: 'donor-screenings',
        user,
        overrideAccess: false,
        data: { ...answers, answersConfirmed: true, owner: user.id },
      })
    } else if (body.action === 'assessment') {
      if (user.role !== 'donor') throw new Error('A donor account is required.')
      const date = new Date(body.date)
      if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
        throw new Error('Choose a future appointment time.')
      const apptData: Record<string, any> = {
        donor: user.id,
        hospital: text(body.hospital, 'Hospital') as any,
        date: date.toISOString(),
      }
      if (body.requestId) {
        apptData.request = text(body.requestId, 'Blood request') as any
      }
      await (payload.create as any)({
        collection: 'appointments',
        user,
        overrideAccess: false,
        data: apptData,
      })
      if (body.requestId) {
        await payload.update({
          collection: 'donor-responses',
          where: {
            and: [
              { donor: { equals: user.id } },
              { request: { equals: text(body.requestId, 'Blood request') } },
              { status: { equals: 'interested' } },
            ],
          },
          overrideAccess: true,
          data: { status: 'scheduled' } as any,
        }).catch(() => null)
      }
    } else if (
      ['confirm-assessment', 'cancel-assessment', 'reject-assessment'].includes(body.action)
    ) {
      if (!isStaff(user) && !(body.action === 'cancel-assessment' && user.role === 'donor'))
        throw new Error('Only authorized hospital staff can coordinate assessments.')
      const data =
        body.action === 'confirm-assessment'
          ? { status: 'scheduled' as const, date: new Date(body.date).toISOString() }
          : {
              status:
                body.action === 'cancel-assessment'
                  ? ('cancelled' as const)
                  : ('rejected' as const),
            }
      await payload.update({
        collection: 'appointments',
        id: text(body.id, 'Appointment'),
        data,
        user,
        overrideAccess: false,
      })
    } else if (body.action === 'profile') {
      const data: Partial<User> = {
        name: text(body.name, 'Name'),
        city: text(body.city, 'City', 80),
      }
      if (user.role === 'donor') {
        if (!bloodGroups.includes(body.bloodGroup)) throw new Error('Select a valid blood group.')
        data.bloodGroup = body.bloodGroup
        data.available = body.available === true
      }
      await payload.update({ collection: 'users', id: user.id, data, user, overrideAccess: false })
    } else if (body.action === 'request') {
      if (user.role !== 'receiver') throw new Error('Only receivers can create blood requests.')
      if (!bloodGroups.includes(body.bloodGroup)) throw new Error('Select a valid blood group.')
      const units = wholeNumber(body.units, 10)
      if (units < 1) throw new Error('At least one unit is required.')
      if (!['normal', 'emergency'].includes(body.urgency))
        throw new Error('Select a valid urgency.')
      await payload.create({
        collection: 'blood-requests',
        user,
        overrideAccess: false,
        data: {
          receiver: user.id,
          bloodGroup: body.bloodGroup,
          city: text(body.city, 'City', 80),
          units,
          urgency: body.urgency,
          hospital: text(body.hospital, 'Hospital') as any,
        },
      })
    } else if (body.action === 'respond') {
      if (user.role !== 'donor' || !['accepted', 'rejected'].includes(body.decision))
        throw new Error('Select a valid donor response.')
      await payload.create({
        collection: 'donor-responses',
        user,
        overrideAccess: false,
        data: {
          donor: user.id,
          request: text(body.requestId, 'Request') as any,
          decision: body.decision,
          status: body.decision === 'accepted' ? 'interested' : 'cancelled',
        } as any,
      })
    } else if (body.action === 'withdraw-response') {
      if (user.role !== 'donor') throw new Error('A donor account is required.')
      const reqId = text(body.requestId, 'Request ID')
      await payload.update({
        collection: 'donor-responses',
        where: {
          and: [
            { donor: { equals: user.id } },
            { request: { equals: reqId } },
            { status: { equals: 'interested' } },
          ],
        },
        user,
        overrideAccess: false,
        data: { status: 'withdrawn' } as any,
      })
    } else if (body.action === 'inventory') {
      if (!isStaff(user))
        throw new Error(
          'A verified hospital account is required. Contact LifeDrop for verification.',
        )
      const units = wholeNumber(body.units)
      if (body.id)
        await payload.update({
          collection: 'inventory',
          id: text(body.id, 'Inventory item'),
          data: { units },
          user,
          overrideAccess: false,
        })
      else {
        if (!bloodGroups.includes(body.bloodGroup)) throw new Error('Select a valid blood group.')
        const existing = await payload.find({
          collection: 'inventory',
          user,
          overrideAccess: false,
          where: { bloodGroup: { equals: body.bloodGroup } },
          limit: 1,
        })
        if (existing.docs.length)
          throw new Error('This group already has an inventory entry. Update that entry instead.')
        await payload.create({
          collection: 'inventory',
          user,
          overrideAccess: false,
          data: { owner: user.id, bloodGroup: body.bloodGroup, units },
        })
      }
    } else if (body.action === 'coordinate') {
      if (!isStaff(user) || !['pending', 'coordinating', 'closed'].includes(body.status))
        throw new Error('A verified hospital account and valid status are required.')
      await payload.update({
        collection: 'blood-requests',
        id: text(body.id, 'Request'),
        data: { status: body.status },
        user,
        overrideAccess: false,
      })
    } else if (body.action === 'schedule') {
      if (!isStaff(user)) throw new Error('Only a verified hospital can schedule donations.')
      const date = new Date(body.date)
      if (isNaN(date.getTime()) || date.getTime() < Date.now())
        throw new Error('Choose a future appointment time.')
      await payload.create({
        collection: 'appointments',
        user,
        overrideAccess: false,
        data: {
          donor: text(body.donor, 'Donor') as any,
          hospital: text(body.hospital, 'Hospital') as any,
          date: date.toISOString(),
        },
      })
    } else if (body.action === 'approve') {
      if (!isStaff(user)) throw new Error('Only verified hospital staff may approve a donation.')
      const haemoglobin = Number(body.haemoglobin)
      if (!Number.isFinite(haemoglobin) || haemoglobin < 1 || haemoglobin > 25)
        throw new Error('Enter the measured haemoglobin in g/dL.')
      if (body.staffEligibilityVerified !== true || body.compatibilityVerified !== true)
        throw new Error('Qualified staff must confirm eligibility and compatibility.')
      await payload.update({
        collection: 'appointments',
        id: text(body.id, 'Appointment'),
        user,
        overrideAccess: false,
        data: {
          status: 'approved',
          haemoglobin,
          bloodPressure: text(body.bloodPressure, 'Measured blood pressure', 20),
          clinicalNotes: text(body.clinicalNotes, 'Clinical findings', 2000),
          staffEligibilityVerified: true,
          compatibilityVerified: true,
        },
      })
    } else if (body.action === 'complete') {
      if (!isStaff(user))
        throw new Error('Only authorized hospital staff may record a completed donation.')
      if (body.donationCompleted !== true)
        throw new Error('Confirm that donation actually took place.')
      await payload.update({
        collection: 'appointments',
        id: text(body.id, 'Appointment'),
        user,
        overrideAccess: false,
        data: { status: 'completed' },
      })
    } else throw new Error('This action is not supported.')
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unable to save your changes.' },
      { status: 400 },
    )
  }
}
