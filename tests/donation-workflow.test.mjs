import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Load the actual collection hooks with TS path aliases resolved, without a database.
const source = await readFile(
  new URL('../src/collections/Appointments.ts', import.meta.url),
  'utf8',
)
const compiled = ts
  .transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  .outputText.replace(
    /from ['"]@\/([^'"]+)['"]/g,
    (_, path) => `from '${new URL('../src/' + path + '.ts', import.meta.url).href}'`,
  )
const { Appointments } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
)
const drSource = await readFile(
  new URL('../src/collections/DonorResponses.ts', import.meta.url),
  'utf8',
)
const drCompiled = ts
  .transpileModule(drSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  .outputText.replace(
    /from ['"]@\/([^'"]+)['"]/g,
    (_, path) => `from '${new URL('../src/' + path + '.ts', import.meta.url).href}'`,
  )
const { DonorResponses } = await import(
  'data:text/javascript;base64,' + Buffer.from(drCompiled).toString('base64')
)
const before = Appointments.hooks.beforeChange[0]
const after = Appointments.hooks.afterChange[0]
const drBefore = DonorResponses.hooks.beforeChange[0]
const donor = { collection: 'users', id: 'donor', role: 'donor', available: true }
const staff = { collection: 'users', id: 'staff', role: 'hospital', hospitalVerified: true }
const rules = {
  enabled: true,
  reference: 'Test policy',
  minimumAge: 18,
  maximumAge: 65,
  minimumWeightKg: 50,
  intervalDays: 120,
  screeningValidityHours: 24,
  alcoholWindowHours: 24,
}
const screening = {
  ageYears: 28,
  weightKg: 65,
  firstDonation: true,
  currentlyUnwell: false,
  hasMedicationHistory: false,
  recentAlcohol: false,
  medicalDisclosure: '',
  eligibilityVersion: 1,
  createdAt: new Date().toISOString(),
}
function request(user, { failed = false, active = 0, reservations = new Set() } = {}) {
  return {
    user,
    payload: {
      findGlobal: async () => rules,
      findByID: async ({ collection, id }) =>
        collection === 'hospitals'
          ? { id: 'hospital', owner: 'staff' }
          : id === 'staff'
            ? staff
            : donor,
      find: async (args) => ({
        docs:
          args.collection === 'donor-screenings' && args.sort !== '-lastDonationDate'
            ? [{ ...screening, currentlyUnwell: failed }]
            : [],
      }),
      count: async () => ({ totalDocs: active }),
      create: async ({ collection, data }) => {
        assert.equal(collection, 'donation-reservations')
        if (reservations.has(data.donor)) throw new Error('Unique donor reservation')
        reservations.add(data.donor)
        return { id: 'reservation' }
      },
      delete: async ({ collection, where }) => {
        assert.equal(collection, 'donation-reservations')
        reservations.delete(where.donor.equals)
      },
    },
  }
}
const future = () => new Date(Date.now() + 86_400_000).toISOString()
const base = () => ({ donor: 'donor', hospital: 'hospital', date: future() })

test('donor create forces own identity, pending assessment and no clinical approval', async () => {
  const result = await before({
    data: {
      ...base(),
      donor: 'other',
      status: 'completed',
      haemoglobin: 15,
      staffEligibilityVerified: true,
      approvedBy: 'staff',
    },
    operation: 'create',
    req: request(donor),
  })
  assert.equal(result.donor, donor.id)
  assert.equal(result.status, 'requested')
  assert.equal(result.haemoglobin, null)
  assert.equal(result.staffEligibilityVerified, false)
  assert.equal(result.approvedBy, null)
})
test('failed screening blocks even direct collection creates and staff confirmation', async () => {
  await assert.rejects(
    before({ data: base(), operation: 'create', req: request(donor, { failed: true }) }),
    /illness or fever/,
  )
  await assert.rejects(
    before({
      data: { status: 'scheduled', date: future() },
      originalDoc: { ...base(), status: 'requested' },
      operation: 'update',
      req: request(staff, { failed: true }),
    }),
    /illness or fever/,
  )
})
test('active appointment blocks creation; simultaneous creates require a unique reservation', async () => {
  await assert.rejects(
    before({ data: base(), operation: 'create', req: request(donor, { active: 1 }) }),
    /already have an active/,
  )
  const reservations = new Set()
  const attempts = await Promise.allSettled(
    [1, 2].map(() =>
      before({ data: base(), operation: 'create', req: request(donor, { reservations }) }),
    ),
  )
  assert.equal(attempts.filter((a) => a.status === 'fulfilled').length, 1)
  assert.equal(attempts.filter((a) => a.status === 'rejected').length, 1)
})
test('donors cannot approve or alter a scheduled assessment', async () => {
  await assert.rejects(
    before({
      data: { status: 'approved' },
      originalDoc: { ...base(), status: 'scheduled' },
      operation: 'update',
      req: request(donor),
    }),
    /Donors may only cancel/,
  )
})
test('another verified hospital cannot approve an assigned hospital appointment', async () => {
  await assert.rejects(
    before({
      data: { status: 'approved' },
      originalDoc: { ...base(), status: 'scheduled' },
      operation: 'update',
      req: request({ ...staff, id: 'other-staff' }),
    }),
    /Only the assigned hospital/,
  )
})
test('clinical approval requires measured parameters, checks and an actual assessment time', async () => {
  const originalDoc = {
    ...base(),
    status: 'scheduled',
    date: new Date(Date.now() - 1000).toISOString(),
  }
  await assert.rejects(
    before({ data: { status: 'approved' }, originalDoc, operation: 'update', req: request(staff) }),
    /Record measured/,
  )
  const data = {
    status: 'approved',
    haemoglobin: 14,
    bloodPressure: '120/80',
    clinicalNotes: 'In-person findings recorded',
    staffEligibilityVerified: true,
    compatibilityVerified: true,
  }
  const result = await before({ data, originalDoc, operation: 'update', req: request(staff) })
  assert.equal(result.approvedBy, staff.id)
  assert.ok(result.approvedAt)
  await assert.rejects(
    before({
      data,
      originalDoc: { ...originalDoc, date: future() },
      operation: 'update',
      req: request(staff),
    }),
    /in-person assessment/,
  )
})
test('completion without prior medical approval is forbidden; approved completion records next eligibility', async () => {
  const originalDoc = { ...base(), status: 'scheduled' }
  await assert.rejects(
    before({
      data: { status: 'completed' },
      originalDoc,
      operation: 'update',
      req: request(staff),
    }),
    /prior medical approval/,
  )
  const result = await before({
    data: { status: 'completed' },
    originalDoc: { ...originalDoc, status: 'approved', approvedBy: 'staff', haemoglobin: 14 },
    operation: 'update',
    req: request(staff),
  })
  assert.equal(
    Date.parse(result.nextEligibleDate) - Date.parse(result.completedAt),
    120 * 86_400_000,
  )
  assert.equal(result.requiredIntervalDays, 120)
  assert.equal(result.policyReference, rules.reference)
})
test('cancellation cannot change medical fields and releases the active reservation', async () => {
  const reservations = new Set(['donor'])
  const req = request(donor, { reservations })
  const result = await before({
    data: { status: 'cancelled', haemoglobin: 20 },
    originalDoc: { ...base(), status: 'requested' },
    operation: 'update',
    req,
  })
  assert.deepEqual(result, { status: 'cancelled' })
  await after({
    doc: { donor: 'donor', status: 'cancelled' },
    previousDoc: { status: 'requested' },
    req,
  })
  assert.equal(reservations.size, 0)
})
test('completed donation records cannot be rewritten', async () => {
  await assert.rejects(
    before({
      data: { status: 'scheduled' },
      originalDoc: { ...base(), status: 'completed' },
      operation: 'update',
      req: request(staff),
    }),
    /immutable/,
  )
})

test('linking appointment to blood request validates hospital match and request availability', async () => {
  const req = request(donor)
  const origFindByID = req.payload.findByID
  req.payload.findByID = async ({ collection, id }) => {
    if (collection === 'blood-requests') {
      if (id === 'req-closed') return { id: 'req-closed', hospital: 'hospital', status: 'closed', units: 1, fulfilledUnits: 1 }
      if (id === 'req-diff-hosp') return { id: 'req-diff-hosp', hospital: 'other-hospital', status: 'pending', units: 2, fulfilledUnits: 0 }
      return { id: 'req-1', hospital: 'hospital', status: 'pending', units: 3, fulfilledUnits: 0 }
    }
    return origFindByID({ collection, id })
  }

  // Mismatched hospital rejects
  await assert.rejects(
    before({
      data: { ...base(), request: 'req-diff-hosp' },
      operation: 'create',
      req,
    }),
    /matches the blood request hospital/,
  )

  // Already closed or fulfilled rejects
  await assert.rejects(
    before({
      data: { ...base(), request: 'req-closed' },
      operation: 'create',
      req,
    }),
    /already been fulfilled/,
  )

  // Valid matching request succeeds
  const res = await before({
    data: { ...base(), request: 'req-1' },
    operation: 'create',
    req,
  })
  assert.equal(res.request, 'req-1')
})

test('multiple donors and partial fulfillment tracking in afterChange', async () => {
  const updates = []
  const req = {
    user: staff,
    payload: {
      count: async () => ({ totalDocs: 1 }),
      findByID: async ({ collection }) => {
        if (collection === 'blood-requests') {
          return { id: 'req-multi', units: 3, fulfilledUnits: 0, status: 'pending' }
        }
        return null
      },
      update: async ({ collection, id, data, where }) => {
        updates.push({ collection, id, data, where })
        return {}
      },
      delete: async () => {},
    },
  }

  await after({
    doc: { id: 'apt-1', request: 'req-multi', donor: 'donor-1', status: 'completed' },
    previousDoc: { status: 'approved' },
    req,
  })

  // Blood request updated to coordinating with fulfilledUnits = 1 (1/3 fulfilled)
  const reqUpdate = updates.find((u) => u.collection === 'blood-requests')
  assert.ok(reqUpdate, 'blood-requests should be updated')
  assert.equal(reqUpdate.data.fulfilledUnits, 1)
  assert.equal(reqUpdate.data.status, 'coordinating')

  // Donor response updated to completed
  const respUpdate = updates.find((u) => u.collection === 'donor-responses')
  assert.ok(respUpdate, 'donor-responses should be updated')
  assert.equal(respUpdate.data.status, 'completed')

  // Blood inventory safety: no inventory collection updates
  const inventoryUpdate = updates.find((u) => u.collection === 'inventory')
  assert.equal(inventoryUpdate, undefined, 'Inventory must not be auto-updated')
})

test('full fulfillment automatically closes blood request when all required units are completed', async () => {
  const updates = []
  const req = {
    user: staff,
    payload: {
      count: async () => ({ totalDocs: 3 }),
      findByID: async ({ collection }) => {
        if (collection === 'blood-requests') {
          return { id: 'req-multi', units: 3, fulfilledUnits: 2, status: 'coordinating' }
        }
        return null
      },
      update: async (args) => {
        updates.push(args)
        return {}
      },
      delete: async () => {},
    },
  }

  await after({
    doc: { id: 'apt-3', request: 'req-multi', donor: 'donor-3', status: 'completed' },
    previousDoc: { status: 'approved' },
    req,
  })

  const reqUpdate = updates.find((u) => u.collection === 'blood-requests')
  assert.ok(reqUpdate)
  assert.equal(reqUpdate.data.fulfilledUnits, 3)
  assert.equal(reqUpdate.data.status, 'closed')
})

test('idempotent completion count ensures retry does not double increment fulfillment', async () => {
  const updates = []
  const req = {
    user: staff,
    payload: {
      count: async () => ({ totalDocs: 2 }),
      findByID: async () => ({ id: 'req-multi', units: 3, fulfilledUnits: 2, status: 'coordinating' }),
      update: async (args) => {
        updates.push(args)
        return {}
      },
      delete: async () => {},
    },
  }

  await after({
    doc: { id: 'apt-2', request: 'req-multi', donor: 'donor-2', status: 'completed' },
    previousDoc: { status: 'approved' },
    req,
  })
  await after({
    doc: { id: 'apt-2', request: 'req-multi', donor: 'donor-2', status: 'completed' },
    previousDoc: { status: 'approved' },
    req,
  })

  const reqUpdates = updates.filter((u) => u.collection === 'blood-requests')
  for (const u of reqUpdates) {
    assert.equal(u.data.fulfilledUnits, 2)
  }
})

test('cancellation handling releases reservation, updates donor response, and preserves other active appointments', async () => {
  const updates = []
  const deletedReservations = []
  const req = {
    user: donor,
    payload: {
      count: async ({ where }) => {
        const isCompletedQuery = JSON.stringify(where).includes('completed')
        return { totalDocs: isCompletedQuery ? 1 : 1 }
      },
      findByID: async () => ({ id: 'req-multi', units: 3, fulfilledUnits: 1, status: 'coordinating' }),
      update: async (args) => {
        updates.push(args)
        return {}
      },
      delete: async ({ collection, where }) => {
        if (collection === 'donation-reservations') {
          deletedReservations.push(where.donor.equals)
        }
      },
    },
  }

  await after({
    doc: { id: 'apt-2', request: 'req-multi', donor: 'donor-2', status: 'cancelled' },
    previousDoc: { status: 'scheduled' },
    req,
  })

  assert.ok(deletedReservations.includes('donor-2'))

  const respUpdate = updates.find((u) => u.collection === 'donor-responses')
  assert.ok(respUpdate)
  assert.equal(respUpdate.data.status, 'cancelled')

  const reqUpdate = updates.find((u) => u.collection === 'blood-requests')
  assert.ok(reqUpdate)
  assert.equal(reqUpdate.data.status, 'coordinating')
  assert.equal(reqUpdate.data.fulfilledUnits, 1)
})

test('cancellation when no other active or completed appointments reverts request to pending', async () => {
  const updates = []
  const req = {
    user: donor,
    payload: {
      count: async () => ({ totalDocs: 0 }),
      findByID: async () => ({ id: 'req-single', units: 1, fulfilledUnits: 0, status: 'coordinating' }),
      update: async (args) => {
        updates.push(args)
        return {}
      },
      delete: async () => {},
    },
  }

  await after({
    doc: { id: 'apt-1', request: 'req-single', donor: 'donor-1', status: 'cancelled' },
    previousDoc: { status: 'scheduled' },
    req,
  })

  const reqUpdate = updates.find((u) => u.collection === 'blood-requests')
  assert.ok(reqUpdate)
  assert.equal(reqUpdate.data.status, 'pending')
  assert.equal(reqUpdate.data.fulfilledUnits, 0)
})

test('donor response lifecycle: interest registration, withdrawal before appointment, and withdrawal restriction', async () => {
  const donorUser = { collection: 'users', id: 'donor-1', role: 'donor', bloodGroup: 'O+', city: 'Mumbai', available: true }
  const receiverUser = { collection: 'users', id: 'receiver-1', role: 'receiver' }

  // 1. Create response with decision 'accepted' -> status 'interested'
  const createReq = {
    user: donorUser,
    payload: {
      findByID: async () => ({ id: 'req-1', status: 'pending', bloodGroup: 'O+', city: 'Mumbai', units: 2, fulfilledUnits: 0 }),
      find: async () => ({ totalDocs: 0, docs: [] }),
    },
  }
  const createResult = await drBefore({
    data: { request: 'req-1', decision: 'accepted' },
    operation: 'create',
    req: createReq,
  })
  assert.equal(createResult.donor, 'donor-1')
  assert.equal(createResult.status, 'interested')

  // 2. Withdrawal before appointment is scheduled -> succeeds
  const withdrawResult = await drBefore({
    data: { status: 'withdrawn' },
    originalDoc: { id: 'resp-1', donor: 'donor-1', request: 'req-1', decision: 'accepted', status: 'interested' },
    operation: 'update',
    req: { user: donorUser },
  })
  assert.equal(withdrawResult.status, 'withdrawn')

  // 3. Withdrawal when already scheduled -> rejected
  await assert.rejects(
    drBefore({
      data: { status: 'withdrawn' },
      originalDoc: { id: 'resp-1', donor: 'donor-1', request: 'req-1', decision: 'accepted', status: 'scheduled' },
      operation: 'update',
      req: { user: donorUser },
    }),
    /You can only withdraw interest before an appointment is scheduled/,
  )

  // 4. Donor attempting arbitrary status update -> rejected
  await assert.rejects(
    drBefore({
      data: { status: 'completed' },
      originalDoc: { id: 'resp-1', donor: 'donor-1', request: 'req-1', decision: 'accepted', status: 'interested' },
      operation: 'update',
      req: { user: donorUser },
    }),
    /Donors may only withdraw pending interest/,
  )

  // 5. Access check: receiver cannot update donor response
  const canReceiverUpdate = DonorResponses.access.update({ req: { user: receiverUser } })
  assert.equal(canReceiverUpdate, false)

  // 6. Access check: donor cannot update other donor's appointment
  const canDonorUpdateApt = Appointments.access.update({ req: { user: donorUser } })
  assert.deepEqual(canDonorUpdateApt, { donor: { equals: 'donor-1' } })
})
