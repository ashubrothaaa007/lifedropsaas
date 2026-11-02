'use client'

import React, { useState, useMemo } from 'react'
import {
  LayoutDashboard,
  Droplet,
  ClipboardList,
  Users,
  CalendarDays,
  History,
  Microscope,
  ChartNoAxesCombined,
  Building2,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Download,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Activity,
  X,
  Menu,
  ChevronRight,
  RotateCcw,
  Phone,
} from 'lucide-react'
import type {
  DashboardData,
  Role,
  BloodRequest,
  Appointment,
  Donor,
  QuarantineUnit,
  DonationRecord,
  HospitalProfileData,
  HospitalNotification,
} from './dashboard-data'
import { groups, demoScenario } from './dashboard-data'
import {
  BroadcastEmergencyModal,
  StockAdjustmentModal,
  CoordinateDonorsModal,
  HospitalRequestModal,
  ScheduleAssessmentModal,
  ClinicalAssessmentModal,
  PhlebotomyCollectionModal,
  LabTestingModal,
  DonorProfileModal,
} from './HospitalModals'
import {
  BloodTrendChart,
  BloodGroupDistributionChart,
} from './HospitalAnalyticsCharts'

// LifeDrop Healthcare Semantic Button System (Consistent radius, sizing & typography)
const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#D92027] hover:bg-[#b8181e] active:scale-[0.98] rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:pointer-events-none'

const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:pointer-events-none'

const btnSuccess =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:pointer-events-none'

const btnWarning =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:pointer-events-none'

const btnDanger =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D92027] bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 active:scale-[0.98] rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none'

const btnGhost =
  'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.98] rounded-lg transition-colors'

interface HospitalDashboardProps {
  initialData: DashboardData
  onSwitchRole: (role: Role) => void
  onExitDemo?: () => void
  isDemo?: boolean
}

type TabKey =
  | 'overview'
  | 'inventory'
  | 'requests'
  | 'donors'
  | 'appointments'
  | 'history'
  | 'quality'
  | 'reports'
  | 'profile'
  | 'settings'

