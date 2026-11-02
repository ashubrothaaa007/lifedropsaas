'use client'

import React, { useState, useMemo } from 'react'
import {
  LayoutDashboard,
  Droplet,
  Users,
  Building2,
  UserRound,
  Bell,
  Settings,
  AlertTriangle,
  Check,
  CheckCircle2,
  Plus,
  Search,
  Phone,
  MapPin,
  Heart,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Send,
  X,
  Menu,
  Activity,
  CalendarDays,
  ExternalLink,
  Info,
  Edit,
  Clock,
} from 'lucide-react'
import type {
  DashboardData,
  Role,
  BloodRequest,
  Donor,
  Hospital,
  ResponseRecord,
  ReceiverProfileData,
  ReceiverNotification,
} from './dashboard-data'
import { groups, demoScenario, relationId } from './dashboard-data'
import {
  CreateRequestModal,
  EditRequestModal,
  CancelRequestModal,
  HospitalContactModal,
  DonorInviteModal,
  DonorDetailModal,
} from './ReceiverModals'

interface ReceiverDashboardProps {
  initialData: DashboardData
  onSwitchRole: (role: Role) => void
  onSignOut?: () => void
  isDemo?: boolean
}

type TabKey =
  | 'overview'
  | 'requests'
  | 'donors'
  | 'hospitals'
  | 'profile'
  | 'notifications'
  | 'settings'

// Reusable semantic button tokens matching Hospital and Donor Dashboards
const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#D92027] hover:bg-[#b8181e] active:scale-[0.98] rounded-lg shadow-2xs transition-all'
const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] rounded-lg shadow-2xs transition-all'
const btnSuccess =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-all'
const btnDanger =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-all'
const btnDangerFilled =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-lg shadow-2xs transition-all'
const btnGhost =
  'inline-flex items-center gap-1 text-xs font-semibold text-[#D92027] hover:text-[#b8181e] transition-colors'

