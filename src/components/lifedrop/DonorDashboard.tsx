'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Heart,
  Droplet,
  CalendarDays,
  History,
  UserRound,
  LayoutDashboard,
  Bell,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Phone,
  ChevronRight,
  AlertTriangle,
  Award,
  Info,
  Menu,
} from 'lucide-react'
import { Logo } from './ui'
import GuidedDonationModal from './GuidedDonationModal'
import type { BloodRequest, Hospital, Appointment, ResponseRecord, Profile, DashboardData } from './dashboard-data'
import { demoScenario } from './dashboard-data'

interface DonorDashboardProps {
  initialData: DashboardData
  onSwitchRole: (role: 'donor' | 'hospital' | 'receiver') => void
  onSignOut?: () => void
}

// Semantic Button Design System (LifeDrop Healthcare Platform Standard)
const btnBase =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2'
const btnPrimary = `${btnBase} bg-[#D92027] text-white hover:bg-[#b8181e] focus-visible:outline-[#D92027] shadow-2xs`
const btnSecondary = `${btnBase} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-slate-400 shadow-2xs`
const btnSuccess = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 shadow-2xs`
const btnDanger = `${btnBase} bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:outline-red-500 shadow-2xs`
const btnDangerFilled = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-2xs`
const btnGhost = `${btnBase} bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`