export default function HospitalDashboard({
  initialData,
  onSwitchRole,
  onExitDemo,
  isDemo = true,
}: HospitalDashboardProps) {
  // Local reactive mock state for the hospital operations platform
  const [data, setData] = useState<DashboardData>(() => {
    // If initialData already has hospital fields, use it; otherwise fallback to hospital demo scenario
    if (dataHasHospitalFields(initialData)) {
      return initialData
    }
    return demoScenario('hospital')
  })

  function dataHasHospitalFields(d: DashboardData): boolean {
    return Boolean(d.hospitalProfile || (d.quarantineUnits && d.quarantineUnits.length > 0))
  }

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(
    null
  )

  // Modals state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [createRequestModalOpen, setCreateRequestModalOpen] = useState(false)
  const [coordinatingRequest, setCoordinatingRequest] = useState<BloodRequest | null>(null)
  const [schedulingDonor, setSchedulingDonor] = useState<Donor | null>(null)
  const [clinicalAppointment, setClinicalAppointment] = useState<Appointment | null>(null)
  const [phlebotomyAppointment, setPhlebotomyAppointment] = useState<Appointment | null>(null)
  const [labUnit, setLabUnit] = useState<QuarantineUnit | null>(null)
  const [inspectingDonor, setInspectingDonor] = useState<Donor | null>(null)
  const [cancelTargetAppointment, setCancelTargetAppointment] = useState<Appointment | null>(null)

  // Filters state
  const [requestFilter, setRequestFilter] = useState<'all' | 'emergency' | 'coordinating' | 'closed'>(
    'all'
  )
  const [donorSearch, setDonorSearch] = useState('')
  const [donorGroupFilter, setDonorGroupFilter] = useState('all')
  const [donorLocationFilter, setDonorLocationFilter] = useState('all')
  const [appointmentFilter, setAppointmentFilter] = useState<
    'all' | 'scheduled' | 'approved' | 'completed' | 'cancelled'
  >('all')
  const [historySearch, setHistorySearch] = useState('')
  const [historyGroupFilter, setHistoryGroupFilter] = useState('all')

  // Show toast utility
  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Hospital profile fields state
  const [profileForm, setProfileForm] = useState<HospitalProfileData>(
    data.hospitalProfile || {
      name: 'Apollo Hospitals',
      licenseNumber: 'MH-BB-2024-8901',
      address: '154, Saki Vihar Road, Andheri East, Mumbai, Maharashtra 400072',
      city: 'Mumbai',
      hotline: '+91 22 2826 3000 / +91 98200 12345',
      medicalOfficer: 'Dr. K. S. Mukherjee, MD (Pathology / Transfusion Medicine)',
      operatingHours: '24/7 Transfusion & Blood Bank Service',
      verified: true,
    }
  )

  // Derived calculations
  const totalAvailableUnits = useMemo(() => {
    return data.inventory.reduce((sum, item) => sum + item.units, 0)
  }, [data.inventory])

  const unitsInTesting = useMemo(() => {
    return (data.quarantineUnits || []).filter((u) => u.status !== 'released' && u.status !== 'rejected')
      .length
  }, [data.quarantineUnits])

  const criticalDeficitGroups = useMemo(() => {
    return data.inventory.filter((item) => item.units < 5).map((item) => item.bloodGroup)
  }, [data.inventory])

  const todayAppointments = useMemo(() => {
    return data.appointments.filter(
      (a) => a.status !== 'completed' && a.status !== 'cancelled'
    )
  }, [data.appointments])

  const unreadNotificationsCount = useMemo(() => {
    return (data.hospitalNotifications || []).filter((n) => !n.read).length
  }, [data.hospitalNotifications])

  // --- Handlers ---

  // 1. Emergency Broadcast
  const handleBroadcast = (message: string, targetedGroups: string[]) => {
    const newNotif: HospitalNotification = {
      id: `notif-${Date.now()}`,
      type: 'emergency',
      title: 'Emergency Need Broadcasted',
      message: `Alert dispatched to matching donors for groups: ${targetedGroups.join(', ')}.`,
      timestamp: 'Just now',
      read: false,
      linkTarget: 'requests',
    }
    setData((prev) => ({
      ...prev,
      hospitalNotifications: [newNotif, ...(prev.hospitalNotifications || [])],
    }))
    showToast(
      `Emergency broadcast dispatched to registered ${targetedGroups.join(', ')} donors in Mumbai.`,
      'alert'
    )
  }

  // 2. Adjust Stock
  const handleAdjustStock = (bloodGroup: string, delta: number, reason: string, notes: string) => {
    setData((prev) => {
      const nextInv = prev.inventory.map((item) => {
        if (item.bloodGroup === bloodGroup) {
          return { ...item, units: Math.max(0, item.units + delta) }
        }
        return item
      })
      const notif: HospitalNotification = {
        id: `notif-${Date.now()}`,
        type: 'shortage',
        title: `Inventory Adjusted: ${bloodGroup}`,
        message: `${delta > 0 ? '+' : ''}${delta} unit(s) adjusted. Reason: ${reason}.`,
        timestamp: 'Just now',
        read: false,
        linkTarget: 'inventory',
      }
      return {
        ...prev,
        inventory: nextInv,
        hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
      }
    })
    showToast(
      `Inventory updated: ${bloodGroup} ${delta > 0 ? '+' : ''}${delta} unit(s).`,
      'success'
    )
  }

  // 3. Coordinate Donor Invitation
  const handleInviteDonor = (donorId: string, donorName: string) => {
    const notif: HospitalNotification = {
      id: `notif-${Date.now()}`,
      type: 'response',
      title: 'Donor Invitation Sent',
      message: `Priority blood request invite sent to ${donorName}.`,
      timestamp: 'Just now',
      read: false,
      linkTarget: 'donors',
    }
    setData((prev) => ({
      ...prev,
      hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
    }))
    showToast(`Priority emergency invitation sent to ${donorName}.`, 'success')
  }

  // 4. Create New Patient Request
  const handleCreateRequest = (req: {
    bloodGroup: string
    units: number
    urgency: string
    patientName: string
    ward: string
  }) => {
    const newReq: BloodRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      bloodGroup: req.bloodGroup,
      units: req.units,
      fulfilledUnits: 0,
      urgency: req.urgency,
      status: 'pending',
      city: 'Mumbai',
      hospital: {
        id: 'demo-h1',
        name: profileForm.name,
        city: 'Mumbai',
      },
      createdAt: new Date().toISOString(),
    }
    const notif: HospitalNotification = {
      id: `notif-${Date.now()}`,
      type: 'emergency',
      title: `New Request: ${req.bloodGroup} (${req.urgency.toUpperCase()})`,
      message: `${req.units} units requested for ${req.patientName} (${req.ward}).`,
      timestamp: 'Just now',
      read: false,
      linkTarget: 'requests',
    }
    setData((prev) => ({
      ...prev,
      requests: [newReq, ...prev.requests],
      hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
    }))
    showToast(
      `New ${req.urgency} request created for ${req.patientName} (${req.units} units ${req.bloodGroup}).`,
      'success'
    )
  }

  // 5. Schedule Assessment (Seamless demo mode)
  const handleScheduleDonor = (donorId: string, scheduledDate: string, requestId?: string) => {
    const donorObj = data.donors.find((d) => d.id === donorId)
    const newApt: Appointment = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      donor: donorObj || { id: donorId, name: 'Registered Donor', city: 'Mumbai', bloodGroup: 'O+' },
      hospital: {
        id: 'demo-h1',
        name: profileForm.name,
        city: 'Mumbai',
      },
      request: requestId || null,
      date: scheduledDate,
      status: 'scheduled',
    }
    const notif: HospitalNotification = {
      id: `notif-${Date.now()}`,
      type: 'appointment',
      title: 'Appointment Scheduled',
      message: `Assessment confirmed for ${donorObj?.name || 'Donor'} on ${new Date(
        scheduledDate
      ).toLocaleDateString()} at ${new Date(scheduledDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
      timestamp: 'Just now',
      read: false,
      linkTarget: 'appointments',
    }
    setData((prev) => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
      hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
    }))
    showToast(
      `Assessment slot scheduled with ${donorObj?.name || 'donor'}. Stage: Scheduled.`,
      'success'
    )
  }

  // 6. Confirm Requested Slot
  const handleConfirmSlot = (apt: Appointment) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === apt.id ? { ...a, status: 'scheduled' } : a
      ),
    }))
    const dName = typeof apt.donor === 'object' ? apt.donor.name : 'Donor'
    showToast(`Appointment confirmed for ${dName}. Stage: Scheduled.`, 'success')
  }

  // 7. Clinical Assessment Approval
  const handleApproveClinical = (vitals: {
    hemoglobin: number
    bpSystolic: number
    bpDiastolic: number
    notes: string
  }) => {
    if (!clinicalAppointment) return
    const aptId = clinicalAppointment.id
    const dName =
      typeof clinicalAppointment.donor === 'object'
        ? clinicalAppointment.donor.name
        : 'Registered Donor'

    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === aptId
          ? {
              ...a,
              status: 'approved',
              approvedAt: new Date().toISOString(),
            }
          : a
      ),
    }))
    showToast(
      `Clinical assessment approved for ${dName} (Hb: ${vitals.hemoglobin} g/dL, BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}). Ready for Phlebotomy!`,
      'success'
    )
  }

  // 8. Clinical Assessment Deferral
  const handleRejectClinical = (reason: string) => {
    if (!clinicalAppointment) return
    const aptId = clinicalAppointment.id
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === aptId ? { ...a, status: 'cancelled' } : a
      ),
    }))
    showToast(`Donor medically deferred: ${reason}.`, 'alert')
  }

  // 9. Phlebotomy Collection Confirmation (Strict Safety Rule: Quarantine, Never Auto-Stock!)
  const handleConfirmCollection = (colData: {
    donationId: string
    bagSerial: string
    bloodGroup: string
    volume: 350 | 450
    collectionDate: string
    clinicalOfficer: string
    notes: string
  }) => {
    if (!phlebotomyAppointment) return
    const apt = phlebotomyAppointment
    const dName = typeof apt.donor === 'object' ? apt.donor.name : 'Registered Donor'

    // 1. Mark appointment completed
    const updatedAppointments = data.appointments.map((a) =>
      a.id === apt.id
        ? {
            ...a,
            status: 'completed',
            completedAt: colData.collectionDate,
            nextEligibleDate: new Date(Date.now() + 120 * 86400000).toISOString(),
          }
        : a
    )

    // 2. Create Donation Record
    const newRecord: DonationRecord = {
      id: colData.donationId,
      donorName: dName,
      bloodGroup: colData.bloodGroup,
      collectionDate: colData.collectionDate,
      hemoglobin: 14.2,
      bpSystolic: 120,
      bpDiastolic: 80,
      bagSerial: colData.bagSerial,
      volume: colData.volume,
      clinicalOfficer: colData.clinicalOfficer,
      quarantineStatus: 'in-testing',
      appointmentId: apt.id,
    }

    // 3. Create Quarantine Unit in laboratory queue (SAFETY RULE: NEVER auto-increment stock!)
    const newQuarantineUnit: QuarantineUnit = {
      id: `UNIT-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName: dName,
      bloodGroup: colData.bloodGroup,
      volume: colData.volume,
      collectionDate: colData.collectionDate,
      bagSerial: colData.bagSerial,
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
      notes: colData.notes,
    }

    // 4. Update linked blood request if applicable (Multi-donor partial fulfillment)
    let updatedRequests = data.requests
    if (apt.request) {
      const targetReqId = typeof apt.request === 'object' ? apt.request.id : apt.request
      updatedRequests = data.requests.map((r) => {
        if (r.id === targetReqId) {
          const nextFulfilled = (r.fulfilledUnits || 0) + 1
          const isFullyFulfilled = nextFulfilled >= r.units
          return {
            ...r,
            fulfilledUnits: nextFulfilled,
            status: isFullyFulfilled ? 'closed' : 'coordinating',
          }
        }
        return r
      })
    }

    // 5. Add notification
    const notif: HospitalNotification = {
      id: `notif-${Date.now()}`,
      type: 'lab',
      title: 'New Unit in Lab Quarantine',
      message: `Bag ${colData.bagSerial} (${colData.bloodGroup}, ${colData.volume}ml) collected from ${dName} placed in quarantine queue.`,
      timestamp: 'Just now',
      read: false,
      linkTarget: 'quality',
    }

    setData((prev) => ({
      ...prev,
      appointments: updatedAppointments,
      donationRecords: [newRecord, ...(prev.donationRecords || [])],
      quarantineUnits: [newQuarantineUnit, ...(prev.quarantineUnits || [])],
      requests: updatedRequests,
      hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
    }))

    showToast(
      `Blood collection completed! Bag ${colData.bagSerial} transferred to Quality Quarantine for serology screening.`,
      'success'
    )
  }

  // 10. Lab Quarantine Update & Release
  const handleUpdateQuarantineUnit = (updated: QuarantineUnit) => {
    setData((prev) => ({
      ...prev,
      quarantineUnits: (prev.quarantineUnits || []).map((u) => (u.id === updated.id ? updated : u)),
    }))
    showToast(`Laboratory testing record updated for Unit ${updated.id}.`, 'info')
  }

  // Release from Quarantine to Available Stock (SAFETY RULE: Only here does stock increase!)
  const handleReleaseToStock = (unit: QuarantineUnit) => {
    setData((prev) => {
      const nextInv = prev.inventory.map((item) => {
        if (item.bloodGroup === unit.bloodGroup) {
          return { ...item, units: item.units + 1 }
        }
        return item
      })
      const nextUnits = (prev.quarantineUnits || []).map((u) =>
        u.id === unit.id ? { ...u, status: 'released' as const } : u
      )
      const nextRecords = (prev.donationRecords || []).map((r) =>
        r.bagSerial === unit.bagSerial ? { ...r, quarantineStatus: 'released' as const } : r
      )
      const notif: HospitalNotification = {
        id: `notif-${Date.now()}`,
        type: 'lab',
        title: `Unit ${unit.id} Released to Stock`,
        message: `Quality checks verified. +1 unit ${unit.bloodGroup} whole blood added to live available stock.`,
        timestamp: 'Just now',
        read: false,
        linkTarget: 'inventory',
      }
      return {
        ...prev,
        inventory: nextInv,
        quarantineUnits: nextUnits,
        donationRecords: nextRecords,
        hospitalNotifications: [notif, ...(prev.hospitalNotifications || [])],
      }
    })
    showToast(
      `Unit ${unit.id} released! +1 unit ${unit.bloodGroup} added to Available Inventory.`,
      'success'
    )
  }

  const handleRejectQuarantineUnit = (unitId: string, reason: string) => {
    setData((prev) => ({
      ...prev,
      quarantineUnits: (prev.quarantineUnits || []).map((u) =>
        u.id === unitId ? { ...u, status: 'rejected' as const, notes: reason } : u
      ),
      donationRecords: (prev.donationRecords || []).map((r) =>
        r.id === unitId ? { ...r, quarantineStatus: 'rejected' as const } : r
      ),
    }))
    showToast(`Unit ${unitId} rejected and flagged for safe biological discard.`, 'alert')
  }

  // 11. Cancel Appointment
  const handleConfirmCancelAppointment = (reason: string) => {
    if (!cancelTargetAppointment) return
    const apt = cancelTargetAppointment
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === apt.id ? { ...a, status: 'cancelled' } : a
      ),
    }))
    setCancelTargetAppointment(null)
    showToast(`Appointment slot released and cancelled.`, 'info')
  }

  // 12. Update Request Status directly
  const handleUpdateRequestStatus = (requestId: string, newStatus: string) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === requestId ? { ...r, status: newStatus } : r
      ),
    }))
    showToast(`Request #${requestId} status set to "${newStatus}".`, 'info')
  }

  // 13. Export Operational CSV
  const handleExportCSV = () => {
    const csvRows: string[] = []
    csvRows.push('=== APOLLO HOSPITALS BLOOD BANK OPERATIONS REPORT ===')
    csvRows.push(`Export Date,${new Date().toISOString()}`)
    csvRows.push(`License Number,${profileForm.licenseNumber}`)
    csvRows.push('')
    csvRows.push('--- INVENTORY STATUS ---')
    csvRows.push('Blood Group,Available Units,Stock Status')
    data.inventory.forEach((i) => {
      const status = i.units >= 10 ? 'Optimal' : i.units >= 5 ? 'Low Stock' : 'Critical Deficit'
      csvRows.push(`${i.bloodGroup},${i.units},${status}`)
    })
    csvRows.push('')
    csvRows.push('--- COMPLETED DONATIONS AUDIT LOG ---')
    csvRows.push('Donation ID,Donor Name,Blood Group,Date,Bag Serial,Volume (ml),Hemoglobin,BP,Officer,Quarantine Status')
    ;(data.donationRecords || []).forEach((r) => {
      csvRows.push(
        `${r.id},"${r.donorName}",${r.bloodGroup},${r.collectionDate},${r.bagSerial},${r.volume},${r.hemoglobin},${r.bpSystolic}/${r.bpDiastolic},"${r.clinicalOfficer}",${r.quarantineStatus}`
      )
    })
    csvRows.push('')
    csvRows.push('--- IN-HOSPITAL BLOOD REQUESTS ---')
    csvRows.push('Request ID,Blood Group,Urgency,Units Required,Units Fulfilled,Status,Created At')
    data.requests.forEach((r) => {
      csvRows.push(
        `${r.id},${r.bloodGroup},${r.urgency},${r.units},${r.fulfilledUnits || 0},${r.status},${r.createdAt || ''}`
      )
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `Apollo_Blood_Bank_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Operational CSV report downloaded successfully.', 'success')
  }

  // 14. Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setData((prev) => ({
      ...prev,
      hospitalProfile: profileForm,
    }))
    showToast('Hospital profile details saved successfully.', 'success')
  }

  // 15. Reset Demo Scenario
  const handleResetDemo = () => {
    if (confirm('Reset Hospital Dashboard to initial demo scenario state?')) {
      const fresh = demoScenario('hospital')
      setData(fresh)
      setProfileForm(fresh.hospitalProfile!)
      showToast('Hospital demo scenario reset to initial state.', 'info')
    }
  }

  // Navigation Items
  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'inventory', label: 'Blood Inventory', icon: Droplet },
    { key: 'requests', label: 'Blood Requests', icon: ClipboardList },
    { key: 'donors', label: 'Donor Management', icon: Users },
    { key: 'appointments', label: 'Appointments', icon: CalendarDays },
    { key: 'history', label: 'Donation Records', icon: History },
    { key: 'quality', label: 'Quality & Lab Tests', icon: Microscope },
    { key: 'reports', label: 'Reports & Analytics', icon: ChartNoAxesCombined },
    { key: 'profile', label: 'Hospital Profile', icon: Building2 },
    { key: 'settings', label: 'Account Settings', icon: Settings },
  ]

  return (
    <div className="h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl border border-slate-200 animate-in slide-in-from-top-4 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === 'alert' && <AlertTriangle className="w-5 h-5 text-[#D92027] shrink-0" />}
          {toast.type === 'info' && <Radio className="w-5 h-5 text-indigo-600 shrink-0" />}
          <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP FIXED HEADER */}
      <header className="shrink-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger, Brand & Hospital Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#D92027] text-white">
                  <Droplet className="w-4 h-4 fill-white" />
                </span>
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Life<span className="text-[#D92027]">Drop</span>
                </span>
              </div>

              <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {profileForm.name}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                    · {profileForm.licenseNumber}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Blood Bank &amp; Clinical Transfusion
                </span>
              </div>
            </div>
          </div>

          {/* Right: Operational Alert, Notifications, Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Deficit Alert Indicator */}
            {criticalDeficitGroups.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-xs font-semibold text-[#D92027] hover:bg-red-100 transition-colors"
                title="Critical blood stock deficits"
              >
                <span className="size-1.5 rounded-full bg-[#D92027]" />
                <span>
                  {criticalDeficitGroups.length} Deficit{criticalDeficitGroups.length > 1 ? 's' : ''} ({criticalDeficitGroups.join(', ')})
                </span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 size-2 bg-[#D92027] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="font-semibold text-xs text-slate-900">Hospital Notifications</div>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          hospitalNotifications: (prev.hospitalNotifications || []).map((n) => ({
                            ...n,
                            read: true,
                          })),
                        }))
                      }}
                      className="text-[11px] font-medium text-[#D92027] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                    {(data.hospitalNotifications || []).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications at this time
                      </div>
                    ) : (
                      (data.hospitalNotifications || []).map((n) => (
                        <div
                          key={n.id}
                          className={`py-2.5 flex flex-col gap-1 transition-colors ${
                            n.read ? 'opacity-70' : 'bg-red-50/30 px-2 rounded-lg'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {n.type === 'emergency' && <AlertTriangle className="w-3.5 h-3.5 text-[#D92027]" />}
                              {n.type === 'lab' && <Microscope className="w-3.5 h-3.5 text-indigo-600" />}
                              {n.type === 'appointment' && <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 tabular-nums">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600">{n.message}</p>
                          {n.linkTarget && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab(n.linkTarget as TabKey)
                                setNotificationsOpen(false)
                              }}
                              className="self-start text-[11px] font-medium text-[#D92027] flex items-center gap-1 hover:underline mt-0.5"
                            >
                              Go to {n.linkTarget} <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Role Switcher Segmented Control */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => onSwitchRole('donor')}
                className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('hospital')}
                className="px-2.5 py-1 rounded-md bg-white text-slate-900 font-semibold shadow-2xs"
              >
                Hospital
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('receiver')}
                className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
              >
                Receiver
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={handleResetDemo}
              title="Reset Demo Scenario"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Reset Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: FIXED SIDEBAR + INDEPENDENTLY SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-200/80 p-4 h-full overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.key
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-[#FFF1F1] text-[#D92027] font-semibold'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.key === 'inventory' && criticalDeficitGroups.length > 0 && (
                    <span className="size-2 rounded-full bg-[#D92027] shrink-0" />
                  )}
                  {item.key === 'appointments' && todayAppointments.length > 0 && (
                    <span className="tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                      {todayAppointments.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Facility Operations Panel */}
          <div className="mt-6 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>Blood Bank License</span>
              <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums font-mono">{profileForm.licenseNumber}</div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#D92027]" />
              <span>Hotline: {profileForm.hotline.split('/')[0]}</span>
            </div>
          </div>
        </aside>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative flex flex-col justify-between w-72 max-w-[85vw] bg-white border-r border-slate-200 p-4 h-full overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#D92027] text-white">
                      <Droplet className="w-4 h-4 fill-white" />
                    </span>
                    <span className="text-sm font-bold tracking-tight text-slate-900">
                      Life<span className="text-[#D92027]">Drop</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {navItems.map((item) => {
                  const active = activeTab === item.key
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.key)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? 'bg-[#FFF1F1] text-[#D92027] font-semibold'
                          : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.key === 'inventory' && criticalDeficitGroups.length > 0 && (
                        <span className="size-2 rounded-full bg-[#D92027] shrink-0" />
                      )}
                      {item.key === 'appointments' && todayAppointments.length > 0 && (
                        <span className="tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                          {todayAppointments.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Mobile Facility Operations Panel */}
              <div className="mt-6 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Blood Bank License</span>
                  <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums font-mono">{profileForm.licenseNumber}</div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#D92027]" />
                  <span>Hotline: {profileForm.hotline.split('/')[0]}</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN INDEPENDENTLY SCROLLABLE CONTENT */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-5 lg:p-6">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW: OPERATIONAL COMMAND CENTER */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Emergency Deficit Operational Banner */}
              {criticalDeficitGroups.length > 0 && (
                <div className="border border-red-200 bg-red-50/50 rounded-xl p-3.5 sm:p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#D92027]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#D92027]">
                          Critical Stock Deficit
                        </span>
                        <span className="text-xs text-slate-500">
                          · {criticalDeficitGroups.length} group{criticalDeficitGroups.length > 1 ? 's' : ''} below minimum safety threshold (5 units)
                        </span>
                      </div>

                      {/* Group Deficit Status Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {data.inventory
                          .filter((i) => i.units < 5)
                          .map((i) => (
                            <span
                              key={i.bloodGroup}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-red-200 text-xs font-medium text-slate-900 shadow-2xs"
                            >
                              <span className="font-bold text-[#D92027]">{i.bloodGroup}</span>
                              <span className="text-slate-500 tabular-nums text-[11px]">
                                {i.units} / 5 units
                              </span>
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Operational Summary & Action */}
                    <div className="flex flex-wrap items-center gap-3 lg:gap-5 self-start lg:self-center">
                      <div className="border-l border-red-200/80 pl-3 hidden sm:block">
                        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                          Emergency Requests
                        </div>
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {data.requests.filter((r) => r.urgency === 'emergency' && r.status !== 'closed').length} active
                        </div>
                      </div>

                      <div className="border-l border-red-200/80 pl-3 hidden sm:block">
                        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                          Units Needed
                        </div>
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {criticalDeficitGroups.length * 5 -
                            data.inventory
                              .filter((i) => i.units < 5)
                              .reduce((s, i) => s + i.units, 0)}{' '}
                          units
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBroadcastModalOpen(true)}
                        className={btnPrimary}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        Broadcast Emergency Need
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Clean Metric Cards (Restrained, No Decorative Icons, 1 Horizontal Row on Desktop) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">
                    Total Available Stock
                  </div>
                  <div className="tabular-nums text-2xl font-bold tracking-tight text-slate-900">
                    {totalAvailableUnits}
                  </div>
                  <div className="text-[11px] text-slate-500">Units across 8 blood groups</div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">
                    In Lab Quarantine
                  </div>
                  <div className="tabular-nums text-2xl font-bold tracking-tight text-slate-900">
                    {unitsInTesting}
                  </div>
                  <div className="text-[11px] text-slate-500">Units awaiting safety clearance</div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">
                    Critical Deficits
                  </div>
                  <div
                    className={`tabular-nums text-2xl font-bold tracking-tight ${
                      criticalDeficitGroups.length > 0 ? 'text-[#D92027]' : 'text-slate-900'
                    }`}
                  >
                    {criticalDeficitGroups.length}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {criticalDeficitGroups.length > 0
                      ? criticalDeficitGroups.join(', ')
                      : 'All groups in safe range'}
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">
                    Today's Clinical Queue
                  </div>
                  <div className="tabular-nums text-2xl font-bold tracking-tight text-slate-900">
                    {todayAppointments.length}
                  </div>
                  <div className="text-[11px] text-slate-500">Scheduled donor appointments</div>
                </div>
              </div>

              {/* Analytics Visualization: Blood Request and Collection Trends */}
              <BloodTrendChart
                requests={data.requests}
                appointments={data.appointments}
                donationRecords={data.donationRecords}
              />

              {/* Today's Clinical Assessment & Phlebotomy Queue (Structured Table) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Today's Assessment &amp; Phlebotomy Queue
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-semibold text-[#D92027] hover:underline flex items-center gap-1"
                  >
                    View All Appointments <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3.5">Donor Name</th>
                        <th className="py-2.5 px-3.5">Blood Group</th>
                        <th className="py-2.5 px-3.5">Scheduled Slot</th>
                        <th className="py-2.5 px-3.5">Stage</th>
                        <th className="py-2.5 px-3.5 text-right">Operational Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                            No donor appointments scheduled for today.
                          </td>
                        </tr>
                      ) : (
                        todayAppointments.map((apt) => {
                          const dName =
                            typeof apt.donor === 'object' ? apt.donor.name : 'Registered Donor'
                          const dBlood =
                            typeof apt.donor === 'object' ? apt.donor.bloodGroup || 'O+' : 'O+'
                          return (
                            <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                <div>{dName}</div>
                                <div className="text-[11px] font-normal text-slate-400 tabular-nums">
                                  #{apt.id}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                                  {dBlood}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 tabular-nums">
                                {new Date(apt.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                                    apt.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : apt.status === 'scheduled'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {apt.status === 'approved'
                                    ? 'Phlebotomy Approved'
                                    : apt.status === 'scheduled'
                                    ? 'Scheduled'
                                    : 'Requested'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {apt.status === 'requested' && (
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmSlot(apt)}
                                    className={btnSecondary}
                                  >
                                    Confirm Slot
                                  </button>
                                )}
                                {apt.status === 'scheduled' && (
                                  <button
                                    type="button"
                                    onClick={() => setClinicalAppointment(apt)}
                                    className={btnPrimary}
                                  >
                                    <Activity className="w-3 h-3" />
                                    Start Clinical Assessment
                                  </button>
                                )}
                                {apt.status === 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => setPhlebotomyAppointment(apt)}
                                    className={btnSuccess}
                                  >
                                    <Droplet className="w-3 h-3" />
                                    Record Collection
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incoming In-Hospital Requests Summary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Incoming Patient Blood Requests
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateRequestModalOpen(true)}
                      className={btnPrimary}
                    >
                      <Plus className="w-3.5 h-3.5" /> New Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('requests')}
                      className="text-xs font-semibold text-[#D92027] hover:underline flex items-center gap-1 ml-2"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.requests.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 border border-slate-200 rounded-lg space-y-2.5 bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded bg-red-50 text-[#D92027] font-bold text-xs flex items-center justify-center border border-red-100">
                            {req.bloodGroup}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900">
                              #{req.id}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {req.city} · Apollo Blood Bank
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                            req.urgency === 'emergency'
                              ? 'bg-red-50 text-[#D92027] border border-red-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>

                      {/* Fulfillment bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                          <span>Fulfillment</span>
                          <span className="tabular-nums">
                            {req.fulfilledUnits || 0} / {req.units} units (
                            {Math.round(((req.fulfilledUnits || 0) / req.units) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (req.fulfilledUnits || 0) >= req.units
                                ? 'bg-emerald-500'
                                : 'bg-[#D92027]'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((req.fulfilledUnits || 0) / req.units) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-medium text-slate-500 capitalize">
                          Status: {req.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCoordinatingRequest(req)}
                          className={btnSecondary}
                        >
                          Coordinate Donors
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. BLOOD INVENTORY: 8 GROUPS + QUARANTINE LABORATORY QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Header and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Blood Bank Inventory Management</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStockModalOpen(true)}
                  className={btnPrimary}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adjust Stock / Discard
                </button>
              </div>

              {/* Master Inventory Health Summary Bar (Compact Horizontal Layout) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
                  {/* Total Available Stock */}
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
                      Total Available Stock
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="tabular-nums text-3xl font-extrabold text-slate-900 tracking-tight">
                        {totalAvailableUnits}
                      </span>
                      <span className="text-xs font-medium text-slate-500">units in clinical storage</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      8 blood groups · Tested &amp; certified for transfusion
                    </div>
                  </div>

                  {/* Stock Distribution Breakdown */}
                  <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-5 pt-2.5 md:pt-0">
                    <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
                      Stock Level Distribution
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {data.inventory.filter((i) => i.units >= 10).length}
                        </span>
                        <span className="text-slate-500 text-[11px]">Optimal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-amber-500" />
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {data.inventory.filter((i) => i.units >= 5 && i.units < 10).length}
                        </span>
                        <span className="text-slate-500 text-[11px]">Low Stock</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#D92027]" />
                        <span className="font-semibold text-[#D92027] tabular-nums">
                          {data.inventory.filter((i) => i.units < 5).length}
                        </span>
                        <span className="text-[#D92027] font-medium text-[11px]">Critical</span>
                      </div>
                    </div>
                    {/* Visual Segmented Distribution Meter */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
                      <div
                        style={{
                          width: `${(data.inventory.filter((i) => i.units >= 10).length / 8) * 100}%`,
                        }}
                        className="bg-emerald-500 h-full"
                        title="Optimal Stock Groups"
                      />
                      <div
                        style={{
                          width: `${(data.inventory.filter((i) => i.units >= 5 && i.units < 10).length / 8) * 100}%`,
                        }}
                        className="bg-amber-400 h-full"
                        title="Low Stock Groups"
                      />
                      <div
                        style={{
                          width: `${(data.inventory.filter((i) => i.units < 5).length / 8) * 100}%`,
                        }}
                        className="bg-[#D92027] h-full"
                        title="Critical Deficit Groups"
                      />
                    </div>
                  </div>

                  {/* Quarantined Laboratory Stock Status */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-5 pt-2.5 md:pt-0 space-y-0.5">
                    <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
                      In Lab Quarantine
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="tabular-nums text-2xl font-bold text-slate-900">
                        {unitsInTesting}
                      </span>
                      <span className="text-xs text-slate-500">units in viral testing</span>
                    </div>
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('quality')}
                        className="text-xs font-semibold text-[#D92027] hover:underline flex items-center gap-1"
                      >
                        Open Quarantine Screening Pipeline <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Group Distribution & Clinical Safety Target Visualization (Optimized Compact Height & Fixed Tooltip) */}
              <BloodGroupDistributionChart inventory={data.inventory} />

              {/* Compact Comprehensive Blood Inventory Table (Replaces Redundant Cards) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">
                      ABO Blood Group Inventory &amp; Reserve Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStockModalOpen(true)}
                    className={btnSecondary}
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    Adjust Stock / Discard
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4">Blood Group</th>
                        <th className="py-2.5 px-4">Available Units</th>
                        <th className="py-2.5 px-4">Units in Testing</th>
                        <th className="py-2.5 px-4">Target Reserve</th>
                        <th className="py-2.5 px-4">Stock Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.inventory.map((item) => {
                        const inTestingCount = (data.quarantineUnits || []).filter(
                          (u) =>
                            u.bloodGroup === item.bloodGroup &&
                            u.status !== 'released' &&
                            u.status !== 'rejected'
                        ).length

                        const isCritical = item.units < 5
                        const isLow = item.units >= 5 && item.units < 10
                        const isOptimal = item.units >= 10
                        const diff = item.units - 15

                        return (
                          <tr key={item.bloodGroup} className="hover:bg-slate-50/60 transition-colors">
                            {/* Blood Group */}
                            <td className="py-2.5 px-4">
                              <span className="inline-flex items-center justify-center size-7 rounded-md bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200">
                                {item.bloodGroup}
                              </span>
                            </td>

                            {/* Available Units */}
                            <td className="py-2.5 px-4">
                              <div className="flex items-baseline gap-1.5">
                                <span className="tabular-nums font-bold text-sm text-slate-900">
                                  {item.units}
                                </span>
                                <span className="text-[11px] text-slate-500">units available</span>
                              </div>
                            </td>

                            {/* Units in Testing */}
                            <td className="py-2.5 px-4">
                              <span className="tabular-nums text-xs font-semibold text-slate-700">
                                {inTestingCount} {inTestingCount === 1 ? 'unit' : 'units'}
                              </span>
                            </td>

                            {/* Target Reserve */}
                            <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                              15 units{' '}
                              <span
                                className={`text-[11px] font-semibold ${
                                  diff >= 0 ? 'text-emerald-600' : 'text-[#DC2626]'
                                }`}
                              >
                                ({diff >= 0 ? `+${diff}` : diff})
                              </span>
                            </td>

                            {/* Stock Status */}
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  isOptimal
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isLow
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-[#DC2626] border-red-200'
                                }`}
                              >
                                {isOptimal ? 'Optimal' : isLow ? 'Low Stock' : 'Critical Deficit'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {isCritical && (
                                  <button
                                    type="button"
                                    onClick={() => setBroadcastModalOpen(true)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-[#D92027] bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                  >
                                    Broadcast Need
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setStockModalOpen(true)}
                                  className={btnSecondary}
                                >
                                  Adjust Stock
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quality & Safety Quarantine Laboratory Queue */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Quarantine Laboratory Screening Queue
                      </h3>
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                        Mandatory Viral Panel
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quality')}
                    className="text-xs font-semibold text-[#D92027] hover:underline flex items-center gap-1"
                  >
                    Open Full Lab Workspace <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2 px-3.5">Unit ID</th>
                        <th className="py-2 px-3.5">Donor Name</th>
                        <th className="py-2 px-3.5">Group</th>
                        <th className="py-2 px-3.5">Volume</th>
                        <th className="py-2 px-3.5">Viral Serology Screening</th>
                        <th className="py-2 px-3.5">Status</th>
                        <th className="py-2 px-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.quarantineUnits || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-xs text-slate-500">
                            No units currently quarantined in laboratory testing.
                          </td>
                        </tr>
                      ) : (
                        (data.quarantineUnits || []).map((unit) => {
                          const allPassed =
                            unit.screening.hiv === 'negative' &&
                            unit.screening.hbv === 'negative' &&
                            unit.screening.hcv === 'negative' &&
                            unit.screening.syphilis === 'negative' &&
                            unit.screening.malaria === 'negative'

                          return (
                            <tr key={unit.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3.5 tabular-nums font-semibold text-slate-900">
                                {unit.id}
                              </td>
                              <td className="py-2.5 px-3.5 font-medium text-slate-900">
                                {unit.donorName}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                                  {unit.bloodGroup}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-600 tabular-nums">
                                {unit.volume} ml
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                    allPassed
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {allPassed ? 'Serology Negative (Pass)' : 'Testing In Progress'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 capitalize text-slate-600 font-medium">
                                {unit.status}
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setLabUnit(unit)}
                                  className={btnSecondary}
                                >
                                  {unit.status === 'released' ? 'View Record' : 'Review & Release'}
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. BLOOD REQUESTS: MANAGEMENT, FILTERS & DONOR COORDINATION */}
          {/* ========================================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Patient Blood Requests</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateRequestModalOpen(true)}
                  className={btnPrimary}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Patient Request
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg w-fit text-xs font-medium border border-slate-200">
                {(['all', 'emergency', 'coordinating', 'closed'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRequestFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      requestFilter === f
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'all'
                      ? 'All Requests'
                      : f === 'emergency'
                      ? 'Emergency Only'
                      : f === 'coordinating'
                      ? 'Coordinating'
                      : 'Fulfilled / Closed'}
                  </button>
                ))}
              </div>

              {/* Request Cards Grid */}
              <div className="space-y-3.5">
                {data.requests
                  .filter((r) => {
                    if (requestFilter === 'emergency') return r.urgency === 'emergency'
                    if (requestFilter === 'coordinating') return r.status === 'coordinating'
                    if (requestFilter === 'closed') return r.status === 'closed'
                    return true
                  })
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="size-9 rounded-md bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center border border-slate-200">
                            {req.bloodGroup}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                Request #{req.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                                  req.urgency === 'emergency'
                                    ? 'bg-red-50 text-[#D92027] border border-red-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {req.urgency}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Apollo Hospitals Mumbai · Emergency Ward
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                            className="text-xs font-medium p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                          >
                            <option value="pending">Pending</option>
                            <option value="coordinating">Coordinating</option>
                            <option value="closed">Fulfilled / Closed</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setCoordinatingRequest(req)}
                            className={btnSecondary}
                          >
                            <Users className="w-3.5 h-3.5" />
                            Coordinate Donors
                          </button>
                        </div>
                      </div>

                      {/* Multi-donor Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                          <span>Verified Fulfillment Progress</span>
                          <span className="tabular-nums">
                            {req.fulfilledUnits || 0} / {req.units} units fulfilled (
                            {Math.round(((req.fulfilledUnits || 0) / req.units) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (req.fulfilledUnits || 0) >= req.units
                                ? 'bg-emerald-500'
                                : 'bg-[#D92027]'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((req.fulfilledUnits || 0) / req.units) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Matching Donor Activity */}
                      <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          Active Donor Matches: 2 voluntary donors responded
                        </span>
                        <span className="text-slate-400 text-[11px] tabular-nums">
                          Created:{' '}
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. DONOR MANAGEMENT: SEARCHABLE DIRECTORY & SCHEDULE APPOINTMENT */}
          {/* ========================================================================= */}
          {activeTab === 'donors' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Donor Management Directory</h2>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder="Search by donor name or location..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]/10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={donorGroupFilter}
                    onChange={(e) => setDonorGroupFilter(e.target.value)}
                    className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700"
                  >
                    <option value="all">All Blood Groups</option>
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <select
                    value={donorLocationFilter}
                    onChange={(e) => setDonorLocationFilter(e.target.value)}
                    className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700"
                  >
                    <option value="all">All Locations</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="New Delhi">New Delhi</option>
                  </select>
                </div>
              </div>

              {/* Donors Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Donor Name</th>
                        <th className="py-2.5 px-4">Blood Group</th>
                        <th className="py-2.5 px-4">City</th>
                        <th className="py-2.5 px-4">Availability</th>
                        <th className="py-2.5 px-4">Interval Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.donors
                        .filter((d) => {
                          const matchesSearch =
                            d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
                            d.city.toLowerCase().includes(donorSearch.toLowerCase())
                          const matchesGroup =
                            donorGroupFilter === 'all' || d.bloodGroup === donorGroupFilter
                          const matchesLocation =
                            donorLocationFilter === 'all' || d.city === donorLocationFilter
                          return matchesSearch && matchesGroup && matchesLocation
                        })
                        .map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">{d.name}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                                {d.bloodGroup || 'O+'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{d.city}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                  d.available
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {d.available ? 'Available' : 'Standby'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                120-Day Interval Complete
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setInspectingDonor(d)}
                                className={btnSecondary}
                              >
                                Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => setSchedulingDonor(d)}
                                className={btnPrimary}
                              >
                                Schedule Assessment
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. APPOINTMENTS: 5-STAGE TIMELINE, CONFIRM, ASSESS, COLLECT, CANCEL */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* 5. APPOINTMENTS: STRUCTURED OPERATIONAL TABLE */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Appointment Management</h2>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg w-fit text-xs font-medium overflow-x-auto border border-slate-200">
                {(
                  [
                    { key: 'all', label: 'All', count: data.appointments.length },
                    {
                      key: 'scheduled',
                      label: 'In Queue',
                      count: data.appointments.filter(
                        (a) => a.status === 'scheduled' || a.status === 'requested'
                      ).length,
                    },
                    {
                      key: 'approved',
                      label: 'Phlebotomy Approved',
                      count: data.appointments.filter((a) => a.status === 'approved').length,
                    },
                    {
                      key: 'completed',
                      label: 'Completed',
                      count: data.appointments.filter((a) => a.status === 'completed').length,
                    },
                    {
                      key: 'cancelled',
                      label: 'Cancelled',
                      count: data.appointments.filter((a) => a.status === 'cancelled').length,
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAppointmentFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
                      appointmentFilter === f.key
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="tabular-nums text-[11px] font-medium opacity-70">
                      ({f.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* Structured Appointments Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Donor Name &amp; ID</th>
                        <th className="py-2.5 px-4">Blood Group</th>
                        <th className="py-2.5 px-4">Appointment Schedule</th>
                        <th className="py-2.5 px-4">Clinical Stage</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.appointments
                        .filter((a) => {
                          if (appointmentFilter === 'scheduled')
                            return a.status === 'scheduled' || a.status === 'requested'
                          if (appointmentFilter === 'approved') return a.status === 'approved'
                          if (appointmentFilter === 'completed') return a.status === 'completed'
                          if (appointmentFilter === 'cancelled') return a.status === 'cancelled'
                          return true
                        }).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                            No appointments found for the selected filter.
                          </td>
                        </tr>
                      ) : (
                        data.appointments
                          .filter((a) => {
                            if (appointmentFilter === 'scheduled')
                              return a.status === 'scheduled' || a.status === 'requested'
                            if (appointmentFilter === 'approved') return a.status === 'approved'
                            if (appointmentFilter === 'completed') return a.status === 'completed'
                            if (appointmentFilter === 'cancelled') return a.status === 'cancelled'
                            return true
                          })
                          .map((apt) => {
                            const dName =
                              typeof apt.donor === 'object' ? apt.donor.name : 'Registered Donor'
                            const dBlood =
                              typeof apt.donor === 'object' ? apt.donor.bloodGroup || 'O+' : 'O+'

                            return (
                              <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 font-semibold text-slate-900">
                                  <div>{dName}</div>
                                  <div className="text-[11px] font-normal text-slate-400 tabular-nums">
                                    Ref #{apt.id}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                                    {dBlood}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-700">
                                  <div className="font-medium">
                                    {new Date(apt.date).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </div>
                                  <div className="text-[11px] text-slate-400 tabular-nums">
                                    {new Date(apt.date).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                                      apt.status === 'completed'
                                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                        : apt.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : apt.status === 'scheduled'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : apt.status === 'cancelled'
                                        ? 'bg-red-50 text-red-600 border border-red-200 line-through'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {apt.status === 'approved'
                                      ? 'Phlebotomy Approved'
                                      : apt.status === 'completed'
                                      ? 'Completed'
                                      : apt.status === 'scheduled'
                                      ? 'Scheduled'
                                      : apt.status === 'cancelled'
                                      ? 'Cancelled'
                                      : 'Requested'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    {apt.status === 'requested' && (
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmSlot(apt)}
                                        className={btnSecondary}
                                      >
                                        Confirm Slot
                                      </button>
                                    )}

                                    {(apt.status === 'scheduled' || apt.status === 'requested') && (
                                      <button
                                        type="button"
                                        onClick={() => setClinicalAppointment(apt)}
                                        className={btnPrimary}
                                      >
                                        <Activity className="w-3 h-3" />
                                        Start Assessment
                                      </button>
                                    )}

                                    {apt.status === 'approved' && (
                                      <button
                                        type="button"
                                        onClick={() => setPhlebotomyAppointment(apt)}
                                        className={btnSuccess}
                                      >
                                        <Droplet className="w-3 h-3" />
                                        Record Collection
                                      </button>
                                    )}

                                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                      <button
                                        type="button"
                                        onClick={() => setCancelTargetAppointment(apt)}
                                        className={btnDanger}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. DONATION RECORDS: AUDIT LOG OF COMPLETED COLLECTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Donation Records &amp; Logs</h2>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={btnSecondary}
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Export Audit CSV
                </button>
              </div>

              {/* Filter */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by donor name or bag serial number..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <select
                  value={historyGroupFilter}
                  onChange={(e) => setHistoryGroupFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none focus:border-slate-400 transition-colors"
                >
                  <option value="all">All Blood Groups</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4">Donation ID</th>
                        <th className="py-2.5 px-4">Donor Name</th>
                        <th className="py-2.5 px-4">Group</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Measured Vitals</th>
                        <th className="py-2.5 px-4">Bag Serial</th>
                        <th className="py-2.5 px-4">Volume</th>
                        <th className="py-2.5 px-4">Quarantine Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.donationRecords || [])
                        .filter((r) => {
                          const matchesSearch =
                            r.donorName.toLowerCase().includes(historySearch.toLowerCase()) ||
                            r.bagSerial.toLowerCase().includes(historySearch.toLowerCase()) ||
                            r.id.toLowerCase().includes(historySearch.toLowerCase())
                          const matchesGroup =
                            historyGroupFilter === 'all' || r.bloodGroup === historyGroupFilter
                          return matchesSearch && matchesGroup
                        })
                        .map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 tabular-nums font-semibold text-slate-800">
                              {rec.id}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">{rec.donorName}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                                {rec.bloodGroup}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {new Date(rec.collectionDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              Hb: <span className="font-semibold">{rec.hemoglobin} g/dL</span> · BP:{' '}
                              <span className="font-semibold">
                                {rec.bpSystolic}/{rec.bpDiastolic}
                              </span>
                            </td>
                            <td className="py-3 px-4 tabular-nums font-mono text-slate-600">{rec.bagSerial}</td>
                            <td className="py-3 px-4 font-medium text-slate-800 tabular-nums">
                              {rec.volume} ml
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                                  rec.quarantineStatus === 'released'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {rec.quarantineStatus === 'released'
                                  ? 'Stock Released'
                                  : 'In Lab Testing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. QUALITY & LAB TESTS: LABORATORY PIPELINE WORKFLOW */}
          {/* ========================================================================= */}
          {activeTab === 'quality' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Laboratory Quality &amp; Screening Pipeline
                </h2>
              </div>

              {/* Lab Workflow Pipeline Bar (Minimalist Linear/Stripe style) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">1. Collection</span>
                      <span className="text-[10px] font-mono text-slate-400">STAGE 01</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Quarantined Whole Blood</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">2. Serology Panel</span>
                      <span className="text-[10px] font-mono text-slate-400">STAGE 02</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">HIV, HBV, HCV, Syphilis, Malaria</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">3. Separation</span>
                      <span className="text-[10px] font-mono text-slate-400">STAGE 03</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">PRBC, FFP &amp; Platelets</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-800">4. Verification</span>
                      <span className="text-[10px] font-mono text-emerald-600">RELEASE</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Audit sign-off to active stock</p>
                  </div>
                </div>
              </div>

              {/* Quarantined Units List */}
              <div className="space-y-3">
                {(data.quarantineUnits || []).map((unit) => (
                    <div
                      key={unit.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            {unit.bloodGroup}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900">
                                Unit #{unit.id}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({unit.bagSerial})
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded capitalize ${
                                  unit.status === 'released'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {unit.status === 'released'
                                  ? 'Released into Inventory'
                                  : 'In Testing'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Donor: {unit.donorName} · Volume: <span className="tabular-nums">{unit.volume}</span> ml · Collected:{' '}
                              {new Date(unit.collectionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setLabUnit(unit)}
                          className={unit.status === 'released' ? btnSecondary : btnPrimary}
                        >
                          {unit.status === 'released' ? 'View Test Details' : 'Process & Release Unit'}
                        </button>
                      </div>

                      {/* 5 Serology Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        {[
                          ['HIV 1 & 2', unit.screening.hiv],
                          ['Hep B', unit.screening.hbv],
                          ['Hep C', unit.screening.hcv],
                          ['Syphilis', unit.screening.syphilis],
                          ['Malaria', unit.screening.malaria],
                        ].map(([test, res]) => (
                          <div
                            key={test}
                            className={`p-2 rounded-md border text-[11px] ${
                              res === 'negative'
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="font-medium text-slate-900">{test}</div>
                            <div className="text-[10px] capitalize mt-0.5 text-slate-500">
                              {res === 'negative' ? 'Non-Reactive' : 'Pending'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. REPORTS & ANALYTICS: OPERATIONAL KPIS & CSV DOWNLOAD */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Hospital Operational Reports</h2>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={btnSecondary}
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Export Operational CSV
                </button>
              </div>

              {/* 4 Clean Metric Cards without decorative icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-slate-500">Monthly Collections</span>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">142 units</div>
                  <span className="text-[11px] text-emerald-600 font-medium">+12% vs last month</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-slate-500">Fulfillment Rate</span>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">96.4%</div>
                  <span className="text-[11px] text-slate-500">Transfusion delivery</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-slate-500">Average Exam Duration</span>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">14 min</div>
                  <span className="text-[11px] text-slate-500">Clinical screening</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-slate-500">Component Yield</span>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">98.2%</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Viable PRBC &amp; FFP</span>
                </div>
              </div>

              {/* Operational Visual Analytics Suite */}
              <div className="space-y-6">
                <BloodTrendChart
                  requests={data.requests}
                  appointments={data.appointments}
                  donationRecords={data.donationRecords}
                />
                <BloodGroupDistributionChart inventory={data.inventory} />
              </div>

              {/* Blood Group Distribution Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="text-xs font-semibold text-slate-900">
                    Current Blood Inventory Distribution
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4">Blood Group</th>
                        <th className="py-2.5 px-4">Available Stock</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Reserve Target</th>
                        <th className="py-2.5 px-4">Deficit / Surplus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.inventory.map((i) => {
                        const target = 15
                        const diff = i.units - target
                        return (
                          <tr key={i.bloodGroup} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{i.bloodGroup}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-800 tabular-nums">{i.units} units</td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                  i.units >= 10
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : i.units >= 5
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {i.units >= 10
                                  ? 'Optimal'
                                  : i.units >= 5
                                  ? 'Low Stock'
                                  : 'Critical Deficit'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 tabular-nums">{target} units</td>
                            <td
                              className={`py-2.5 px-4 font-semibold tabular-nums ${
                                diff >= 0 ? 'text-emerald-600' : 'text-[#D92027]'
                              }`}
                            >
                              {diff >= 0 ? `+${diff}` : diff} units
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. HOSPITAL PROFILE: EDITABLE OFFICIAL FACILITY INFORMATION */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Hospital &amp; Blood Bank Profile</h2>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full text-xs font-normal px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Blood Bank License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.licenseNumber}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, licenseNumber: e.target.value })
                      }
                      className="w-full text-xs tabular-nums font-mono px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full text-xs font-normal px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emergency 24/7 Hotline
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.hotline}
                      onChange={(e) => setProfileForm({ ...profileForm, hotline: e.target.value })}
                      className="w-full text-xs font-normal px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Medical Officer in Charge
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.medicalOfficer}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, medicalOfficer: e.target.value })
                      }
                      className="w-full text-xs font-normal px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.operatingHours}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, operatingHours: e.target.value })
                    }
                    className="w-full text-xs font-normal px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white text-slate-900 transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className={btnPrimary}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. ACCOUNT SETTINGS: HOSPITAL ACCOUNT & DEMO RESET */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Hospital Account Settings</h2>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Facility Authorization</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Registered State Blood Transfusion Council Center
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Institution
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Staff Role</span>
                    <strong className="text-slate-900 font-medium">Senior Transfusion Officer / Admin</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Security Clearance</span>
                    <strong className="text-slate-900 font-medium">Full Phlebotomy &amp; Release Privileges</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Demo Prototype Session</span>
                    <strong className="text-slate-900 font-medium">ACTIVE (Apollo Hospitals)</strong>
                  </div>
                </div>

                {/* Reset Demo Option */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">Reset Demo Scenario State</h5>
                    <p className="text-[11px] text-slate-500">
                      Restores initial Apollo Hospitals requests, appointments, and inventory numbers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className={btnDanger}
                  >
                    Reset Demo State
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS RENDERING */}
      {/* ========================================================================= */}

      {/* 1. Broadcast Emergency Need Modal */}
      {broadcastModalOpen && (
        <BroadcastEmergencyModal
          criticalGroups={criticalDeficitGroups}
          onClose={() => setBroadcastModalOpen(false)}
          onBroadcast={handleBroadcast}
        />
      )}

      {/* 2. Stock Adjustment Modal */}
      {stockModalOpen && (
        <StockAdjustmentModal
          inventory={data.inventory}
          onClose={() => setStockModalOpen(false)}
          onAdjust={handleAdjustStock}
        />
      )}

      {/* 3. Coordinate Donors Modal */}
      {coordinatingRequest && (
        <CoordinateDonorsModal
          request={coordinatingRequest}
          donors={data.donors}
          onClose={() => setCoordinatingRequest(null)}
          onInviteDonor={handleInviteDonor}
        />
      )}

      {/* 4. Create New Patient Request Modal */}
      {createRequestModalOpen && (
        <HospitalRequestModal
          onClose={() => setCreateRequestModalOpen(false)}
          onCreate={handleCreateRequest}
        />
      )}

      {/* 5. Schedule Assessment Modal */}
      {schedulingDonor && (
        <ScheduleAssessmentModal
          donor={schedulingDonor}
          requests={data.requests}
          onClose={() => setSchedulingDonor(null)}
          onSchedule={handleScheduleDonor}
        />
      )}

      {/* 6. Clinical Assessment Modal */}
      {clinicalAppointment && (
        <ClinicalAssessmentModal
          appointment={clinicalAppointment}
          onClose={() => setClinicalAppointment(null)}
          onApprove={handleApproveClinical}
          onReject={handleRejectClinical}
        />
      )}

      {/* 7. Phlebotomy Collection Modal */}
      {phlebotomyAppointment && (
        <PhlebotomyCollectionModal
          appointment={phlebotomyAppointment}
          onClose={() => setPhlebotomyAppointment(null)}
          onConfirmCollection={handleConfirmCollection}
        />
      )}

      {/* 8. Laboratory Quality & Testing Modal */}
      {labUnit && (
        <LabTestingModal
          unit={labUnit}
          onClose={() => setLabUnit(null)}
          onUpdateUnit={handleUpdateQuarantineUnit}
          onReleaseToStock={handleReleaseToStock}
          onRejectUnit={handleRejectQuarantineUnit}
        />
      )}

      {/* 9. Donor Profile Modal */}
      {inspectingDonor && (
        <DonorProfileModal
          donor={inspectingDonor}
          onClose={() => setInspectingDonor(null)}
          onSchedule={(d) => {
            setInspectingDonor(null)
            setSchedulingDonor(d)
          }}
        />
      )}

      {/* 10. Cancel Appointment Confirmation Dialog */}
      {cancelTargetAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#D92027]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Cancel Appointment Slot?</h4>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to release and cancel the scheduled assessment for{' '}
              <strong className="text-slate-900">
                {typeof cancelTargetAppointment.donor === 'object'
                  ? cancelTargetAppointment.donor.name
                  : 'Donor'}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelTargetAppointment(null)}
                className={btnSecondary}
              >
                Keep Slot
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCancelAppointment('Staff cancellation')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
              >
                Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