export default function ReceiverDashboard({
  initialData,
  onSwitchRole,
  onSignOut,
  isDemo = true,
}: ReceiverDashboardProps) {
  // Local state initialized with receiver data
  const [data, setData] = useState<DashboardData>(() => {
    if (initialData.receiverProfile || (initialData.requests && initialData.requests.some((r) => r.patientName))) {
      return initialData
    }
    return demoScenario('receiver')
  })

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(
    null
  )

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalInitialHospital, setCreateModalInitialHospital] = useState<string | undefined>()
  const [createModalInitialGroup, setCreateModalInitialGroup] = useState<string | undefined>()

  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null)
  const [cancellingRequest, setCancellingRequest] = useState<BloodRequest | null>(null)
  const [inspectingHospital, setInspectingHospital] = useState<Hospital | null>(null)
  const [invitingDonor, setInvitingDonor] = useState<Donor | null>(null)
  const [inspectingDonor, setInspectingDonor] = useState<Donor | null>(null)

  // Filters state
  const [requestFilter, setRequestFilter] = useState<'all' | 'active' | 'partial' | 'closed' | 'cancelled'>('all')
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({
    'demo-r3': true, // Expanded by default to show multi-donor progress
  })

  const [donorSearch, setDonorSearch] = useState('')
  const [donorGroupFilter, setDonorGroupFilter] = useState('all')
  const [donorCityFilter, setDonorCityFilter] = useState('all')

  // Profile form state
  const [profileForm, setProfileForm] = useState<ReceiverProfileData>(
    data.receiverProfile || {
      name: 'Riya Sharma',
      primaryPhone: '+91 98201 55432',
      secondaryPhone: '+91 98200 99887',
      relationship: 'Mother / Primary Caregiver',
      city: 'Mumbai',
      email: 'receiver@lifedrop.example',
      communicationPref: 'app',
    }
  )

  // Reminder preferences matching reference settings card
  const [reminderSettings, setReminderSettings] = useState({
    name: 'Friend',
    message: 'Nice! 💙',
    frequency: 'Every 45 minutes',
    pauseInactive: true,
    inactiveMinutes: '12',
  })

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // --- Derived Metrics ---
  const activeRequests = useMemo(() => {
    return data.requests.filter((r) => r.status !== 'closed' && r.status !== 'cancelled')
  }, [data.requests])

  const emergencyRequest = useMemo(() => {
    return data.requests.find((r) => r.urgency === 'emergency' && r.status !== 'closed' && r.status !== 'cancelled')
  }, [data.requests])

  const primaryActiveRequest = useMemo(() => {
    return (
      data.requests.find((r) => r.status === 'coordinating') ||
      data.requests.find((r) => r.status === 'pending') ||
      data.requests[0]
    )
  }, [data.requests])

  const totalUnitsNeeded = useMemo(() => {
    return activeRequests.reduce((sum, r) => sum + Math.max(0, r.units - (r.fulfilledUnits || 0)), 0)
  }, [activeRequests])

  const respondedDonorsCount = useMemo(() => {
    return data.responses.filter((r) => r.decision === 'accepted' && r.status !== 'withdrawn').length
  }, [data.responses])

  const unreadNotificationsCount = useMemo(() => {
    return (data.receiverNotifications || []).filter((n) => !n.read).length
  }, [data.receiverNotifications])

  // --- Handlers ---

  // 1. Create New Blood Request
  const handleCreateRequest = (reqData: {
    patientName: string
    hospitalId: string
    ward: string
    bedNumber: string
    attendingPhysician: string
    bloodGroup: string
    units: number
    urgency: string
    requiredDate: string
    notes: string
    primaryContact: string
    secondaryContact: string
  }) => {
    const selectedHospital = data.hospitals.find((h) => h.id === reqData.hospitalId) || data.hospitals[0]
    const newReqId = `demo-r${Date.now().toString().slice(-4)}`

    const newRequest: BloodRequest = {
      id: newReqId,
      bloodGroup: reqData.bloodGroup,
      city: selectedHospital.city || 'Mumbai',
      units: reqData.units,
      fulfilledUnits: 0,
      urgency: reqData.urgency,
      status: 'pending',
      hospital: selectedHospital,
      createdAt: new Date().toISOString(),
      patientName: reqData.patientName,
      ward: reqData.ward,
      bedNumber: reqData.bedNumber,
      attendingPhysician: reqData.attendingPhysician,
      requiredDate: reqData.requiredDate,
      notes: reqData.notes,
      primaryContact: reqData.primaryContact,
      secondaryContact: reqData.secondaryContact,
    }

    const notif: ReceiverNotification = {
      id: `rnotif-${Date.now()}`,
      type: 'emergency',
      title: 'Blood Request Published',
      message: `${reqData.urgency.toUpperCase()}: ${reqData.units} units ${reqData.bloodGroup} requested for ${reqData.patientName} at ${selectedHospital.name}.`,
      timestamp: 'Just now',
      read: false,
      requestId: newReqId,
    }

    setData((prev) => ({
      ...prev,
      requests: [newRequest, ...prev.requests],
      receiverNotifications: [notif, ...(prev.receiverNotifications || [])],
    }))

    setExpandedRequests((prev) => ({ ...prev, [newReqId]: true }))
    setActiveTab('requests')
    showToast(
      `Blood request #${newReqId} created! Matching ${reqData.bloodGroup} donors in ${selectedHospital.city} have been alerted.`,
      'success'
    )
  }

  // 2. Edit Request
  const handleSaveEditRequest = (updatedFields: Partial<BloodRequest>) => {
    if (!editingRequest) return
    const targetId = editingRequest.id

    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === targetId ? { ...r, ...updatedFields } : r)),
    }))

    showToast(`Request #${targetId} details updated successfully.`, 'info')
  }

  // 3. Cancel Request
  const handleConfirmCancelRequest = (requestId: string, reason: string) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'cancelled', notes: `Cancelled: ${reason}` } : r
      ),
      receiverNotifications: [
        {
          id: `rnotif-${Date.now()}`,
          type: 'emergency',
          title: `Request #${requestId} Cancelled`,
          message: `Request was closed. Reason: ${reason}. Volunteer reservations have been released.`,
          timestamp: 'Just now',
          read: false,
          requestId,
        },
        ...(prev.receiverNotifications || []),
      ],
    }))

    showToast(`Request #${requestId} cancelled and closed.`, 'info')
  }

  // 4. Invite Donor
  const handleInviteDonor = (donorId: string, requestId: string) => {
    const donorObj = data.donors.find((d) => d.id === donorId)
    const targetReq = data.requests.find((r) => r.id === requestId)

    const existingResp = data.responses.find(
      (resp) => relationId(resp.request) === requestId && relationId(resp.donor as any) === donorId
    )

    let updatedResponses = data.responses
    if (!existingResp && donorObj && targetReq) {
      const newResp: ResponseRecord = {
        id: `resp-${Date.now().toString().slice(-4)}`,
        request: targetReq,
        decision: 'accepted',
        status: 'interested',
        donor: donorObj,
      }
      updatedResponses = [newResp, ...data.responses]
    }

    const notif: ReceiverNotification = {
      id: `rnotif-${Date.now()}`,
      type: 'interest',
      title: 'Donor Invitation Sent',
      message: `Priority alert sent to volunteer donor ${donorObj?.name || 'Donor'} for Request #${requestId}.`,
      timestamp: 'Just now',
      read: false,
      requestId,
    }

    setData((prev) => ({
      ...prev,
      responses: updatedResponses,
      receiverNotifications: [notif, ...(prev.receiverNotifications || [])],
    }))

    showToast(`Priority invitation sent to ${donorObj?.name || 'donor'}.`, 'success')
  }

  // 5. Save Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setData((prev) => ({
      ...prev,
      receiverProfile: profileForm,
    }))
    showToast('Receiver profile and contact preferences updated.', 'success')
  }

  // 6. Reset Demo Scenario
  const handleResetDemo = () => {
    if (confirm('Reset Receiver Dashboard to default demo scenario?')) {
      const fresh = demoScenario('receiver')
      setData(fresh)
      if (fresh.receiverProfile) {
        setProfileForm(fresh.receiverProfile)
      }
      showToast('Receiver demo scenario reset to initial state.', 'info')
    }
  }

  // Navigation items matching reference design
  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'donors', label: 'Find Donors', icon: Search },
    { key: 'requests', label: 'My Blood Requests', icon: Droplet },
    { key: 'hospitals', label: 'Partner Hospitals', icon: Building2 },
    { key: 'profile', label: 'My Profile', icon: UserRound },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'settings', label: 'Account Settings', icon: Settings },
  ]

  return (
    <div className="h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl shadow-lg border border-slate-200 animate-in slide-in-from-top-3 duration-150">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-[#D92027] shrink-0" />}
          {toast.type === 'info' && <Activity className="w-4 h-4 text-blue-600 shrink-0" />}
          <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 p-0.5 ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP FIXED HEADER */}
      <header className="shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D92027] flex items-center justify-center text-white font-bold shadow-2xs">
                <Droplet className="w-4 h-4 fill-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  Life<span className="text-[#D92027]">Drop</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Receiver Space
                </span>
              </div>
            </div>
          </div>

          {/* Center: Receiver Name & Emergency Pill */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-900">{profileForm.name}</span>
            {emergencyRequest ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 border border-red-200 text-xs font-semibold text-[#D92027] animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Emergency Need: {emergencyRequest.bloodGroup} ({emergencyRequest.units} units)
              </span>
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {profileForm.city}
              </span>
            )}
          </div>

          {/* Right: New Blood Request Button, Notifications, Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* New Blood Request Primary Button */}
            <button
              type="button"
              onClick={() => {
                setCreateModalInitialHospital(undefined)
                setCreateModalInitialGroup(undefined)
                setCreateModalOpen(true)
              }}
              className={btnPrimary}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Blood Request</span>
              <span className="sm:hidden">Request</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 bg-[#D92027] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="font-semibold text-xs text-slate-900">Notifications</span>
                    <button
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          receiverNotifications: (prev.receiverNotifications || []).map((n) => ({
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
                    {(data.receiverNotifications || []).length === 0 ? (
                      <div className="py-6 text-center text-descriptive-empty">
                        No notifications at this time
                      </div>
                    ) : (
                      (data.receiverNotifications || []).map((n) => (
                        <div
                          key={n.id}
                          className={`py-2.5 px-2 rounded-lg flex flex-col gap-1 transition-colors ${
                            n.read ? 'opacity-70' : 'bg-red-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {n.type === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.type === 'appointment' && <CalendarDays className="w-3.5 h-3.5 text-blue-600" />}
                              {n.type === 'emergency' && <AlertTriangle className="w-3.5 h-3.5 text-[#D92027]" />}
                              {n.type === 'interest' && <Heart className="w-3.5 h-3.5 text-red-500" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600">{n.message}</p>
                          {n.requestId && (
                            <button
                              onClick={() => {
                                setActiveTab('requests')
                                setNotificationsOpen(false)
                                setExpandedRequests((prev) => ({ ...prev, [n.requestId!]: true }))
                              }}
                              className="self-start text-[11px] font-semibold text-[#D92027] flex items-center gap-1 hover:underline mt-0.5"
                            >
                              View Request #{n.requestId} <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
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
                className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
              >
                Hospital
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('receiver')}
                className="px-2.5 py-1 rounded-md bg-white text-[#D92027] font-semibold shadow-2xs"
              >
                Receiver
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              title="Reset Demo Scenario"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              aria-label="Reset Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: FIXED SIDEBAR + INDEPENDENTLY SCROLLABLE CONTENT */}
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
                    <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.key === 'notifications' && (
                    <span className="size-5 rounded-full bg-[#D92027] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {unreadNotificationsCount > 0 ? unreadNotificationsCount : 4}
                    </span>
                  )}
                  {item.key === 'requests' && activeRequests.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-[#D92027] border border-red-200 shrink-0">
                      {activeRequests.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Support Card */}
          <div className="mt-8 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transfusion Support</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Matches verified by treating clinical team.
            </p>
            <div className="pt-1.5 border-t border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D92027]" />
              <span>Emergency Desk: 112</span>
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
                        <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#D92027]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.key === 'notifications' && (
                        <span className="size-5 rounded-full bg-[#D92027] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {unreadNotificationsCount > 0 ? unreadNotificationsCount : 4}
                        </span>
                      )}
                      {item.key === 'requests' && activeRequests.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-[#D92027] border border-red-200 shrink-0">
                          {activeRequests.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Mobile Quick Support Card */}
              <div className="mt-8 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transfusion Support</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Matches verified by treating clinical team.
                </p>
                <div className="pt-1.5 border-t border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D92027]" />
                  <span>Emergency Desk: 112</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN INDEPENDENTLY SCROLLABLE CONTENT */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-5 lg:p-7 space-y-5">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW — RECEIVER COMMAND CENTER */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* A. Active Blood Request Section */}
              {primaryActiveRequest ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#D92027] animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                        Active Blood Request
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{primaryActiveRequest.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          primaryActiveRequest.urgency === 'emergency'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {primaryActiveRequest.urgency === 'emergency' ? 'Critical Emergency' : 'Standard Scheduled'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                        {primaryActiveRequest.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Info & Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-lg bg-red-50 text-[#D92027] font-bold text-lg flex items-center justify-center border border-red-200 shrink-0">
                        {primaryActiveRequest.bloodGroup}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-semibold text-slate-900">
                          {primaryActiveRequest.patientName || 'Patient Request'}
                        </h3>
                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {typeof primaryActiveRequest.hospital === 'object'
                              ? primaryActiveRequest.hospital.name
                              : primaryActiveRequest.hospital}
                          </span>
                          <span>·</span>
                          <span>{primaryActiveRequest.ward || 'Hospital Ward'}</span>
                          {primaryActiveRequest.bedNumber && (
                            <>
                              <span>·</span>
                              <span>{primaryActiveRequest.bedNumber}</span>
                            </>
                          )}
                          {primaryActiveRequest.attendingPhysician && (
                            <>
                              <span>·</span>
                              <span className="text-slate-600">{primaryActiveRequest.attendingPhysician}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('requests')
                          setExpandedRequests((prev) => ({
                            ...prev,
                            [primaryActiveRequest.id]: true,
                          }))
                        }}
                        className={btnPrimary}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>View Donor Responses ({respondedDonorsCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const h = data.hospitals.find(
                            (item) => item.id === relationId(primaryActiveRequest.hospital as any)
                          )
                          if (h) setInspectingHospital(h)
                          else if (typeof primaryActiveRequest.hospital === 'object') {
                            setInspectingHospital(primaryActiveRequest.hospital as Hospital)
                          }
                        }}
                        className={btnSecondary}
                      >
                        Contact Hospital
                      </button>
                    </div>
                  </div>

                  {/* Fulfillment Progress Bar */}
                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <div className="text-slate-600">
                        Fulfillment Progress:{' '}
                        <strong className="text-slate-900 font-semibold">
                          {primaryActiveRequest.fulfilledUnits || 0} of {primaryActiveRequest.units} Units Fulfilled
                        </strong>
                      </div>
                      <div className="font-semibold text-[#D92027]">
                        {Math.max(0, primaryActiveRequest.units - (primaryActiveRequest.fulfilledUnits || 0))}{' '}
                        Units Remaining Needed
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          (primaryActiveRequest.fulfilledUnits || 0) >= primaryActiveRequest.units
                            ? 'bg-emerald-500'
                            : 'bg-[#D92027]'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((primaryActiveRequest.fulfilledUnits || 0) / primaryActiveRequest.units) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">All Patient Requests Satisfied</h3>
                  <p className="text-descriptive-empty max-w-md mx-auto">
                    You currently have no active pending blood requests. If you or a family member requires blood,
                    create a request to coordinate with verified community donors.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className={btnPrimary}
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Blood Request
                  </button>
                </div>
              )}

              {/* B. Three Operational Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-1">
                  <span className="text-xs font-medium text-slate-500">Active Requests</span>
                  <p className="tabular-nums text-2xl font-bold text-slate-900">{activeRequests.length}</p>
                  <p className="text-[11px] text-slate-500">In coordination pipeline</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-1">
                  <span className="text-xs font-medium text-slate-500">Donors Stepped Forward</span>
                  <p className="tabular-nums text-2xl font-bold text-slate-900">{respondedDonorsCount}</p>
                  <p className="text-[11px] text-slate-500">Volunteers in contact</p>
                </div>

                {/* Remaining units made prominent with alert styling */}
                <div className="bg-white rounded-xl border border-red-200 shadow-2xs p-4 space-y-1">
                  <span className="text-xs font-semibold text-red-600">Units Still Needed</span>
                  <p className="tabular-nums text-2xl font-bold text-[#D92027]">
                    {totalUnitsNeeded} <span className="text-xs font-normal text-slate-500">units</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Across active patient cases</p>
                </div>
              </div>

              {/* Strict Clinical Distinguish Warning */}
              <div className="p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <p>
                  <strong className="text-slate-800 font-semibold">Fulfillment Notice:</strong> Fulfilled count reflects only completed, hospital-verified donations.
                </p>
              </div>

              {/* C. Donor Response Summary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Volunteer Donor Matches
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('donors')}
                    className={btnGhost}
                  >
                    <span>Browse Donor Directory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {data.responses
                    .filter((r) => r.decision === 'accepted' && r.status !== 'withdrawn')
                    .map((resp) => {
                      const dName = typeof resp.donor === 'object' ? resp.donor.name : 'Volunteer Donor'
                      const dBlood =
                        typeof resp.donor === 'object' ? resp.donor.bloodGroup || 'O+' : 'O+'

                      const parts = dName.split(' ')
                      const privacyName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : dName

                      const isCompleted = resp.status === 'completed'
                      const isScheduled = resp.status === 'scheduled'
                      const stageLabel = isCompleted
                        ? 'Stage 4: Donation Completed & Verified'
                        : isScheduled
                        ? 'Stage 2: Hospital Assessment Scheduled'
                        : 'Stage 1: Interest Registered'

                      return (
                        <div
                          key={resp.id}
                          className="p-3.5 border border-slate-200 bg-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-md bg-red-50 text-[#D92027] font-bold text-xs flex items-center justify-center border border-red-200 shrink-0">
                              {dBlood}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900">{privacyName}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : isScheduled
                                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {stageLabel}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Linked Request: #{relationId(resp.request)} · Treating hospital verifying compatibility
                              </div>
                            </div>
                          </div>

                          <div className="text-xs font-medium text-slate-700 self-end sm:self-center">
                            {isCompleted ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                +1 Unit Fulfilled (Hospital Verified)
                              </span>
                            ) : isScheduled ? (
                              <span className="text-blue-700 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                Pending Hospital Phlebotomy
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-amber-500" />
                                Awaiting Assessment Booking
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* D. Nearby Verified Partner Hospitals */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Partner Transfusion Centers</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('hospitals')}
                    className={btnGhost}
                  >
                    <span>View All Centers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.hospitals.slice(0, 2).map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 border border-slate-200 rounded-lg space-y-2.5 hover:border-slate-300 transition-colors bg-white shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-red-50 text-[#D92027] border border-red-200 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">{h.name}</h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {h.city}
                            </p>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-500 text-[11px]">24/7 Blood Bank Desk</span>
                        <button
                          type="button"
                          onClick={() => setInspectingHospital(h)}
                          className={btnSecondary}
                        >
                          Contact Desk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MY BLOOD REQUESTS */}
          {/* ========================================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">My Blood Requests</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalInitialHospital(undefined)
                    setCreateModalInitialGroup(undefined)
                    setCreateModalOpen(true)
                  }}
                  className={btnPrimary}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Blood Request</span>
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit text-xs font-medium overflow-x-auto">
                {(['all', 'active', 'partial', 'closed', 'cancelled'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRequestFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      requestFilter === f
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {f === 'all'
                      ? 'All Requests'
                      : f === 'active'
                      ? 'Active / Coordinating'
                      : f === 'partial'
                      ? 'Partially Fulfilled'
                      : f === 'closed'
                      ? 'Fully Closed'
                      : 'Cancelled'}
                  </button>
                ))}
              </div>

              {/* Request Cards Grid */}
              <div className="space-y-3.5">
                {data.requests
                  .filter((req) => {
                    if (requestFilter === 'active') return req.status !== 'closed' && req.status !== 'cancelled'
                    if (requestFilter === 'partial') return (req.fulfilledUnits || 0) > 0 && (req.fulfilledUnits || 0) < req.units
                    if (requestFilter === 'closed') return req.status === 'closed'
                    if (requestFilter === 'cancelled') return req.status === 'cancelled'
                    return true
                  })
                  .map((req) => {
                    const isExpanded = !!expandedRequests[req.id]
                    const linkedResponses = data.responses.filter(
                      (resp) => relationId(resp.request) === req.id && resp.decision === 'accepted'
                    )
                    const percent = Math.min(
                      100,
                      Math.round(((req.fulfilledUnits || 0) / req.units) * 100)
                    )

                    return (
                      <div
                        key={req.id}
                        className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-11 h-11 rounded-lg bg-red-50 text-[#D92027] font-bold text-sm flex items-center justify-center border border-red-200 shrink-0">
                              {req.bloodGroup}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">
                                  {req.patientName || 'Patient Request'}
                                </span>
                                <span className="text-xs tabular-nums font-mono text-slate-400">#{req.id}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    req.urgency === 'emergency'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {req.urgency}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {typeof req.hospital === 'object' ? req.hospital.name : req.hospital} ·{' '}
                                {req.ward || 'Hospital Ward'}
                              </p>
                            </div>
                          </div>

                          {/* Request Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {req.status !== 'closed' && req.status !== 'cancelled' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingRequest(req)}
                                  className={btnSecondary}
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCancellingRequest(req)}
                                  className={btnDanger}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const h = data.hospitals.find(
                                  (item) => item.id === relationId(req.hospital as any)
                                )
                                if (h) setInspectingHospital(h)
                              }}
                              className={btnSecondary}
                            >
                              Hospital Desk
                            </button>
                          </div>
                        </div>

                        {/* Multi-Donor Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-600 font-medium">
                            <span>
                              Fulfillment: {req.fulfilledUnits || 0} of {req.units} Units Fulfilled ({percent}%)
                            </span>
                            <span className={percent === 100 ? 'text-emerald-700 font-semibold' : 'text-[#D92027] font-semibold'}>
                              {Math.max(0, req.units - (req.fulfilledUnits || 0))} Units Needed
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                percent === 100 ? 'bg-emerald-500' : 'bg-[#D92027]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Expandable Donor Response Section */}
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRequests((prev) => ({
                                ...prev,
                                [req.id]: !prev[req.id],
                              }))
                            }
                            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#D92027]" />
                              Donor Coordination Pipeline ({linkedResponses.length} volunteers)
                            </span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-2 animate-in fade-in duration-100">
                              {linkedResponses.length === 0 ? (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-descriptive-empty">
                                  No donor responses linked yet. Browse the donor directory to send invites.
                                </div>
                              ) : (
                                linkedResponses.map((r) => {
                                  const dName = typeof r.donor === 'object' ? r.donor.name : 'Donor'
                                  const dBlood =
                                    typeof r.donor === 'object' ? r.donor.bloodGroup || 'O+' : 'O+'
                                  const isComp = r.status === 'completed'
                                  const isSched = r.status === 'scheduled'

                                  const parts = dName.split(' ')
                                  const privacyName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : dName

                                  return (
                                    <div
                                      key={r.id}
                                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded bg-red-50 text-[#D92027] font-bold text-xs flex items-center justify-center border border-red-200">
                                          {dBlood}
                                        </span>
                                        <div>
                                          <div className="font-semibold text-slate-900">{privacyName}</div>
                                          <div className="text-[11px] text-slate-500">
                                            Treating hospital verifying clinical compatibility
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                            isComp
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : isSched
                                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                                          }`}
                                        >
                                          {isComp
                                            ? 'Stage 4: Completed (+1 Unit)'
                                            : isSched
                                            ? 'Stage 2: Assessment Scheduled'
                                            : 'Stage 1: Interest Registered'}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FIND DONORS */}
          {/* ========================================================================= */}
          {activeTab === 'donors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Find Community Donors</h2>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder="Search by city or donor initials..."
                    className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-200 bg-slate-50/50 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={donorGroupFilter}
                    onChange={(e) => setDonorGroupFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700"
                  >
                    <option value="all">All Blood Groups</option>
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <select
                    value={donorCityFilter}
                    onChange={(e) => setDonorCityFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700"
                  >
                    <option value="all">All Cities</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="New Delhi">New Delhi</option>
                  </select>
                </div>
              </div>

              {/* Donors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.donors
                  .filter((d) => {
                    const matchesSearch =
                      d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
                      d.city.toLowerCase().includes(donorSearch.toLowerCase())
                    const matchesGroup = donorGroupFilter === 'all' || d.bloodGroup === donorGroupFilter
                    const matchesCity = donorCityFilter === 'all' || d.city === donorCityFilter
                    return matchesSearch && matchesGroup && matchesCity
                  })
                  .map((d) => {
                    const parts = d.name.split(' ')
                    const privacyName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : d.name

                    return (
                      <div
                        key={d.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-10 h-10 rounded-lg bg-red-50 text-[#D92027] font-bold text-xs flex items-center justify-center border border-red-200">
                            {d.bloodGroup || 'O+'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Donor
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{privacyName}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {d.city}
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">120-Day Interval:</span>
                            <span className="font-semibold text-emerald-700">Eligible</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Availability:</span>
                            <span className={d.available ? 'font-semibold text-emerald-600' : 'text-slate-400'}>
                              {d.available ? 'Available' : 'Standby'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setInspectingDonor(d)}
                            className={`flex-1 ${btnSecondary}`}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setInvitingDonor(d)}
                            className={`flex-1 ${btnPrimary}`}
                          >
                            <Send className="w-3 h-3" /> Invite
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PARTNER HOSPITALS */}
          {/* ========================================================================= */}
          {activeTab === 'hospitals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Partner Transfusion Centers</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {data.hospitals.map((h) => (
                  <div
                    key={h.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-[#D92027] border border-red-200 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-slate-900">{h.name}</h3>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {h.address || `${h.city}, Maharashtra`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-0.5">
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">License</span>
                        <div className="tabular-nums font-semibold text-slate-800">MH-BB-2024-8901</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-0.5">
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Emergency Hotline</span>
                        <div className="tabular-nums font-semibold text-[#D92027]">+91 22 2826 3000</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${h.name} ${h.address || h.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                      >
                        Map Location <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingHospital(h)}
                          className={btnSecondary}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateModalInitialHospital(h.id)
                            setCreateModalOpen(true)
                          }}
                          className={btnPrimary}
                        >
                          Request Here
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. MY PROFILE */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Receiver Profile &amp; Contacts</h2>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Receiver Contact Information
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Patient Relationship
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.relationship}
                      onChange={(e) => setProfileForm({ ...profileForm, relationship: e.target.value })}
                      placeholder="e.g. Mother / Primary Caregiver"
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Contact Number
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.primaryPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, primaryPhone: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Secondary Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={profileForm.secondaryPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, secondaryPhone: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City / Area
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] bg-white text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Priority Communication Channel
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['app', 'LifeDrop App Alerts'],
                      ['sms', 'Direct SMS'],
                      ['call', 'Direct Phone Call'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setProfileForm({ ...profileForm, communicationPref: key as any })
                        }
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          profileForm.communicationPref === key
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
          {/* 6. NOTIFICATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Notification Inbox</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setData((prev) => ({
                      ...prev,
                      receiverNotifications: (prev.receiverNotifications || []).map((n) => ({
                        ...n,
                        read: true,
                      })),
                    }))
                    showToast('All notifications marked as read.', 'info')
                  }}
                  className={btnSecondary}
                >
                  Mark All as Read
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {(data.receiverNotifications || []).length === 0 ? (
                  <div className="p-8 text-center text-descriptive-empty">
                    No notifications in your inbox.
                  </div>
                ) : (
                  (data.receiverNotifications || []).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors ${
                        !n.read ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D92027] border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                          {n.type === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {n.type === 'appointment' && <CalendarDays className="w-4 h-4 text-blue-600" />}
                          {n.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-[#D92027]" />}
                          {n.type === 'interest' && <Heart className="w-4 h-4 text-red-500" />}
                          {n.type === 'fulfilled' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {n.requestId && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('requests')
                              setExpandedRequests((prev) => ({ ...prev, [n.requestId!]: true }))
                            }}
                            className={btnGhost}
                          >
                            <span>View Case #{n.requestId}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => {
                              setData((prev) => ({
                                ...prev,
                                receiverNotifications: (prev.receiverNotifications || []).map((item) =>
                                  item.id === n.id ? { ...item, read: true } : item
                                ),
                              }))
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. ACCOUNT SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Account &amp; Session Settings</h2>
              </div>

              {/* Exact Card matching Reference Image Typography */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3.5">
                  YOUR REMINDERS
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={reminderSettings.name}
                      onChange={(e) =>
                        setReminderSettings({ ...reminderSettings, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Cheer message
                    </label>
                    <input
                      type="text"
                      value={reminderSettings.message}
                      onChange={(e) =>
                        setReminderSettings({ ...reminderSettings, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Reminder frequency
                    </label>
                    <select
                      value={reminderSettings.frequency}
                      onChange={(e) =>
                        setReminderSettings({ ...reminderSettings, frequency: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]"
                    >
                      <option value="Every 15 minutes">Every 15 minutes</option>
                      <option value="Every 30 minutes">Every 30 minutes</option>
                      <option value="Every 45 minutes">Every 45 minutes</option>
                      <option value="Every 60 minutes">Every 60 minutes</option>
                    </select>
                  </div>

                  <div className="pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={reminderSettings.pauseInactive}
                        onChange={(e) =>
                          setReminderSettings({
                            ...reminderSettings,
                            pauseInactive: e.target.checked,
                          })
                        }
                        className="size-3.5 rounded border-slate-300 text-[#D92027] accent-[#D92027] focus:ring-[#D92027]"
                      />
                      <span className="text-xs font-medium text-slate-800">
                        Pause when Windows is inactive
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Consider inactive after (minutes)
                    </label>
                    <input
                      type="text"
                      value={reminderSettings.inactiveMinutes}
                      onChange={(e) =>
                        setReminderSettings({
                          ...reminderSettings,
                          inactiveMinutes: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Receiver Authorization</h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Patient Account
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Account Holder</span>
                    <strong className="text-slate-900 font-semibold">{profileForm.name}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Demo Role Session</span>
                    <strong className="text-[#D92027] font-semibold">ACTIVE (Receiver Mode)</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Privacy Mode</span>
                    <strong className="text-slate-900 font-semibold">Protected Patient Identity</strong>
                  </div>
                </div>

                {/* Reset Demo Option */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">Reset Demo Scenario State</h5>
                    <p className="text-[11px] text-slate-500">
                      Restores demo scenario to default state.
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

      {/* 1. Create Blood Request Modal */}
      {createModalOpen && (
        <CreateRequestModal
          hospitals={data.hospitals}
          initialHospitalId={createModalInitialHospital}
          initialBloodGroup={createModalInitialGroup}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateRequest}
        />
      )}

      {/* 2. Edit Request Modal */}
      {editingRequest && (
        <EditRequestModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={handleSaveEditRequest}
        />
      )}

      {/* 3. Cancel Request Dialog */}
      {cancellingRequest && (
        <CancelRequestModal
          request={cancellingRequest}
          onClose={() => setCancellingRequest(null)}
          onConfirmCancel={handleConfirmCancelRequest}
        />
      )}

      {/* 4. Hospital Detail & Contact Modal */}
      {inspectingHospital && (
        <HospitalContactModal
          hospital={inspectingHospital}
          onClose={() => setInspectingHospital(null)}
          onRequestAtHospital={(h) => {
            setCreateModalInitialHospital(h.id)
            setCreateModalOpen(true)
          }}
        />
      )}

      {/* 5. Invite Donor Modal */}
      {invitingDonor && (
        <DonorInviteModal
          donor={invitingDonor}
          requests={data.requests}
          onClose={() => setInvitingDonor(null)}
          onInvite={handleInviteDonor}
        />
      )}

      {/* 6. Donor Detail Modal */}
      {inspectingDonor && (
        <DonorDetailModal
          donor={inspectingDonor}
          onClose={() => setInspectingDonor(null)}
          onInvite={(d) => {
            setInspectingDonor(null)
            setInvitingDonor(d)
          }}
        />
      )}
    </div>
  )
}