export default function DonorDashboard({ initialData, onSwitchRole, onSignOut }: DonorDashboardProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'appointments' | 'history' | 'profile'>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation items matching unified compact sidebar layout
  const donorNavItems = [
    { key: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { key: 'requests' as const, label: 'Blood requests', icon: Droplet },
    { key: 'appointments' as const, label: 'My appointments', icon: CalendarDays },
    { key: 'history' as const, label: 'Donation history', icon: History },
    { key: 'profile' as const, label: 'Profile & health', icon: UserRound },
  ]

  // Main local data state
  const [user, setUser] = useState<Profile>(initialData.user)
  const [requests, setRequests] = useState<BloodRequest[]>(initialData.requests)
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments)
  const [responses, setResponses] = useState<ResponseRecord[]>(initialData.responses)
  const [hospitals] = useState<Hospital[]>(initialData.hospitals)

  // Guided Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [targetRequestForBooking, setTargetRequestForBooking] = useState<BloodRequest | null>(null)

  // Reschedule Modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null)
  const [newRescheduleSlot, setNewRescheduleSlot] = useState('')

  // Cancel Confirmation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null)

  // Blood Requests tab filter & search
  const [requestFilter, setRequestFilter] = useState<'all' | 'urgent' | 'responses'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Notifications dropdown & toast state
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(2)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Profile form state
  const [profileName, setProfileName] = useState(user.name)
  const [profileCity, setProfileCity] = useState(user.city)
  const [profileBloodGroup, setProfileBloodGroup] = useState(user.bloodGroup)

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const showToast = (msg: string) => setToastMessage(msg)

  // Derived counts & records
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => ['requested', 'scheduled', 'approved'].includes(a.status)),
    [appointments],
  )
  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed'),
    [appointments],
  )
  const nextUpcomingAppointment = upcomingAppointments[0] || null

  const totalDonations = completedAppointments.length
  const estimatedLivesSaved = totalDonations * 3

  // Reset demo function
  const handleResetDemo = () => {
    const fresh = demoScenario('donor')
    setUser(fresh.user)
    setRequests(fresh.requests)
    setAppointments(fresh.appointments)
    setResponses(fresh.responses)
    setProfileName(fresh.user.name)
    setProfileCity(fresh.user.city)
    setProfileBloodGroup(fresh.user.bloodGroup)
    setUnreadNotifications(2)
    showToast('Demo data restored to initial state.')
  }

  // Availability toggle
  const toggleAvailability = () => {
    const nextVal = !user.available
    setUser((prev: Profile) => ({ ...prev, available: nextVal }))
    showToast(nextVal ? 'Availability set to: Available to help.' : 'Availability set to: Taking a break.')
  }

  // Request actions
  const handleHelpClick = (req: BloodRequest) => {
    // Add interested response
    const existingIdx = responses.findIndex((r) => {
      const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
      return rId === req.id
    })

    if (existingIdx >= 0) {
      setResponses((prev) =>
        prev.map((r, i) => (i === existingIdx ? { ...r, decision: 'accepted', status: 'interested' } : r)),
      )
    } else {
      setResponses((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          request: req.id,
          decision: 'accepted',
          status: 'interested',
          donor: user,
        },
      ])
    }

    showToast(`Interest registered for ${typeof req.hospital === 'object' ? req.hospital.name : 'request'}. You can now schedule an assessment slot.`)
  }

  const handleWithdrawClick = (req: BloodRequest) => {
    setResponses((prev) =>
      prev.map((r) => {
        const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
        if (rId === req.id) {
          return { ...r, status: 'withdrawn' }
        }
        return r
      }),
    )
    showToast('Interest withdrawn. The blood request remains available.')
  }

  const handleDeclineClick = (req: BloodRequest) => {
    setResponses((prev) => [
      ...prev.filter((r) => {
        const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
        return rId !== req.id
      }),
      {
        id: `resp-${Date.now()}`,
        request: req.id,
        decision: 'rejected',
        status: 'cancelled',
        donor: user,
      },
    ])
    showToast('Request declined.')
  }

  const openBookingModal = (req: BloodRequest) => {
    setTargetRequestForBooking(req)
    setBookingModalOpen(true)
  }

  // Handle completion from Guided Booking Modal
  const handleBookingComplete = (data: {
    hospitalId: string
    hospitalName: string
    date: string
    requestId: string
  }) => {
    const targetHosp = hospitals.find((h) => h.id === data.hospitalId) || hospitals[0]

    // Create new appointment
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      donor: user,
      hospital: targetHosp,
      request: data.requestId,
      date: data.date,
      status: 'scheduled',
    }

    setAppointments((prev) => [newApt, ...prev])

    // Update response status to scheduled
    setResponses((prev) =>
      prev.map((r) => {
        const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
        if (rId === data.requestId) {
          return { ...r, status: 'scheduled' }
        }
        return r
      }),
    )

    // Update request status to coordinating if pending
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === data.requestId && req.status === 'pending') {
          return { ...req, status: 'coordinating' }
        }
        return req
      }),
    )

    showToast(`Assessment scheduled at ${data.hospitalName}!`)
  }

  // Handle Cancellation
  const confirmCancelAppointment = () => {
    if (!cancellingAppointment) return

    const reqId =
      cancellingAppointment.request && typeof cancellingAppointment.request === 'object'
        ? (cancellingAppointment.request as any).id
        : cancellingAppointment.request

    // Update appointment to cancelled
    setAppointments((prev) =>
      prev.map((a) => (a.id === cancellingAppointment.id ? { ...a, status: 'cancelled' } : a)),
    )

    // Update linked response
    if (reqId) {
      setResponses((prev) =>
        prev.map((r) => {
          const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
          const donorId = typeof r.donor === 'object' && r.donor !== null ? (r.donor as any).id : String(r.donor)
          if (rId === reqId && donorId === user.id) {
            return { ...r, status: 'cancelled' }
          }
          return r
        }),
      )

      // Revert request status if no other active appointments exist
      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === reqId && (req.fulfilledUnits ?? 0) === 0) {
            return { ...req, status: 'pending' }
          }
          return req
        }),
      )
    }

    setCancelModalOpen(false)
    setCancellingAppointment(null)
    showToast('Appointment cancelled. Your reservation has been safely released.')
  }

  // Handle Rescheduling
  const confirmRescheduleAppointment = () => {
    if (!reschedulingAppointment) return

    const d = new Date()
    d.setDate(d.getDate() + 3) // +3 days
    const newDateIso = d.toISOString()

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === reschedulingAppointment.id ? { ...a, date: newDateIso, status: 'scheduled' } : a,
      ),
    )

    setRescheduleModalOpen(false)
    setReschedulingAppointment(null)
    showToast('Appointment rescheduled successfully!')
  }

  // Filtered requests for Requests tab
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Search matching
      const hospName = typeof r.hospital === 'object' && r.hospital !== null ? r.hospital.name : ''
      const searchMatch =
        hospName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())

      if (!searchMatch) return false

      if (requestFilter === 'urgent') return r.urgency === 'emergency'
      if (requestFilter === 'responses') {
        return responses.some((resp) => {
          const respReqId = typeof resp.request === 'object' ? (resp.request as any).id : resp.request
          return respReqId === r.id && resp.status !== 'withdrawn'
        })
      }
      return true
    })
  }, [requests, searchQuery, requestFilter, responses])

  // Get donor's response for a request
  const getDonorResponse = (reqId: string) => {
    return responses.find((r) => {
      const rId = typeof r.request === 'object' && r.request !== null ? (r.request as any).id : String(r.request)
      const donorId = typeof r.donor === 'object' && r.donor !== null ? (r.donor as any).id : String(r.donor)
      return rId === reqId && (donorId === user.id || !r.donor)
    })
  }

  // Helper for hospital name
  const getHospName = (hosp: unknown) =>
    typeof hosp === 'object' && hosp !== null && 'name' in hosp ? (hosp as any).name : 'Hospital'

  return (
    <div className="h-screen bg-[#FBFBFC] text-zinc-900 font-sans antialiased flex flex-col overflow-hidden selection:bg-[#D92027]/15 selection:text-[#D92027]">
      {/* Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-zinc-950/10 bg-zinc-950 px-4.5 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D92027] text-white">
            <Check size={12} strokeWidth={3} />
          </span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </aside>
      )}

      {/* TOP FIXED HEADER */}
      <header className="shrink-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 py-2.5 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left: Hamburger, Brand & Donor Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              <Menu size={18} />
            </button>
            <Logo />
            <div className="hidden h-4 w-px bg-slate-200 sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">Donor Space</span>
              <span className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold border border-red-200 bg-red-50 text-[#D92027]">
                <Droplet className="w-3 h-3 fill-current" />
                {user.bloodGroup}
              </span>
            </div>
          </div>

          {/* Right Controls: Availability, Role Switcher, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Availability Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs">
              <span className="hidden sm:inline font-medium text-slate-600">
                {user.available ? 'Available' : 'Paused'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={!!user.available}
                onClick={toggleAvailability}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user.available ? 'bg-[#D92027]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-2xs transform ring-0 transition duration-200 ease-in-out ${
                    user.available ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#D92027] text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Donor Notifications
                    </h3>
                    <button
                      onClick={() => setUnreadNotifications(0)}
                      className="text-[11px] font-medium text-[#D92027] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="mt-2.5 divide-y divide-slate-100 text-xs">
                    <div className="py-2">
                      <p className="font-semibold text-slate-900">Emergency Alert in Mumbai</p>
                      <p className="mt-0.5 text-slate-500">
                        Apollo Hospitals needs 2 units of O+ blood urgently.
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">45 mins ago</span>
                    </div>
                    <div className="py-2">
                      <p className="font-semibold text-slate-900">Upcoming Assessment Scheduled</p>
                      <p className="mt-0.5 text-slate-500">
                        Lilavati Hospital in 2 days. Don’t forget to hydrate!
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Segmented Control */}
            <div className="flex items-center rounded-lg bg-slate-100/90 p-0.5 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => onSwitchRole('donor')}
                className="rounded-md bg-white px-2.5 py-1 text-[#D92027] font-semibold shadow-2xs transition-colors"
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('hospital')}
                className="rounded-md px-2.5 py-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Hospital
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('receiver')}
                className="rounded-md px-2.5 py-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Receiver
              </button>
            </div>

            {/* Reset Demo button */}
            <button
              type="button"
              onClick={handleResetDemo}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Reset sample data"
              aria-label="Reset Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Avatar Pill */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <span className="flex size-6 items-center justify-center rounded bg-red-50 text-[11px] font-bold text-[#D92027]">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-slate-900">
                {user.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: FIXED SIDEBAR + INDEPENDENTLY SCROLLABLE CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-200/80 p-4 h-full overflow-y-auto">
          <div className="space-y-1">
            {donorNavItems.map((item) => {
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
                    <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.key === 'requests' && requests.length > 0 && (
                    <span className="size-5 rounded-full bg-[#FFF1F1] text-[#D92027] text-[11px] font-bold flex items-center justify-center shrink-0">
                      {requests.length}
                    </span>
                  )}
                  {item.key === 'appointments' && upcomingAppointments.length > 0 && (
                    <span className="size-5 rounded-full bg-[#D92027] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {upcomingAppointments.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Donor Eligibility Card */}
          <div className="mt-6 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>Eligibility</span>
              <span className="text-emerald-700 tabular-nums text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {nextUpcomingAppointment ? 'IN REVIEW' : user.available ? 'ELIGIBLE' : 'PAUSED'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {nextUpcomingAppointment
                ? 'Appointment confirmed'
                : user.available
                ? '120-day interval satisfied'
                : 'Availability paused'}
            </div>
            <div className="pt-1.5 border-t border-slate-200 text-[10.5px] font-medium text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#D92027]" />
              <span>Support: 112</span>
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

                {donorNavItems.map((item) => {
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
                        <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.key === 'requests' && requests.length > 0 && (
                        <span className="size-5 rounded-full bg-[#FFF1F1] text-[#D92027] text-[11px] font-bold flex items-center justify-center shrink-0">
                          {requests.length}
                        </span>
                      )}
                      {item.key === 'appointments' && upcomingAppointments.length > 0 && (
                        <span className="size-5 rounded-full bg-[#D92027] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {upcomingAppointments.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Mobile Quick Donor Eligibility Card */}
              <div className="mt-6 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Eligibility</span>
                  <span className="text-emerald-700 tabular-nums text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {nextUpcomingAppointment ? 'IN REVIEW' : user.available ? 'ELIGIBLE' : 'PAUSED'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {nextUpcomingAppointment
                    ? 'Appointment confirmed'
                    : user.available
                    ? '120-day interval satisfied'
                    : 'Availability paused'}
                </div>
                <div className="pt-1.5 border-t border-slate-200 text-[10.5px] font-medium text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#D92027]" />
                  <span>Support: 112</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN INDEPENDENTLY SCROLLABLE CONTENT */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-5 lg:p-7 space-y-5">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* COMPACT UPCOMING APPOINTMENT SECTION */}
            {nextUpcomingAppointment ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Upcoming Clinical Assessment
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Confirmed Slot
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-slate-900">
                      {getHospName(nextUpcomingAppointment.hospital)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {new Date(nextUpcomingAppointment.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>{' '}
                        at 10:30 AM
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {typeof nextUpcomingAppointment.hospital === 'object' && nextUpcomingAppointment.hospital !== null
                          ? (nextUpcomingAppointment.hospital as any).address || 'Mumbai'
                          : 'Mumbai'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('appointments')}
                      className={btnPrimary}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingAppointment(nextUpcomingAppointment)
                        setCancelModalOpen(true)
                      }}
                      className={btnDanger}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-700">
                    <strong className="text-slate-900">Preparation:</strong> 500ml water, light meal 2h prior, alcohol-free 24h, government photo ID.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                      Ready to Donate
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    2 urgent requests match your {user.bloodGroup} blood in Mumbai
                  </h3>
                  <p className="text-xs text-slate-500">
                    120-day interval satisfied · Select a request to reserve an assessment slot
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className={btnPrimary}
                >
                  <span>Explore Blood Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* IMPACT STATISTIC CARDS (3 Columns) */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-0.5">
                <span className="text-xs font-medium text-slate-500">Total Donations</span>
                <p className="tabular-nums text-2xl font-bold text-slate-900">
                  {totalDonations} <span className="text-xs font-normal text-slate-500">collections</span>
                </p>
                <p className="text-[11px] text-slate-500">Verified clinical records</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-0.5">
                <span className="text-xs font-medium text-slate-500">Lives Supported</span>
                <p className="tabular-nums text-2xl font-bold text-slate-900">
                  {estimatedLivesSaved} <span className="text-xs font-normal text-slate-500">patients</span>
                </p>
                <p className="text-[11px] text-slate-500">PRBC &amp; Platelet yields</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-0.5">
                <span className="text-xs font-medium text-slate-500">Eligibility Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      nextUpcomingAppointment
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : user.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {nextUpcomingAppointment
                      ? 'Awaiting Clinical Review'
                      : user.available
                      ? 'Eligible for Donation'
                      : 'Temporarily Deferred'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  {user.available ? '120-day interval satisfied' : 'Availability paused'}
                </p>
              </div>
            </div>

            {/* TWO-COLUMN COMMAND CENTER */}
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              {/* LEFT: URGENT MATCHING REQUESTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Matching Blood Requests</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={btnGhost}
                  >
                    <span>View all ({requests.length})</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="space-y-3">
                  {requests.slice(0, 3).map((r) => {
                    const resp = getDonorResponse(r.id)
                    const hospName = getHospName(r.hospital)
                    const isEmergency = r.urgency === 'emergency'

                    return (
                      <article
                        key={r.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center border shrink-0 ${
                                isEmergency
                                  ? 'bg-red-50 text-[#D92027] border-red-200'
                                  : 'bg-slate-100 text-slate-900 border-slate-200'
                              }`}
                            >
                              {r.bloodGroup}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-slate-900">{hospName}</h4>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    isEmergency
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {isEmergency ? 'Emergency' : 'Standard'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{r.city}</span>
                                <span>·</span>
                                <span className="tabular-nums font-medium text-slate-700">
                                  {r.units} units needed
                                </span>
                                <span>·</span>
                                <span className="tabular-nums text-emerald-700 font-medium">
                                  {r.fulfilledUnits ?? 0} fulfilled
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D92027] h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round(((r.fulfilledUnits ?? 0) / r.units) * 100))}%`,
                            }}
                          />
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-500">
                            {resp?.status === 'scheduled'
                              ? 'Assessment scheduled'
                              : resp?.status === 'interested'
                              ? 'Interest registered'
                              : 'No commitment yet'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {(!resp || resp.status === 'withdrawn' || resp.decision === 'rejected') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineClick(r)}
                                  className={btnSecondary}
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleHelpClick(r)}
                                  className={btnPrimary}
                                >
                                  <Heart className="w-3 h-3 fill-current" />
                                  <span>I Want to Help</span>
                                </button>
                              </>
                            )}

                            {resp?.status === 'interested' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleWithdrawClick(r)}
                                  className={btnSecondary}
                                >
                                  Withdraw
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openBookingModal(r)}
                                  className={btnPrimary}
                                >
                                  <CalendarDays className="w-3 h-3" />
                                  <span>Schedule Assessment</span>
                                </button>
                              </>
                            )}

                            {resp?.status === 'scheduled' && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('appointments')}
                                className={btnSecondary}
                              >
                                <span>View Appointment</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT: DONOR PASSPORT & CLINICAL ELIGIBILITY GUIDELINES */}
              <div className="space-y-4">
                {/* DONOR PASSPORT (Healthcare Identity Card) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Donor Passport
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Donor
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.city}, India</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        ID: #LD-9482 · ABO Verified
                      </p>
                    </div>
                    <span className="w-12 h-12 rounded-lg bg-slate-100 text-slate-900 text-base font-bold flex items-center justify-center border border-slate-200 shrink-0">
                      {user.bloodGroup}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Donation Date:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(Date.now() - 125 * 86400000).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Eligible Date:</span>
                      <span className="font-semibold text-emerald-700">Eligible Today</span>
                    </div>
                  </div>
                </div>

                {/* ELIGIBILITY & CLINICAL SCREENING GUIDELINES */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Eligibility Screening Checklist
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">POLICY 2026-WB</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>Age Requirement (18–65 yrs)</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified (28 yrs)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>Weight Requirement (≥ 50 kg)</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified (68 kg)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>120-Day Donation Interval</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Satisfied (125 d)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>24-Hour Alcohol Window</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Compliant
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>Haemoglobin Measurement</span>
                      <span className="text-slate-500 font-medium">
                        On-site Clinical Exam
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                    <strong>Medical Safety:</strong> Hemoglobin (≥ 12.5 g/dL) is measured on-site during your hospital clinical appointment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BLOOD REQUESTS */}
        {/* ======================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filter & Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setRequestFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    requestFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Matching ({requests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRequestFilter('urgent')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    requestFilter === 'urgent'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Urgent Only ({requests.filter((r) => r.urgency === 'emergency').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRequestFilter('responses')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    requestFilter === 'responses'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  My Responses (
                  {
                    responses.filter((r) => {
                      const donorId = typeof r.donor === 'object' && r.donor !== null ? (r.donor as any).id : String(r.donor)
                      return r.status !== 'withdrawn' && donorId === user.id
                    }).length
                  }
                  )
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospital or area…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] focus:outline-none"
                />
              </div>
            </div>

            {/* Request Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRequests.map((r) => {
                const resp = getDonorResponse(r.id)
                const hospName = getHospName(r.hospital)
                const isEmergency = r.urgency === 'emergency'

                return (
                  <article
                    key={r.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-11 h-11 rounded-lg font-bold text-sm flex items-center justify-center border shrink-0 ${
                            isEmergency
                              ? 'bg-red-50 text-[#D92027] border-red-200'
                              : 'bg-slate-100 text-slate-900 border-slate-200'
                          }`}
                        >
                          {r.bloodGroup}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-900">{hospName}</h4>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                isEmergency
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {isEmergency ? 'Emergency' : 'Standard'}
                            </span>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {typeof r.hospital === 'object' && r.hospital !== null
                              ? (r.hospital as any).address || r.city
                              : r.city}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
                            <span>
                              Units: <b className="text-slate-900 font-semibold">{r.units}</b> needed
                            </span>
                            <span className="font-semibold text-emerald-700">
                              {r.fulfilledUnits ?? 0} fulfilled
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#D92027] transition-all"
                              style={{
                                width: `${Math.min(100, Math.round(((r.fulfilledUnits ?? 0) / r.units) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="text-[11px] text-slate-500">
                        {resp?.status === 'scheduled'
                          ? 'Assessment scheduled'
                          : resp?.status === 'interested'
                            ? 'Interest registered'
                            : 'No commitment yet'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {(!resp || resp.status === 'withdrawn' || resp.decision === 'rejected') && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeclineClick(r)}
                              className={btnSecondary}
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHelpClick(r)}
                              className={btnPrimary}
                            >
                              <Heart className="w-3 h-3 fill-current" />
                              <span>I Want to Help</span>
                            </button>
                          </>
                        )}

                        {resp?.status === 'interested' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleWithdrawClick(r)}
                              className={btnSecondary}
                            >
                              Withdraw
                            </button>
                            <button
                              type="button"
                              onClick={() => openBookingModal(r)}
                              className={btnPrimary}
                            >
                              <CalendarDays className="w-3 h-3" />
                              <span>Schedule Assessment</span>
                            </button>
                          </>
                        )}

                        {resp?.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('appointments')}
                            className={btnSecondary}
                          >
                            <span>View Appointment</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {filteredRequests.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <Droplet className="w-8 h-8 mx-auto text-slate-300" />
                <h4 className="mt-3 text-sm font-semibold text-slate-900">No matching requests found</h4>
                <p className="mt-1 text-descriptive-empty">
                  Try adjusting your filter or search keywords.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY APPOINTMENTS */}
        {/* ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* UPCOMING SECTION */}
            <div className="space-y-3.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Appointments</h3>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => {
                    const hospName = getHospName(apt.hospital)
                    const hospAddress =
                      typeof apt.hospital === 'object' && apt.hospital !== null
                        ? (apt.hospital as any).address || 'Mumbai'
                        : 'Mumbai'

                    return (
                      <div
                        key={apt.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
                      >
                        {/* Top Info */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex w-12 h-12 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-900 border border-slate-200">
                              <span className="tabular-nums text-lg font-bold leading-none">
                                {new Date(apt.date).getDate()}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-slate-500">
                                {new Date(apt.date).toLocaleDateString('en-IN', { month: 'short' })}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-900">{hospName}</h4>
                                <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Confirmed Slot
                                </span>
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long' })}{' '}
                                · 10:30 AM
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {hospAddress} · Blood Bank Wing (1st Floor)
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${hospName} ${hospAddress}`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={btnSecondary}
                            >
                              <span>Directions</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingAppointment(apt)
                                setRescheduleModalOpen(true)
                              }}
                              className={btnSecondary}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingAppointment(apt)
                                setCancelModalOpen(true)
                              }}
                              className={btnDanger}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* STATUS TIMELINE */}
                        <div className="border-t border-slate-100 pt-3.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                            Donation Journey Progress
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {/* Step 1 */}
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
                              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                                ✓
                              </span>
                              <p className="mt-1.5 text-xs font-semibold text-slate-900">1. Interest Registered</p>
                              <p className="text-[10px] text-slate-500">Patient need confirmed</p>
                            </div>

                            {/* Step 2 */}
                            <div className="rounded-lg border border-red-200 bg-red-50/60 p-2.5">
                              <span className="flex size-4 items-center justify-center rounded-full bg-[#D92027] text-white text-[9px] font-bold">
                                2
                              </span>
                              <p className="mt-1.5 text-xs font-semibold text-[#D92027]">2. Slot Scheduled</p>
                              <p className="text-[10px] text-red-600">Current Stage</p>
                            </div>

                            {/* Step 3 */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                              <span className="flex size-4 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold">
                                3
                              </span>
                              <p className="mt-1.5 text-xs font-semibold text-slate-700">3. Hospital Clinical Check</p>
                              <p className="text-[10px] text-slate-500">Vital & hemoglobin tests</p>
                            </div>

                            {/* Step 4 */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                              <span className="flex size-4 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold">
                                4
                              </span>
                              <p className="mt-1.5 text-xs font-semibold text-slate-700">4. Donation Completed</p>
                              <p className="text-[10px] text-slate-500">Delivered to patient</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                  <CalendarDays className="w-8 h-8 mx-auto text-slate-300" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-900">No upcoming appointments</h4>
                  <p className="mt-1 text-descriptive-empty">
                    When you schedule an assessment for a blood request, your appointment will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className={`mt-4 ${btnPrimary}`}
                  >
                    View Blood Requests
                  </button>
                </div>
              )}
            </div>

            {/* PAST APPOINTMENTS */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Past Appointments</h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs">
                {appointments
                  .filter((a) => ['completed', 'cancelled'].includes(a.status))
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3.5 text-xs">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900">{getHospName(a.hospital)}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(a.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          a.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DONATION HISTORY */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-1">
                <span className="text-xs font-medium text-slate-500">Total Whole-Blood Donations</span>
                <p className="tabular-nums text-2xl font-bold text-slate-900">{totalDonations}</p>
                <p className="text-[11px] text-slate-500">Approx. 900 ml blood donated</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-1">
                <span className="text-xs font-medium text-slate-500">Estimated Lives Saved</span>
                <p className="tabular-nums text-2xl font-bold text-slate-900">{estimatedLivesSaved}</p>
                <p className="text-[11px] text-slate-500">Components used across recipients</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-1">
                <span className="text-xs font-medium text-slate-500">Next Eligible Donation Date</span>
                <p className="text-2xl font-bold text-slate-900">Eligible Today</p>
                <p className="text-[11px] text-emerald-700 font-semibold">120-day interval satisfied</p>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D92027]" />
                Earned Milestones
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-center">
                  <span className="text-xl">🥉</span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">First Drop</p>
                  <p className="text-[10px] text-slate-500">Completed 1st donation</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-center">
                  <span className="text-xl">🥈</span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">Lifesaver</p>
                  <p className="text-[10px] text-slate-500">2+ verified donations</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-center">
                  <span className="text-xl">🚨</span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">Emergency Hero</p>
                  <p className="text-[10px] text-slate-500">Responded to urgent call</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-center">
                  <span className="text-xl">🛡️</span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">Verified Donor</p>
                  <p className="text-[10px] text-slate-500">Blood group authenticated</p>
                </div>
              </div>
            </div>

            {/* Completed Donations Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Completed Donation Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Hospital</th>
                      <th className="py-2.5 px-4">Blood Group</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Clinical Certification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedAppointments.map((a) => (
                      <tr key={a.id} className="text-slate-800 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          {new Date(a.completedAt || a.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{getHospName(a.hospital)}</td>
                        <td className="py-3 px-4 font-semibold text-[#D92027]">{user.bloodGroup}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified by Hospital Medical Staff</span>
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

        {/* ======================================================== */}
        {/* TAB 5: PROFILE & HEALTH */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Profile Form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Donor Profile Information</h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setUser((prev: Profile) => ({
                    ...prev,
                    name: profileName,
                    city: profileCity,
                    bloodGroup: profileBloodGroup,
                  }))
                  showToast('Profile information saved.')
                }}
                className="space-y-3.5 text-xs font-medium"
              >
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-700">Full Name</span>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] focus:outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-700">City / Location</span>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] focus:outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-700">Registered Email Address</span>
                  <input
                    type="email"
                    readOnly
                    value={user.email || 'donor@lifedrop.example'}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-700">Blood Group</span>
                  <select
                    value={profileBloodGroup || 'O+'}
                    onChange={(e) => setProfileBloodGroup(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!user.available}
                    onChange={toggleAvailability}
                    className="size-4 rounded border-slate-300 accent-[#D92027]"
                  />
                  <span>I am available to coordinate donations for emergency requests</span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={btnPrimary}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Health & Clinical Safety Sidebar */}
            <div className="space-y-4">
              <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Clinical Governance & Safety</h4>
                </div>
                <p className="text-xs leading-relaxed text-blue-900/90">
                  LifeDrop serves as an urgent matching coordinator. Final blood compatibility, hemoglobin measurement, and donor vitals verification are conducted strictly on-site by certified hospital medical professionals.
                </p>
                <p className="text-xs leading-relaxed text-blue-900/90">
                  No medical self-clearance guarantees collection. Qualified healthcare workers ensure complete donor safety and transfusion security.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4.5 space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                  Health Declarations Overview
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Declared Age:</span>
                    <span className="font-semibold text-slate-900">28 years</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Declared Weight:</span>
                    <span className="font-semibold text-slate-900">68 kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Whole-Blood Interval:</span>
                    <span className="font-semibold text-emerald-700">Satisfied (125 days)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Alcohol Window:</span>
                    <span className="font-semibold text-emerald-700">24h+ compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* ======================================================== */}
      {/* GUIDED 4-STEP BOOKING MODAL */}
      {/* ======================================================== */}
      <GuidedDonationModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        targetRequest={targetRequestForBooking}
        hospitals={hospitals}
        donor={user}
        onComplete={handleBookingComplete}
        onViewAppointment={() => setActiveTab('appointments')}
      />

      {/* ======================================================== */}
      {/* RESCHEDULE MODAL */}
      {/* ======================================================== */}
      {rescheduleModalOpen && reschedulingAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setRescheduleModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Reschedule Assessment Slot</h3>
              <p className="mt-0.5 text-descriptive-sm">
                Pick an upcoming slot at {getHospName(reschedulingAppointment.hospital)}.
              </p>
            </div>

            <div className="space-y-2">
              {[
                'Tomorrow at 10:30 AM',
                'In 2 days at 02:30 PM',
                'In 3 days at 11:00 AM',
                'In 4 days at 04:00 PM',
              ].map((slot, i) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setNewRescheduleSlot(slot)}
                  className={`w-full rounded-lg border p-2.5 text-left text-xs font-medium transition ${
                    newRescheduleSlot === slot || (!newRescheduleSlot && i === 0)
                      ? 'border-[#D92027] bg-[#FFF1F1] text-[#D92027] font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRescheduleAppointment}
                className={btnPrimary}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CANCEL APPOINTMENT CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      {cancelModalOpen && cancellingAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setCancelModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cancel Assessment Appointment?</h3>
                <p className="text-descriptive-sm">
                  At {getHospName(cancellingAppointment.hospital)}
                </p>
              </div>
            </div>

            <p className="text-descriptive-sm leading-relaxed">
              Cancelling releases your reserved clinical assessment slot. The blood request will remain available to other community donors.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className={btnSecondary}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={confirmCancelAppointment}
                className={btnDangerFilled}
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
