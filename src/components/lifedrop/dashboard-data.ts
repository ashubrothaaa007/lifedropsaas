// UI-only, non-persistent scenarios. These never substitute for live Payload records.
export type * from '@/types'
import type {
  Role,
  Profile,
  Hospital,
  BloodRequest,
  Donor,
  Appointment,
  Stock,
  ResponseRecord,
  QuarantineUnit,
  DonationRecord,
  HospitalProfileData,
  HospitalNotification,
  ReceiverNotification,
  ReceiverProfileData,
  DashboardData,
  Eligibility,
  ScreeningRecord,
} from '@/types'
export const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const relationId = (r: { id: string } | string) => (typeof r === 'string' ? r : r?.id || '')
export const hospitalName = (h: Hospital | string) =>
  h && typeof h === 'object' ? h.name : 'Partner hospital'
export function demoScenario(role: Role): DashboardData {
  const hospitals = [
    {
      id: 'demo-h1',
      name: 'Apollo Hospitals',
      city: 'Mumbai',
      address: '154, Saki Vihar Road, Andheri East, Mumbai',
    },
    {
      id: 'demo-h2',
      name: 'Fortis Healthcare',
      city: 'Mumbai',
      address: 'Mulund Goregaon Link Road, Mulund West, Mumbai',
    },
    {
      id: 'demo-h3',
      name: 'Lilavati Hospital & Research Centre',
      city: 'Mumbai',
      address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    },
    {
      id: 'demo-h4',
      name: 'Max Healthcare',
      city: 'New Delhi',
      address: 'Press Enclave Road, Saket, New Delhi',
    },
  ]
  const donors = [
    { id: 'demo-d1', name: 'Arjun Mehta', city: 'Mumbai', bloodGroup: 'O+', available: true },
    { id: 'demo-d2', name: 'Priya Desai', city: 'Mumbai', bloodGroup: 'A+', available: true },
    { id: 'demo-d3', name: 'Rahul Kapoor', city: 'Pune', bloodGroup: 'B+', available: true },
    { id: 'demo-d4', name: 'Sneha Iyer', city: 'Mumbai', bloodGroup: 'O-', available: true },
    { id: 'demo-d5', name: 'Vikram Singh', city: 'New Delhi', bloodGroup: 'AB+', available: true },
    { id: 'demo-d6', name: 'Ananya Shah', city: 'Mumbai', bloodGroup: 'O+', available: true },
  ]
  return {
    ...(role === 'donor'
      ? {
          eligibility: {
            status: 'passed',
            reasons: [
              '120-day whole-blood interval satisfied. You are eligible for preliminary assessment.',
            ],
            policy: {
              enabled: true,
              reference: 'Illustrative whole-blood policy · Clinical verification at hospital',
              minimumAge: 18,
              maximumAge: 65,
              minimumWeightKg: 50,
              intervalDays: 120,
              screeningValidityHours: 24,
              alcoholWindowHours: 24,
            },
            lastDonationDate: new Date(Date.now() - 125 * 86400000).toISOString(),
            nextEligibleDate: new Date().toISOString(),
            remainingDays: 0,
            intervalComplete: true,
            activeRequest: false,
            canRequest: true,
          } satisfies Eligibility,
        }
      : {}),
    user: {
      id: role === 'donor' ? 'demo-d1' : `demo-${role}`,
      name:
        role === 'donor' ? 'Arjun Mehta' : role === 'hospital' ? 'Apollo Hospitals' : 'Riya Sharma',
      email: `${role}@lifedrop.example`,
      role,
      city: 'Mumbai',
      bloodGroup: 'O+',
      available: true,
      hospitalVerified: role === 'hospital',
    },
    hospitals,
    donors,
    donorStats: {
      totalDonations: 2,
    },
    requests:
      role === 'hospital'
        ? [
            {
              id: 'demo-r1',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 0,
              urgency: 'emergency',
              status: 'pending',
              hospital: hospitals[0], // Apollo Hospitals
              createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
            },
            {
              id: 'demo-r2',
              bloodGroup: 'O-',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 0,
              urgency: 'emergency',
              status: 'pending',
              hospital: hospitals[0], // Apollo Hospitals
              createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
              id: 'demo-r3',
              bloodGroup: 'A+',
              city: 'Mumbai',
              units: 3,
              fulfilledUnits: 1,
              urgency: 'normal',
              status: 'coordinating',
              hospital: hospitals[0], // Apollo Hospitals
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'demo-r4',
              bloodGroup: 'B+',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 2,
              urgency: 'normal',
              status: 'closed',
              hospital: hospitals[0], // Apollo Hospitals
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
          ]
        : role === 'receiver'
        ? [
            {
              id: 'demo-r3',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 3,
              fulfilledUnits: 1,
              urgency: 'normal',
              status: 'coordinating',
              hospital: hospitals[2], // Lilavati Hospital
              patientName: 'Aarav Sharma',
              ward: 'Cardiac ICU Ward 4',
              bedNumber: 'Bed 402',
              attendingPhysician: 'Dr. Suresh Mehta, MD (Cardiology)',
              requiredDate: new Date(Date.now() + 86400000).toISOString(),
              primaryContact: '+91 98201 55432',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              notes: 'Required for scheduled cardiac repair procedure. 1 unit already verified.',
            },
            {
              id: 'demo-r1',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 0,
              urgency: 'emergency',
              status: 'pending',
              hospital: hospitals[0], // Apollo Hospitals
              patientName: 'Riya Sharma',
              ward: 'Trauma OT',
              bedNumber: 'OT-2',
              attendingPhysician: 'Dr. K. S. Mukherjee, MS (Trauma)',
              requiredDate: new Date(Date.now() + 6 * 3600000).toISOString(),
              primaryContact: '+91 98201 55432',
              createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
              notes: 'Emergency reserve requirement following acute blood loss.',
            },
            {
              id: 'demo-r4',
              bloodGroup: 'B+',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 2,
              urgency: 'normal',
              status: 'closed',
              hospital: hospitals[0], // Apollo Hospitals
              patientName: 'Sunil Sharma',
              ward: 'Orthopedic Ward',
              bedNumber: 'Ward 3, Bed 12',
              attendingPhysician: 'Dr. A. Verma, MS (Ortho)',
              requiredDate: new Date(Date.now() - 2 * 86400000).toISOString(),
              primaryContact: '+91 98201 55432',
              createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              notes: 'Post-operative recovery completed. Transfusions fulfilled successfully.',
            },
          ]
        : [
            {
              id: 'demo-r1',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 2,
              fulfilledUnits: 0,
              urgency: 'emergency',
              status: 'pending',
              hospital: hospitals[0], // Apollo Hospitals
              createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
            },
            {
              id: 'demo-r2',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 1,
              fulfilledUnits: 0,
              urgency: 'normal',
              status: 'pending',
              hospital: hospitals[1], // Fortis Healthcare
              createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
            },
            {
              id: 'demo-r3',
              bloodGroup: 'O+',
              city: 'Mumbai',
              units: 3,
              fulfilledUnits: 1,
              urgency: 'normal',
              status: 'coordinating',
              hospital: hospitals[2], // Lilavati Hospital
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
    appointments:
      role === 'hospital'
        ? [
            {
              id: 'demo-a1',
              donor: donors[0], // Arjun Mehta (O+)
              hospital: hospitals[0], // Apollo Hospitals
              request: 'demo-r1',
              date: new Date(Date.now() + 15 * 60000).toISOString(),
              status: 'scheduled',
            },
            {
              id: 'demo-a2',
              donor: donors[3], // Sneha Iyer (O-)
              hospital: hospitals[0], // Apollo Hospitals
              request: 'demo-r2',
              date: new Date(Date.now() + 90 * 60000).toISOString(),
              status: 'requested',
            },
            {
              id: 'demo-a3',
              donor: donors[2], // Rahul Kapoor (B+)
              hospital: hospitals[0], // Apollo Hospitals
              request: 'demo-r4',
              date: new Date(Date.now() - 30 * 60000).toISOString(),
              status: 'approved',
              approvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
              id: 'demo-a4',
              donor: donors[1], // Priya Desai (A+)
              hospital: hospitals[0], // Apollo Hospitals
              request: 'demo-r3',
              date: new Date(Date.now() - 86400000).toISOString(),
              completedAt: new Date(Date.now() - 86400000).toISOString(),
              nextEligibleDate: new Date(Date.now() + 119 * 86400000).toISOString(),
              status: 'completed',
            },
          ]
        : [
            {
              id: 'demo-a1',
              donor: donors[0], // Arjun Mehta
              hospital: hospitals[2], // Lilavati Hospital
              request: 'demo-r3',
              date: new Date(Date.now() + 2 * 86400000 + 3600000 * 2.5).toISOString(), // in ~2 days at 10:30 AM
              status: 'scheduled',
            },
            {
              id: 'demo-a2',
              donor: donors[0],
              hospital: hospitals[0], // Apollo Hospitals
              date: new Date(Date.now() - 125 * 86400000).toISOString(),
              completedAt: new Date(Date.now() - 125 * 86400000).toISOString(),
              nextEligibleDate: new Date(Date.now() - 5 * 86400000).toISOString(),
              status: 'completed',
            },
            {
              id: 'demo-a3',
              donor: donors[0],
              hospital: hospitals[1], // Fortis Healthcare
              date: new Date(Date.now() - 250 * 86400000).toISOString(),
              completedAt: new Date(Date.now() - 250 * 86400000).toISOString(),
              nextEligibleDate: new Date(Date.now() - 130 * 86400000).toISOString(),
              status: 'completed',
            },
          ],
    inventory: groups.map((bloodGroup, i) => ({
      id: `demo-i${i}`,
      bloodGroup,
      units:
        role === 'hospital'
          ? [28, 8, 34, 5, 15, 3, 22, 3][i]
          : [28, 8, 34, 5, 15, 3, 42, 6][i],
    })),
    quarantineUnits: [
      {
        id: 'UNIT-8821',
        donorName: 'Priya Desai',
        bloodGroup: 'A+',
        volume: 450,
        collectionDate: new Date(Date.now() - 86400000).toISOString(),
        bagSerial: 'BAG-8821-A+',
        screening: {
          hiv: 'pending',
          hbv: 'pending',
          hcv: 'pending',
          syphilis: 'pending',
          malaria: 'pending',
        },
        components: {
          prbc: false,
          ffp: false,
          platelets: false,
        },
        status: 'in-testing',
        notes: 'Awaiting mandatory serology / viral clearance panel.',
      },
    ],
    donationRecords: [
      {
        id: 'DN-2026-8821',
        donorName: 'Priya Desai',
        bloodGroup: 'A+',
        collectionDate: new Date(Date.now() - 86400000).toISOString(),
        hemoglobin: 14.1,
        bpSystolic: 118,
        bpDiastolic: 78,
        bagSerial: 'BAG-8821-A+',
        volume: 450,
        clinicalOfficer: 'Dr. Sunita Rao, MBBS',
        quarantineStatus: 'in-testing',
        appointmentId: 'demo-a4',
      },
    ],
    hospitalProfile: {
      name: 'Apollo Hospitals',
      licenseNumber: 'MH-BB-2024-8901',
      address: '154, Saki Vihar Road, Andheri East, Mumbai, Maharashtra 400072',
      city: 'Mumbai',
      hotline: '+91 22 2826 3000 / +91 98200 12345',
      medicalOfficer: 'Dr. K. S. Mukherjee, MD (Pathology / Transfusion Medicine)',
      operatingHours: '24/7 Transfusion & Blood Bank Service',
      verified: true,
    },
    hospitalNotifications: [
      {
        id: 'notif-1',
        type: 'emergency',
        title: 'Critical Deficit: O- Blood Stock',
        message: 'O- Negative reserve is at 3 units (below safe threshold of 5). Immediate donor coordination needed.',
        timestamp: '10 min ago',
        read: false,
        linkTarget: 'inventory',
      },
      {
        id: 'notif-2',
        type: 'appointment',
        title: 'Assessment Slot Requested',
        message: 'Sneha Iyer (O-) requested an appointment slot for patient emergency request #demo-r2.',
        timestamp: '25 min ago',
        read: false,
        linkTarget: 'appointments',
      },
      {
        id: 'notif-3',
        type: 'emergency',
        title: 'Emergency Blood Need Broadcast',
        message: 'Trauma OT posted 2 units O+ request for Emergency Cardiac Surgery.',
        timestamp: '45 min ago',
        read: false,
        linkTarget: 'requests',
      },
      {
        id: 'notif-4',
        type: 'lab',
        title: 'Laboratory Quarantine Pending',
        message: 'Unit UNIT-8821 (A+, 450ml) ready for infectious disease viral screening panel.',
        timestamp: '1 hour ago',
        read: true,
        linkTarget: 'quality',
      },
    ],
    receiverProfile: {
      name: 'Riya Sharma',
      primaryPhone: '+91 98201 55432',
      secondaryPhone: '+91 98200 99887',
      relationship: 'Mother / Primary Caregiver',
      city: 'Mumbai',
      email: 'receiver@lifedrop.example',
      communicationPref: 'app',
    },
    receiverNotifications: [
      {
        id: 'rnotif-1',
        type: 'completed',
        title: 'Donation Completed & Verified',
        message: 'Priya Desai completed blood collection at Lilavati Hospital. 1 unit fulfilled for Aarav Sharma.',
        timestamp: '2 hours ago',
        read: false,
        requestId: 'demo-r3',
      },
      {
        id: 'rnotif-2',
        type: 'appointment',
        title: 'Assessment Slot Scheduled',
        message: 'Lilavati Hospital scheduled an assessment slot with volunteer donor Arjun Mehta.',
        timestamp: '3 hours ago',
        read: false,
        requestId: 'demo-r3',
      },
      {
        id: 'rnotif-3',
        type: 'emergency',
        title: 'Emergency Request Published',
        message: 'Emergency request for Riya Sharma (2 units O+) is live at Apollo Hospitals.',
        timestamp: '45 mins ago',
        read: false,
        requestId: 'demo-r1',
      },
      {
        id: 'rnotif-4',
        type: 'fulfilled',
        title: 'Request Fully Closed',
        message: 'Sunil Sharma request #demo-r4 reached 100% fulfillment (2/2 units) and was closed.',
        timestamp: 'Yesterday',
        read: true,
        requestId: 'demo-r4',
      },
    ],
    responses: [
      {
        id: 'demo-resp-r2',
        request: 'demo-r2',
        decision: 'accepted',
        status: 'interested',
        donor: donors[0], // Arjun Mehta (Interested in Fortis request)
      },
      {
        id: 'demo-resp-r3',
        request: 'demo-r3',
        decision: 'accepted',
        status: 'scheduled',
        donor: donors[0], // Arjun Mehta (Scheduled for Lilavati request)
      },
      {
        id: 'demo-resp-1',
        request: 'demo-r3',
        decision: 'accepted',
        status: 'completed',
        donor: donors[1], // Priya Desai (completed 1 unit for Lilavati request)
      },
    ],
  }
}
