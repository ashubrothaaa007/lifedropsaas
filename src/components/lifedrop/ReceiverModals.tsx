'use client'

import React, { useState } from 'react'
import {
  X,
  Check,
  AlertTriangle,
  Heart,
  Building2,
  Phone,
  MapPin,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react'
import type { BloodRequest, Donor, Hospital } from './dashboard-data'
import { groups } from './dashboard-data'

const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#D92027] hover:bg-[#b8181e] active:scale-[0.98] rounded-lg shadow-2xs transition-all'
const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] rounded-lg shadow-2xs transition-all'
const btnDangerFilled =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-lg shadow-2xs transition-all'

const inputClass =
  'w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#D92027] focus:ring-1 focus:ring-[#D92027] shadow-2xs text-slate-900 transition-all'

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-descriptive-sm mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

// 1. Create Blood Request Modal (Intuitive 3-Step Wizard)
export function CreateRequestModal({
  hospitals,
  initialHospitalId,
  initialBloodGroup,
  onClose,
  onCreate,
}: {
  hospitals: Hospital[]
  initialHospitalId?: string
  initialBloodGroup?: string
  onClose: () => void
  onCreate: (data: {
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
  }) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Patient info
  const [patientName, setPatientName] = useState('Aarav Sharma')
  const [hospitalId, setHospitalId] = useState(initialHospitalId || hospitals[0]?.id || '')
  const [ward, setWard] = useState('Cardiac ICU Ward 4')
  const [bedNumber, setBedNumber] = useState('Bed 402')
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Suresh Mehta, MD')

  // Step 2: Blood requirements
  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup || 'O+')
  const [units, setUnits] = useState(2)
  const [urgency, setUrgency] = useState<'emergency' | 'scheduled'>('emergency')
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 12 * 3600000).toISOString().slice(0, 16)
  )
  const [notes, setNotes] = useState('Urgent requirement for scheduled surgery transfusion.')

  // Step 3: Contact & Consent
  const [primaryContact, setPrimaryContact] = useState('+91 98201 55432')
  const [secondaryContact, setSecondaryContact] = useState('+91 98200 99887')
  const [consentGiven, setConsentGiven] = useState(false)

  const selectedHospital = hospitals.find((h) => h.id === hospitalId) || hospitals[0]

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!patientName.trim() || !hospitalId) return
      setStep(2)
    } else if (step === 2) {
      if (units < 1) return
      setStep(3)
    } else if (step === 3) {
      if (!consentGiven) {
        alert('Please accept the clinical verification consent to publish your request.')
        return
      }
      onCreate({
        patientName,
        hospitalId,
        ward,
        bedNumber,
        attendingPhysician,
        bloodGroup,
        units,
        urgency,
        requiredDate: new Date(requiredDate).toISOString(),
        notes,
        primaryContact,
        secondaryContact,
      })
      onClose()
    }
  }

  return (
    <ModalWrapper
      title="Create New Blood Request"
      subtitle={`Step ${step} of 3 · ${
        step === 1 ? 'Patient Information' : step === 2 ? 'Blood Requirements' : 'Review & Confirm'
      }`}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleNext} className="space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-semibold pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 1 ? 'bg-[#D92027] text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
              Patient Info
            </span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 2 ? 'bg-[#D92027] text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
              Requirements
            </span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step === 3 ? 'bg-[#D92027] text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
              Confirm
            </span>
          </div>
        </div>

        {/* STEP 1: PATIENT INFORMATION */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Patient Full Name / Case Identifier
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Treating Partner Hospital
              </label>
              <select
                required
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className={inputClass}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} · {h.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Ward / Department
                </label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. ICU Ward 4"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Bed / Room Number
                </label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  placeholder="e.g. Bed 402"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Attending Physician / Doctor
              </label>
              <input
                type="text"
                value={attendingPhysician}
                onChange={(e) => setAttendingPhysician(e.target.value)}
                placeholder="e.g. Dr. Suresh Mehta, MD"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* STEP 2: BLOOD REQUIREMENTS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Required Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {groups.map((g) => {
                  const active = bloodGroup === g
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setBloodGroup(g)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        active
                          ? 'bg-[#D92027] text-white border-[#D92027] shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Required Units
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnits((u) => Math.max(1, u - 1))}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-center font-bold text-sm p-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUnits((u) => Math.min(10, u + 1))}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <span className="text-xs text-slate-500 font-medium">units</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Urgency Level
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUrgency('emergency')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                      urgency === 'emergency'
                        ? 'bg-red-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Emergency
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('scheduled')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                      urgency === 'scheduled'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scheduled
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Required By (Date &amp; Time)
              </label>
              <input
                type="datetime-local"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Clinical Notes / Case Summary
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indication for transfusion, procedure details..."
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT & CONFIRMATION */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Summary Review Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
                Request Verification Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  Patient: <strong className="text-slate-900">{patientName}</strong>
                </div>
                <div>
                  Hospital: <strong className="text-slate-900">{selectedHospital.name}</strong>
                </div>
                <div>
                  Blood Group:{' '}
                  <span className="px-1.5 py-0.5 rounded font-bold text-[#D92027] bg-red-50 border border-red-200">
                    {bloodGroup}
                  </span>
                </div>
                <div>
                  Required Units: <strong className="text-slate-900">{units} Units</strong>
                </div>
                <div>
                  Ward / Bed: <strong className="text-slate-900">{ward} ({bedNumber})</strong>
                </div>
                <div>
                  Urgency:{' '}
                  <span
                    className={`font-semibold uppercase ${
                      urgency === 'emergency' ? 'text-[#D92027]' : 'text-slate-700'
                    }`}
                  >
                    {urgency}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Secondary Emergency Phone
                </label>
                <input
                  type="text"
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Mandatory Clinical Disclaimer */}
            <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-lg space-y-2">
              <div className="flex items-start gap-2 text-xs text-red-900">
                <Info className="w-4 h-4 text-[#D92027] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Clinical Notice:</strong> LifeDrop helps connect people with volunteer
                  donors. Blood compatibility, testing, and transfusion decisions must be verified
                  and performed by qualified hospital staff.
                </p>
              </div>
              <label className="flex items-start gap-2 text-xs font-medium text-slate-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded text-[#D92027] accent-[#D92027]"
                />
                <span>I confirm patient details are accurate and agree to hospital verification.</span>
              </label>
            </div>
          </div>
        )}

        {/* Buttons footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className={btnSecondary}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={btnSecondary}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className={btnPrimary}
          >
            {step === 3 ? (
              <>
                <Check className="w-4 h-4" /> Publish Blood Request
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// 2. Edit Request Modal
export function EditRequestModal({
  request,
  onClose,
  onSave,
}: {
  request: BloodRequest
  onClose: () => void
  onSave: (updated: Partial<BloodRequest>) => void
}) {
  const [ward, setWard] = useState(request.ward || 'Cardiac ICU Ward 4')
  const [bedNumber, setBedNumber] = useState(request.bedNumber || 'Bed 402')
  const [attendingPhysician, setAttendingPhysician] = useState(
    request.attendingPhysician || 'Dr. Suresh Mehta'
  )
  const [notes, setNotes] = useState(request.notes || '')
  const [primaryContact, setPrimaryContact] = useState(request.primaryContact || '+91 98201 55432')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ward,
      bedNumber,
      attendingPhysician,
      notes,
      primaryContact,
    })
    onClose()
  }

  return (
    <ModalWrapper
      title={`Edit Request #${request.id}`}
      subtitle={`Patient: ${request.patientName || 'Patient'} · Blood Group: ${request.bloodGroup}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bed / Room Number
            </label>
            <input
              type="text"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Attending Physician
          </label>
          <input
            type="text"
            value={attendingPhysician}
            onChange={(e) => setAttendingPhysician(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Contact Number
          </label>
          <input
            type="text"
            required
            value={primaryContact}
            onChange={(e) => setPrimaryContact(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Clinical Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
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
            Save Changes
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// 3. Cancel Request Dialog
export function CancelRequestModal({
  request,
  onClose,
  onConfirmCancel,
}: {
  request: BloodRequest
  onClose: () => void
  onConfirmCancel: (requestId: string, reason: string) => void
}) {
  const [reason, setReason] = useState('Blood arranged from hospital central stock')

  const handleConfirm = () => {
    onConfirmCancel(request.id, reason)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#D92027]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Cancel Blood Request?</h4>
            <p className="text-xs text-slate-500">Request #{request.id} · {request.bloodGroup}</p>
          </div>
        </div>

        <p className="text-descriptive-sm leading-relaxed">
          Cancelling this request will release all volunteer donor reservations and notify the hospital
          coordination team that units are no longer required.
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Reason for Cancellation</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
          >
            <option value="Blood arranged from hospital central stock">
              Blood arranged from hospital central stock
            </option>
            <option value="Patient procedure successfully completed">
              Patient procedure successfully completed
            </option>
            <option value="Transfusion cancelled by attending doctor">
              Transfusion cancelled by attending doctor
            </option>
            <option value="Family arranged direct replacement">
              Family arranged direct replacement
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            Keep Active
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={btnDangerFilled}
          >
            Yes, Cancel Request
          </button>
        </div>
      </div>
    </div>
  )
}

// 4. Hospital Detail & Emergency Contact Modal
export function HospitalContactModal({
  hospital,
  onClose,
  onRequestAtHospital,
}: {
  hospital: Hospital
  onClose: () => void
  onRequestAtHospital: (hospital: Hospital) => void
}) {
  return (
    <ModalWrapper
      title={hospital.name}
      subtitle={`Verified Blood Transfusion Center · ${hospital.city}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#D92027] border border-red-200 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{hospital.name}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {hospital.address || `${hospital.city}, Maharashtra`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
            <span className="text-slate-500 font-medium">Blood Bank License</span>
            <div className="tabular-nums font-semibold text-slate-900">MH-BB-2024-8901</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
            <span className="text-slate-500 font-medium">Operating Hours</span>
            <div className="font-semibold text-emerald-700">24/7 Emergency Service</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">
            Available Transfusion Services
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Whole Blood',
              'Packed Red Cells (PRBC)',
              'Fresh Frozen Plasma (FFP)',
              'Platelet Apheresis',
              'Compatibility Cross-Matching',
            ].map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-[11px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <Phone className="w-4 h-4 text-[#D92027]" />
            <div>
              <div className="font-semibold">24/7 Blood Bank Hotline</div>
              <div className="text-slate-600 tabular-nums font-medium">+91 22 2826 3000 / 112</div>
            </div>
          </div>
          <a
            href="tel:+912228263000"
            className={btnPrimary}
          >
            Call Desk
          </a>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${hospital.name} ${hospital.address || hospital.city}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View on Google Maps</span> <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose()
              onRequestAtHospital(hospital)
            }}
            className={btnPrimary}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Request at this Hospital
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 5. Donor Invite Modal
export function DonorInviteModal({
  donor,
  requests,
  onClose,
  onInvite,
}: {
  donor: Donor
  requests: BloodRequest[]
  onClose: () => void
  onInvite: (donorId: string, requestId: string) => void
}) {
  const activeRequests = requests.filter((r) => r.status !== 'closed' && r.status !== 'cancelled')
  const [selectedRequestId, setSelectedRequestId] = useState(activeRequests[0]?.id || '')

  const handleConfirm = () => {
    if (!selectedRequestId) return
    onInvite(donor.id, selectedRequestId)
    onClose()
  }

  return (
    <ModalWrapper
      title={`Invite ${donor.name} to Help`}
      subtitle={`Donor Blood Group: ${donor.bloodGroup || 'O+'} · City: ${donor.city}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-lg text-xs text-red-900 flex items-start gap-2">
          <Heart className="w-4 h-4 text-[#D92027] shrink-0 mt-0.5" />
          <span>
            Inviting will dispatch a high-priority LifeDrop notification and SMS to this donor requesting
            their support for your patient.
          </span>
        </div>

        {activeRequests.length > 0 ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select Patient Blood Request
            </label>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className={inputClass}
            >
              {activeRequests.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} · {r.patientName || 'Patient'} ({r.bloodGroup}) — {r.units} units required
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            You do not have any active blood requests open. Please create a blood request first.
          </div>
        )}

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
            disabled={!selectedRequestId}
            onClick={handleConfirm}
            className={`${btnPrimary} disabled:opacity-40 disabled:pointer-events-none`}
          >
            <Send className="w-3.5 h-3.5" />
            Send Invitation
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// 6. Privacy-Preserving Donor Detail Modal
export function DonorDetailModal({
  donor,
  onClose,
  onInvite,
}: {
  donor: Donor
  onClose: () => void
  onInvite: (donor: Donor) => void
}) {
  const names = donor.name.split(' ')
  const privacyName = names.length > 1 ? `${names[0]} ${names[1][0]}.` : donor.name

  return (
    <ModalWrapper
      title="Volunteer Donor Profile"
      subtitle="LifeDrop Verified Community Member"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-[#D92027] font-bold text-lg flex items-center justify-center border border-red-200 shrink-0">
            {donor.bloodGroup || 'O+'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{privacyName}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Donor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{donor.city}</span>
              <span>•</span>
              <span className={donor.available ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                {donor.available ? 'Available to coordinate' : 'On standby'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
            <span className="text-slate-500 font-medium">120-Day Whole Blood Interval</span>
            <div className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible to Donate
            </div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
            <span className="text-slate-500 font-medium">Preliminary Pre-Screening</span>
            <div className="font-semibold text-slate-900">Passed Questionnaire</div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
          <p className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protection:</strong> Direct residential addresses and private phone
              numbers are protected. When you invite this donor, coordination is handled securely
              through your treating partner hospital.
            </span>
          </p>
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
              onInvite(donor)
            }}
            className={btnPrimary}
          >
            <Send className="w-3.5 h-3.5" />
            Invite to Blood Request
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
