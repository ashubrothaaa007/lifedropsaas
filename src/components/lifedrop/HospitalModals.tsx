'use client'

import React, { useState } from 'react'
import {
  X,
  AlertTriangle,
  Radio,
  Droplet,
  Calendar,
  Check,
  Activity,
  ShieldAlert,
  Plus,
  Minus,
  Microscope,
  ShieldCheck,
  Send,
  Info,
} from 'lucide-react'
import type {
  BloodRequest,
  Donor,
  Appointment,
  Stock,
  QuarantineUnit,
} from './dashboard-data'
import { groups } from './dashboard-data'

// Standard semantic button classes (LifeDrop Design System)
const btnBase =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2'
const btnPrimary = `${btnBase} bg-[#D92027] text-white hover:bg-[#b8181e] focus-visible:outline-[#D92027] shadow-2xs`
const btnSecondary = `${btnBase} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-slate-400 shadow-2xs`
const btnSuccess = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 shadow-2xs`
const btnDanger = `${btnBase} bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:outline-red-500 shadow-2xs`

// Common modal container
function ModalWrapper({
  title,
  subtitle,
  children,
  onClose,
  maxWidth = 'max-w-xl',
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  maxWidth?: string
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-descriptive-sm mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

// 1. Broadcast Emergency Need Modal
export function BroadcastEmergencyModal({
  onClose,
  onBroadcast,
  criticalGroups,
}: {
  onClose: () => void
  onBroadcast: (message: string, groupsTargeted: string[]) => void
  criticalGroups: string[]
}) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    criticalGroups.length > 0 ? criticalGroups : ['O-', 'O+']
  )
  const [message, setMessage] = useState(
    'CRITICAL BLOOD DEFICIT at Apollo Hospitals Mumbai. Trauma ICU urgently needs whole blood units. Eligible registered donors are requested to schedule an immediate assessment.'
  )
  const [broadcasting, setBroadcasting] = useState(false)

  const toggleGroup = (bg: string) => {
    setSelectedGroups((prev) =>
      prev.includes(bg) ? prev.filter((g) => g !== bg) : [...prev, bg]
    )
  }

  const handleSend = () => {
    if (selectedGroups.length === 0) return
    setBroadcasting(true)
    setTimeout(() => {
      onBroadcast(message, selectedGroups)
      setBroadcasting(false)
      onClose()
    }, 600)
  }

  return (
    <ModalWrapper
      title="Broadcast Emergency Blood Need"
      subtitle="Dispatch instant push and SMS alerts to matching registered donors"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#D92027] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#D92027]">
              Emergency Protocol Activated
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              Simulates sending high-priority alerts to matching active donors within a 25 km radius
              in Mumbai.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Target Blood Groups
          </label>
          <div className="grid grid-cols-4 gap-2">
            {groups.map((bg) => {
              const active = selectedGroups.includes(bg)
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => toggleGroup(bg)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#D92027] text-white border-[#D92027]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bg}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Emergency Dispatch Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20"
          />
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Simulated Reach:</span>
          </div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {selectedGroups.length * 3 + 2} Registered donors in Mumbai area
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={broadcasting || selectedGroups.length === 0}
            onClick={handleSend}
            className={`${btnPrimary} disabled:opacity-50`}
          >
            <Send className="w-3.5 h-3.5" />
            {broadcasting ? 'Broadcasting...' : 'Broadcast Alert'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 2. Stock Adjustment Modal
export function StockAdjustmentModal({
  onClose,
  onAdjust,
  inventory,
}: {
  onClose: () => void
  onAdjust: (bloodGroup: string, delta: number, reason: string, notes: string) => void
  inventory: Stock[]
}) {
  const [bloodGroup, setBloodGroup] = useState<string>('O-')
  const [type, setType] = useState<'add' | 'deduct'>('deduct')
  const [units, setUnits] = useState<number>(1)
  const [reason, setReason] = useState<string>('Internal Ward Allocation (Direct Transfusion)')
  const [notes, setNotes] = useState<string>('Transfusion order #OT-4491 authorized by Dr. Mukherjee')
  const [confirming, setConfirming] = useState<boolean>(false)

  const currentStock = inventory.find((i) => i.bloodGroup === bloodGroup)?.units ?? 0

  const handleConfirm = () => {
    if (units <= 0) return
    const delta = type === 'add' ? units : -units
    onAdjust(bloodGroup, delta, reason, notes)
    onClose()
  }

  return (
    <ModalWrapper
      title="Adjust Blood Inventory Units"
      subtitle="Audited stock reconciliation and inventory movements"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 mt-1">Current Stock: <strong className="text-slate-900 tabular-nums">{currentStock} units</strong></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Action Type
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setType('deduct')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'deduct'
                    ? 'bg-white text-red-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                - Deduct / Discard
              </button>
              <button
                type="button"
                onClick={() => setType('add')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'add'
                    ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Add Stock
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Quantity (Units)
          </label>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setUnits((u) => Math.max(1, u - 1))}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <input
              type="number"
              min={1}
              value={units}
              onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center font-bold text-sm p-1.5 border border-slate-200 rounded-lg outline-none tabular-nums"
            />
            <button
              type="button"
              onClick={() => setUnits((u) => u + 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <span className="text-xs text-slate-500 ml-1">
              New stock will be:{' '}
              <strong className="text-slate-900 tabular-nums">
                {type === 'add' ? currentStock + units : Math.max(0, currentStock - units)} units
              </strong>
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Audit Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          >
            <option value="Internal Ward Allocation (Direct Transfusion)">
              Internal Ward Allocation (Direct Transfusion)
            </option>
            <option value="Routine Discard (Hemolyzed / Clotted)">
              Routine Discard (Hemolyzed / Clotted)
            </option>
            <option value="Expired Shelf Life (> 35 days)">
              Expired Shelf Life (&gt; 35 days)
            </option>
            <option value="Inter-hospital Loan / Emergency Transfer">
              Inter-hospital Loan / Emergency Transfer
            </option>
            <option value="Audit / Physical Count Reconciliation">
              Audit / Physical Count Reconciliation
            </option>
            <option value="Emergency Central Reserve Influx">
              Emergency Central Reserve Influx
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Clinical / Verification Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Staff badge, patient chart or transfer ref..."
            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          />
        </div>

        {confirming ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Confirm inventory modification:</strong> Are you sure you want to {type}{' '}
                {units} unit(s) of <strong>{bloodGroup}</strong>? This action will be recorded in
                the operations audit log.
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={btnSecondary}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={btnPrimary}
              >
                Yes, Apply Adjustment
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={btnPrimary}
            >
              Review Adjustment
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}

// 3. Coordinate Donors Modal
export function CoordinateDonorsModal({
  request,
  donors,
  onClose,
  onInviteDonor,
}: {
  request: BloodRequest
  donors: Donor[]
  onClose: () => void
  onInviteDonor: (donorId: string, donorName: string) => void
}) {
  const [invited, setInvited] = useState<Record<string, boolean>>({})

  // Find matching donors by blood group
  const matchingDonors = donors.filter(
    (d) => !d.bloodGroup || d.bloodGroup === request.bloodGroup
  )

  const handleInvite = (d: Donor) => {
    setInvited((prev) => ({ ...prev, [d.id]: true }))
    onInviteDonor(d.id, d.name)
  }

  return (
    <ModalWrapper
      title={`Coordinate Donors for ${request.bloodGroup} Request`}
      subtitle={`Request #${request.id} · ${request.units} units requested (${request.fulfilledUnits || 0} fulfilled)`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Urgency:</span>{' '}
            <span
              className={`font-semibold uppercase tracking-wider ${
                request.urgency === 'emergency' ? 'text-[#D92027]' : 'text-slate-700'
              }`}
            >
              {request.urgency}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Hospital:</span>{' '}
            <span className="font-semibold text-slate-800">
              {typeof request.hospital === 'object' ? request.hospital.name : request.hospital}
            </span>
          </div>
          <div>
            <span className="text-slate-500">City:</span>{' '}
            <span className="font-semibold text-slate-800">{request.city}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2.5">
            Matching Registered Donors ({matchingDonors.length} found)
          </h4>
          <div className="space-y-2">
            {matchingDonors.map((d) => {
              const isInvited = invited[d.id]
              return (
                <div
                  key={d.id}
                  className="p-3 border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {d.bloodGroup}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{d.city}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Eligible Interval</span>
                        <span>•</span>
                        <span className={d.available ? 'text-emerald-600' : 'text-slate-400'}>
                          {d.available ? 'Available' : 'Standby'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isInvited}
                    onClick={() => handleInvite(d)}
                    className={
                      isInvited
                        ? 'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : btnPrimary
                    }
                  >
                    {isInvited ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Invited
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Send Invite
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Done
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 4. Create New Patient Blood Request Modal
export function HospitalRequestModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (req: {
    bloodGroup: string
    units: number
    urgency: string
    patientName: string
    ward: string
  }) => void
}) {
  const [bloodGroup, setBloodGroup] = useState<string>('O+')
  const [units, setUnits] = useState<number>(2)
  const [urgency, setUrgency] = useState<string>('emergency')
  const [patientName, setPatientName] = useState<string>('Patient #5120 - Trauma OT')
  const [ward, setWard] = useState<string>('Emergency Trauma ICU - Ward 3')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      bloodGroup,
      units,
      urgency,
      patientName,
      ward,
    })
    onClose()
  }

  return (
    <ModalWrapper
      title="Create New Patient Blood Request"
      subtitle="Register an in-hospital emergency or routine blood requirement"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Patient / Case Identifier
          </label>
          <input
            type="text"
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Patient #4092 - Cardiac ICU"
            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ward / Department
            </label>
            <input
              type="text"
              required
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. Surgical Ward 4"
              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Required Units
            </label>
            <input
              type="number"
              min={1}
              max={10}
              required
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            >
              <option value="emergency">Emergency (Immediate)</option>
              <option value="normal">Normal (Scheduled)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={btnPrimary}
          >
            Create Request
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// 5. Schedule Donor Assessment Modal (Seamless demo mode)
export function ScheduleAssessmentModal({
  donor,
  requests,
  onClose,
  onSchedule,
}: {
  donor: Donor
  requests: BloodRequest[]
  onClose: () => void
  onSchedule: (donorId: string, date: string, requestId?: string) => void
}) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState<string>('10:30')
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const scheduledDateTime = new Date(`${date}T${time}:00`).toISOString()
    onSchedule(donor.id, scheduledDateTime, selectedRequestId || undefined)
    onClose()
  }

  return (
    <ModalWrapper
      title={`Schedule Clinical Assessment for ${donor.name}`}
      subtitle={`Donor Blood Group: ${donor.bloodGroup || 'Unknown'} · Location: ${donor.city}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#D92027]" />
          <span>Donor 120-day interval satisfied. Eligible for clinical assessment slot.</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Time Slot
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            >
              <option value="09:00">09:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:45">11:45 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:45">04:45 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Link to In-Hospital Blood Request (Optional)
          </label>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          >
            <option value="">General Reserve / Stock Replenishment</option>
            {requests
              .filter((r) => r.status !== 'closed')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} · {r.bloodGroup} ({r.urgency.toUpperCase()}) - {r.units} units required
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={btnPrimary}
          >
            Confirm Slot
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// 6. Clinical Assessment Modal
export function ClinicalAssessmentModal({
  appointment,
  onClose,
  onApprove,
  onReject,
}: {
  appointment: Appointment
  onClose: () => void
  onApprove: (vitals: {
    hemoglobin: number
    bpSystolic: number
    bpDiastolic: number
    notes: string
  }) => void
  onReject: (reason: string) => void
}) {
  const [hemoglobin, setHemoglobin] = useState<number>(14.2)
  const [bpSystolic, setBpSystolic] = useState<number>(120)
  const [bpDiastolic, setBpDiastolic] = useState<number>(80)
  const [temperature, setTemperature] = useState<string>('98.4')
  const [weightKg, setWeightKg] = useState<number>(68)
  const [notes, setNotes] = useState<string>(
    'Donor in good general health. Normal heart sounds, clear lungs. Veins viable for venipuncture.'
  )
  const [verifiedEligibility, setVerifiedEligibility] = useState<boolean>(true)
  const [verifiedCompatibility, setVerifiedCompatibility] = useState<boolean>(true)

  const donorName =
    typeof appointment.donor === 'object' ? appointment.donor.name : 'Registered Donor'
  const donorBlood =
    typeof appointment.donor === 'object' ? appointment.donor.bloodGroup : 'O+'

  const handleApprove = () => {
    if (!verifiedEligibility || !verifiedCompatibility) {
      alert('Please check both verification sign-off boxes to approve donor for collection.')
      return
    }
    onApprove({
      hemoglobin,
      bpSystolic,
      bpDiastolic,
      notes,
    })
    onClose()
  }

  const handleReject = () => {
    const reason = prompt('Please enter clinical reason for deferral / rejection:', 'Hemoglobin below acceptable threshold')
    if (reason) {
      onReject(reason)
      onClose()
    }
  }

  return (
    <ModalWrapper
      title={`Clinical Assessment — ${donorName}`}
      subtitle={`Appointment #${appointment.id} · Blood Group: ${donorBlood}`}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>DEMO CLINICAL WORKFLOW:</strong> Simulated examination parameters for prototype
            demonstration. Real clinical approval must always be conducted by qualified blood bank
            officers.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Measured Hemoglobin (g/dL)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
              />
              <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">
                ≥ 12.5 required
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Donor Weight (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
              />
              <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">
                ≥ 50 kg
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Systolic BP (mmHg)
            </label>
            <input
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Diastolic BP (mmHg)
            </label>
            <input
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Body Temp (°F)
            </label>
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400 tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Clinical Officer Findings &amp; Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={verifiedEligibility}
              onChange={(e) => setVerifiedEligibility(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#D92027] focus:ring-[#D92027]"
            />
            <span>I confirm donor satisfies all clinical and physical eligibility criteria.</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={verifiedCompatibility}
              onChange={(e) => setVerifiedCompatibility(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#D92027] focus:ring-[#D92027]"
            />
            <span>I have verified donor photo identity and ABO group records.</span>
          </label>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReject}
            className={btnDanger}
          >
            Defer / Reject Donor
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className={btnSuccess}
            >
              <Check className="w-3.5 h-3.5" />
              Approve for Collection
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 7. Phlebotomy and Collection Modal (Strict Safety Rule: Quarantine, never auto-stock!)
export function PhlebotomyCollectionModal({
  appointment,
  onClose,
  onConfirmCollection,
}: {
  appointment: Appointment
  onClose: () => void
  onConfirmCollection: (data: {
    donationId: string
    bagSerial: string
    bloodGroup: string
    volume: 350 | 450
    collectionDate: string
    clinicalOfficer: string
    notes: string
  }) => void
}) {
  const donorName =
    typeof appointment.donor === 'object' ? appointment.donor.name : 'Registered Donor'
  const donorBlood =
    typeof appointment.donor === 'object' ? appointment.donor.bloodGroup || 'O+' : 'O+'

  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const [donationId] = useState<string>(`DN-2026-${randomNum}`)
  const [bagSerial, setBagSerial] = useState<string>(`BAG-${randomNum}-${donorBlood}`)
  const [volume, setVolume] = useState<350 | 450>(450)
  const [collectionDate] = useState<string>(new Date().toISOString())
  const [clinicalOfficer, setClinicalOfficer] = useState<string>(
    'Dr. Sunita Rao, MBBS / Senior Phlebotomist'
  )
  const [notes, setNotes] = useState<string>(
    'Single clean venipuncture right arm, 8-minute collection. Donor rested 15 mins with refreshments.'
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirmCollection({
      donationId,
      bagSerial,
      bloodGroup: donorBlood,
      volume,
      collectionDate,
      clinicalOfficer,
      notes,
    })
    onClose()
  }

  return (
    <ModalWrapper
      title={`Record Phlebotomy & Blood Collection`}
      subtitle={`Donor: ${donorName} · Blood Group: ${donorBlood}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-900">
          <ShieldAlert className="w-4 h-4 text-[#D92027] shrink-0 mt-0.5" />
          <div>
            <strong>BLOOD SAFETY PROTOCOL:</strong> Collected units are immediately transferred to
            the <strong>Quality &amp; Safety Quarantine</strong> laboratory queue. Units will{' '}
            <strong>NOT</strong> be added to available stock until infectious disease screening and
            component verification are manually signed off.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Donation ID
            </label>
            <input
              type="text"
              readOnly
              value={donationId}
              className="w-full text-xs tabular-nums font-mono font-medium p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bag Serial Number
            </label>
            <input
              type="text"
              required
              value={bagSerial}
              onChange={(e) => setBagSerial(e.target.value)}
              className="w-full text-xs tabular-nums font-mono font-medium p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Collection Volume
          </label>
          <div className="flex gap-2.5">
            {[350, 450].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVolume(v as 350 | 450)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  volume === v
                    ? 'bg-[#D92027] text-white border-[#D92027]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {v} ml (Whole Blood)
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Clinical Officer / Phlebotomist
          </label>
          <input
            type="text"
            required
            value={clinicalOfficer}
            onChange={(e) => setClinicalOfficer(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Phlebotomy Log Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={btnPrimary}
          >
            <Droplet className="w-3.5 h-3.5" />
            Confirm Collection &amp; Quarantine Unit
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// 8. Quality & Lab Processing Modal (Infectious disease screening & manual release)
export function LabTestingModal({
  unit,
  onClose,
  onUpdateUnit,
  onReleaseToStock,
  onRejectUnit,
}: {
  unit: QuarantineUnit
  onClose: () => void
  onUpdateUnit: (updated: QuarantineUnit) => void
  onReleaseToStock: (unit: QuarantineUnit) => void
  onRejectUnit: (unitId: string, reason: string) => void
}) {
  const [screening, setScreening] = useState(unit.screening)
  const [components, setComponents] = useState(unit.components)
  const [verifiedBy, setVerifiedBy] = useState(
    unit.verifiedBy || 'Dr. K. S. Mukherjee, MD (Transfusion Medicine)'
  )

  const allScreened =
    screening.hiv === 'negative' &&
    screening.hbv === 'negative' &&
    screening.hcv === 'negative' &&
    screening.syphilis === 'negative' &&
    screening.malaria === 'negative'

  const handleSimulateScreening = () => {
    const updatedScreening: QuarantineUnit['screening'] = {
      hiv: 'negative',
      hbv: 'negative',
      hcv: 'negative',
      syphilis: 'negative',
      malaria: 'negative',
    }
    setScreening(updatedScreening)
    onUpdateUnit({
      ...unit,
      screening: updatedScreening,
      status: 'screened',
    })
  }

  const handleProcessComponents = () => {
    const updatedComponents = { prbc: true, ffp: true, platelets: true }
    setComponents(updatedComponents)
    onUpdateUnit({
      ...unit,
      components: updatedComponents,
      status: 'processing',
    })
  }

  const handleVerify = () => {
    onUpdateUnit({
      ...unit,
      screening,
      components,
      verifiedBy,
      status: 'verified',
    })
  }

  const handleRelease = () => {
    if (!allScreened) {
      alert('Cannot release unit: Infectious disease screening is incomplete.')
      return
    }
    onReleaseToStock(unit)
    onClose()
  }

  const handleReject = () => {
    const reason = prompt('Reason for laboratory discard / quarantine rejection:', 'Serology reactive marker detected')
    if (reason) {
      onRejectUnit(unit.id, reason)
      onClose()
    }
  }

  return (
    <ModalWrapper
      title={`Lab Quality & Processing — Unit ${unit.id}`}
      subtitle={`Bag Serial: ${unit.bagSerial} · Group: ${unit.bloodGroup} · Donor: ${unit.donorName}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Serology / Viral Disease Screening */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Microscope className="w-3.5 h-3.5 text-slate-700" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                1. Infectious Disease Screening Panel
              </h4>
            </div>
            <button
              type="button"
              onClick={handleSimulateScreening}
              className={btnSecondary}
            >
              Simulate Serology Run
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            {[
              ['HIV 1 & 2', screening.hiv],
              ['Hep B (HBsAg)', screening.hbv],
              ['Hep C (HCV)', screening.hcv],
              ['Syphilis', screening.syphilis],
              ['Malaria', screening.malaria],
            ].map(([label, status]) => (
              <div
                key={label}
                className={`p-2 rounded-md border text-xs font-medium ${
                  status === 'negative'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : status === 'reactive'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-medium truncate">{label}</div>
                <div className="text-[10px] mt-0.5 capitalize text-slate-500">
                  {status === 'negative' ? 'Non-Reactive' : status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Component Processing */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-700" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-800">
                2. Component Separation (Centrifugation)
              </h4>
            </div>
            <button
              type="button"
              disabled={!allScreened}
              onClick={handleProcessComponents}
              className={`${btnSecondary} disabled:opacity-50`}
            >
              Separate Components
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              className={`p-2 rounded-md border flex items-center justify-between ${
                components.prbc
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span>Packed Red Cells</span>
              {components.prbc ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : 'Pending'}
            </div>
            <div
              className={`p-2 rounded-md border flex items-center justify-between ${
                components.ffp
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span>Fresh Frozen Plasma</span>
              {components.ffp ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : 'Pending'}
            </div>
            <div
              className={`p-2 rounded-md border flex items-center justify-between ${
                components.platelets
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span>Platelet Concentrate</span>
              {components.platelets ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : 'Pending'}
            </div>
          </div>
        </div>

        {/* Step 3: Officer Sign-off */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-800">
              3. Quality Officer Sign-Off &amp; Certification
            </h4>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              className="flex-1 text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
            />
            <button
              type="button"
              disabled={!allScreened}
              onClick={handleVerify}
              className={
                unit.status === 'verified'
                  ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : btnPrimary
              }
            >
              {unit.status === 'verified' ? '✓ Verified' : 'Sign-Off Verification'}
            </button>
          </div>
        </div>

        {/* Release to Stock Button */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-emerald-950">
              Release to Available Inventory
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Releases verified whole blood unit into live available stock (+1 {unit.bloodGroup} unit).
            </p>
          </div>
          <button
            type="button"
            disabled={unit.status !== 'verified' && !allScreened}
            onClick={handleRelease}
            className={`${btnSuccess} disabled:opacity-40`}
          >
            Release to Stock (+1 Unit)
          </button>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReject}
            className={btnDanger}
          >
            Reject / Discard Unit
          </button>
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 9. Donor Profile Modal
export function DonorProfileModal({
  donor,
  onClose,
  onSchedule,
}: {
  donor: Donor
  onClose: () => void
  onSchedule: (donor: Donor) => void
}) {
  return (
    <ModalWrapper
      title={`Donor Record: ${donor.name}`}
      subtitle={`LifeDrop Verified Donor ID: ${donor.id}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center border border-slate-200 shadow-2xs">
            {donor.bloodGroup || 'O+'}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{donor.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{donor.city}</span>
              <span>•</span>
              <span className={donor.available ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                {donor.available ? 'Available for calls' : 'On standby'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 border border-slate-200 rounded-lg bg-white">
            <span className="text-slate-500">Total Verified Donations:</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">2 Whole Blood Units</div>
          </div>
          <div className="p-2.5 border border-slate-200 rounded-lg bg-white">
            <span className="text-slate-500">120-Day Whole Blood Interval:</span>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">Satisfied (Eligible)</div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Last Donation Date:</span>
            <strong className="text-slate-900">125 days ago</strong>
          </div>
          <div className="flex justify-between">
            <span>Pre-Screening Status:</span>
            <strong className="text-emerald-700">Questionnaire Completed</strong>
          </div>
          <div className="flex justify-between">
            <span>Identity Verification:</span>
            <strong className="text-slate-900">Aadhaar Card Verified</strong>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onSchedule(donor)
            }}
            className={btnPrimary}
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Assessment
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

