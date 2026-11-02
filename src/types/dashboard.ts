import type { ScreeningRecord } from '@/lib/donor-screening'
import type { Eligibility } from '@/lib/donation-eligibility'

export type Role = 'donor' | 'hospital' | 'receiver'

export type Profile = {
  id: string
  name: string
  email?: string
  role: Role
  city: string
  bloodGroup?: string | null
  available?: boolean | null
  hospitalVerified?: boolean | null
}

export type Hospital = {
  id: string
  name: string
  city: string
  address?: string
  owner?: string
}

export type BloodRequest = {
  id: string
  bloodGroup: string
  city: string
  units: number
  fulfilledUnits?: number
  urgency: string
  status: string
  hospital: Hospital | string
  createdAt?: string
  patientName?: string
  ward?: string
  bedNumber?: string
  attendingPhysician?: string
  requiredDate?: string
  notes?: string
  primaryContact?: string
  secondaryContact?: string
}

export type Donor = {
  id: string
  name: string
  city: string
  bloodGroup?: string | null
  available?: boolean | null
}

export type Appointment = {
  id: string
  donor: Donor | string
  hospital: Hospital | string
  request?: BloodRequest | string | null
  date: string
  status: string
  nextEligibleDate?: string | null
  completedAt?: string | null
  approvedAt?: string | null
}

export type Stock = {
  id: string
  bloodGroup: string
  units: number
}

export type ResponseRecord = {
  id: string
  request: BloodRequest | string
  decision: string
  status?: string
  donor?: Donor | string
}

export type QuarantineUnit = {
  id: string
  donorName: string
  bloodGroup: string
  volume: 350 | 450
  collectionDate: string
  bagSerial: string
  screening: {
    hiv: 'negative' | 'reactive' | 'pending'
    hbv: 'negative' | 'reactive' | 'pending'
    hcv: 'negative' | 'reactive' | 'pending'
    syphilis: 'negative' | 'reactive' | 'pending'
    malaria: 'negative' | 'reactive' | 'pending'
  }
  components: {
    prbc: boolean
    ffp: boolean
    platelets: boolean
  }
  status: 'in-testing' | 'screened' | 'processing' | 'verified' | 'released' | 'rejected'
  verifiedBy?: string
  notes?: string
}

export type DonationRecord = {
  id: string
  donorName: string
  bloodGroup: string
  collectionDate: string
  hemoglobin: number
  bpSystolic: number
  bpDiastolic: number
  bagSerial: string
  volume: 350 | 450
  clinicalOfficer: string
  quarantineStatus: 'in-testing' | 'screened' | 'processing' | 'verified' | 'released' | 'rejected'
  appointmentId?: string
}

export type HospitalProfileData = {
  name: string
  licenseNumber: string
  address: string
  city: string
  hotline: string
  medicalOfficer: string
  operatingHours: string
  verified: boolean
}

export type HospitalNotification = {
  id: string
  type: 'emergency' | 'response' | 'appointment' | 'shortage' | 'lab'
  title: string
  message: string
  timestamp: string
  read: boolean
  linkTarget?: string
}

export type ReceiverNotification = {
  id: string
  type: 'interest' | 'appointment' | 'assessment' | 'completed' | 'fulfilled' | 'emergency'
  title: string
  message: string
  timestamp: string
  read: boolean
  requestId?: string
}

export type ReceiverProfileData = {
  name: string
  primaryPhone: string
  secondaryPhone: string
  relationship: string
  city: string
  email: string
  communicationPref: 'sms' | 'call' | 'app'
}

export type DashboardData = {
  user: Profile
  requests: BloodRequest[]
  donors: Donor[]
  appointments: Appointment[]
  hospitals: Hospital[]
  inventory: Stock[]
  responses: ResponseRecord[]
  screening?: ScreeningRecord | null
  donorStats?: { totalDonations: number }
  eligibility?: Eligibility | null
  quarantineUnits?: QuarantineUnit[]
  donationRecords?: DonationRecord[]
  hospitalProfile?: HospitalProfileData
  hospitalNotifications?: HospitalNotification[]
  receiverProfile?: ReceiverProfileData
  receiverNotifications?: ReceiverNotification[]
  clinicalScreenings?: {
    donor: string
    ageYears?: number | null
    weightKg?: number | null
    lastDonationDate?: string | null
    medicalDisclosure?: string | null
    currentlyUnwell?: boolean | null
    recentAlcohol?: boolean | null
    createdAt: string
    outcome?: string | null
  }[]
}
