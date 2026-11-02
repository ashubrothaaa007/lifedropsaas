'use client'

import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import type { BloodRequest, Hospital, Profile } from './dashboard-data'

interface GuidedDonationModalProps {
  isOpen: boolean
  onClose: () => void
  targetRequest: BloodRequest | null
  hospitals: Hospital[]
  donor: Profile
  onComplete: (data: {
    hospitalId: string
    hospitalName: string
    date: string
    requestId: string
  }) => void
  onViewAppointment?: () => void
}

export default function GuidedDonationModal({
  isOpen,
  onClose,
  targetRequest,
  hospitals,
  donor,
  onComplete,
  onViewAppointment,
}: GuidedDonationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 2: Health Screening state
  const [isAgeValid, setIsAgeValid] = useState<boolean | null>(true)
  const [isWeightValid, setIsWeightValid] = useState<boolean | null>(true)
  const [isHealthyToday, setIsHealthyToday] = useState<boolean | null>(true)
  const [isAlcoholFree, setIsAlcoholFree] = useState<boolean | null>(true)
  const [isIntervalMet, setIsIntervalMet] = useState<boolean | null>(true)

  // Step 3: Slot selection state
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM - 11:30 AM')
  const [confirmedData, setConfirmedData] = useState<{
    hospitalName: string
    address: string
    dateStr: string
    timeSlot: string
  } | null>(null)

  // Pre-generate 5 upcoming days
  const upcomingDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return {
      date: d,
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-IN', { month: 'short' }),
      formatted: d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }
  })

  // Initialize or reset when modal opens or targetRequest changes
  useEffect(() => {
    if (isOpen && targetRequest) {
      setStep(1)
      setIsAgeValid(true)
      setIsWeightValid(true)
      setIsHealthyToday(true)
      setIsAlcoholFree(true)
      setIsIntervalMet(true)

      const hospId =
        typeof targetRequest.hospital === 'object' && targetRequest.hospital !== null
          ? targetRequest.hospital.id
          : String(targetRequest.hospital)
      setSelectedHospitalId(hospId || hospitals[0]?.id || '')
      setSelectedDateIndex(0)
      setSelectedTimeSlot('10:30 AM - 11:30 AM')
      setConfirmedData(null)
    }
  }, [isOpen, targetRequest, hospitals])

  if (!isOpen || !targetRequest) return null

  const targetHospital =
    hospitals.find((h) => h.id === selectedHospitalId) ||
    (typeof targetRequest.hospital === 'object' ? targetRequest.hospital : null) ||
    hospitals[0]

  const isScreeningPassed =
    isAgeValid === true &&
    isWeightValid === true &&
    isHealthyToday === true &&
    isAlcoholFree === true &&
    isIntervalMet === true

  const handleConfirmAppointment = () => {
    const chosenDateObj = upcomingDates[selectedDateIndex].date
    // Add time offset based on slot
    const dateIso = chosenDateObj.toISOString()

    const summary = {
      hospitalName: targetHospital?.name || 'Partner Hospital',
      address: targetHospital?.address || 'Mumbai',
      dateStr: upcomingDates[selectedDateIndex].formatted,
      timeSlot: selectedTimeSlot,
    }
    setConfirmedData(summary)

    onComplete({
      hospitalId: targetHospital?.id || 'demo-h1',
      hospitalName: targetHospital?.name || 'Partner Hospital',
      date: dateIso,
      requestId: targetRequest.id,
    })

    setStep(4)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-all">
        {/* Modal Header */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-[#D92027]" />
                <span className="text-[10px] font-semibold tracking-wider text-[#D92027] uppercase">
                  Guided Donation Booking
                </span>
              </div>
              <h2 id="modal-headline" className="mt-0.5 text-base font-semibold text-slate-900">
                {step === 1 && 'Step 1: Patient Request Overview'}
                {step === 2 && 'Step 2: 60-Second Health Declaration'}
                {step === 3 && 'Step 3: Choose Appointment Slot'}
                {step === 4 && 'Appointment Confirmed'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-3.5 flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-[#D92027]' : 'bg-slate-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {/* STEP 1: REQUEST DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4">
                <div className="flex items-start gap-3.5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#D92027] text-lg font-bold tracking-tight text-white shadow-2xs">
                    {targetRequest.bloodGroup}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {targetHospital?.name || 'Designated Hospital'}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          targetRequest.urgency === 'emergency'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {targetRequest.urgency === 'emergency' ? 'Emergency' : 'Standard Need'}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {targetHospital?.address || targetRequest.city}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-slate-700">
                      <span>
                        <span className="font-semibold text-slate-900">{targetRequest.units}</span>{' '}
                        {targetRequest.units === 1 ? 'unit' : 'units'} needed
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">
                        {targetRequest.fulfilledUnits ?? 0} fulfilled so far
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  How your gift helps
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
                    <p className="text-xs font-semibold text-slate-900">Direct Patient Support</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      Your whole-blood donation is separated into red blood cells, platelets, and plasma, helping up to 3 recipients.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
                    <p className="text-xs font-semibold text-slate-900">Clinical Verification</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      You will undergo a comfortable 15-minute preliminary check by hospital staff before collection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
                <p className="font-semibold">Important Clinical Boundary:</p>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  Registering interest reserves an assessment slot. Final medical approval, vital checks, and hemoglobin testing are performed on-site by qualified hospital staff.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D92027] px-4 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-[#A8171D] active:scale-[0.98] transition"
                >
                  <span>Continue to Health Check</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ELIGIBILITY PRE-SCREENING */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Clinical Safety Alert */}
              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Hospital Medical Staff Conducts Final Checks</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800">
                    Do not guess your hemoglobin level. Hemoglobin, pulse, and blood pressure are measured with sterile clinical instruments at the hospital. This declaration only checks safety thresholds.
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Self-Declaration Checklist
                </h4>

                {/* 1. Age */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Age: 18 – 65 years</p>
                    <p className="text-[11px] text-slate-500">You are within the eligible adult age window.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAgeValid(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isAgeValid === true
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAgeValid(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isAgeValid === false
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* 2. Weight */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Weight: 50 kg or greater</p>
                    <p className="text-[11px] text-slate-500">Ensures adequate blood volume for safe donation.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsWeightValid(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isWeightValid === true
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWeightValid(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isWeightValid === false
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* 3. General Health Today */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Healthy & fever-free today</p>
                    <p className="text-[11px] text-slate-500">No active flu, infection, fever, or cold symptoms.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsHealthyToday(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isHealthyToday === true
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHealthyToday(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isHealthyToday === false
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* 4. Alcohol Window */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Alcohol-free for past 24 hours</p>
                    <p className="text-[11px] text-slate-500">Guarantees optimal donor hydration and stability.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAlcoholFree(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isAlcoholFree === true
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAlcoholFree(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isAlcoholFree === false
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* 5. 120-Day Interval */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">120+ days since last donation</p>
                    <p className="text-[11px] text-slate-500">Or first-time donor. Allows complete iron replenishment.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsIntervalMet(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isIntervalMet === true
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIntervalMet(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition ${
                        isIntervalMet === false
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {!isScreeningPassed && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    One or more clinical safety guidelines are not met. Donors must satisfy all basic safety criteria before scheduling an assessment.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!isScreeningPassed}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D92027] px-4 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-[#A8171D] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition"
                >
                  <span>Select Appointment Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: APPOINTMENT SELECTION */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Hospital Information */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-[#D92027]" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{targetHospital?.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{targetHospital?.address}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-700">
                      Department: Blood Bank & Transfusion Wing, 1st Floor
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Select Assessment Date
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {upcomingDates.map((item, idx) => (
                    <button
                      key={item.dayNumber}
                      type="button"
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition active:scale-[0.97] ${
                        selectedDateIndex === idx
                          ? 'border-[#D92027] bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027] shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase text-slate-500">{item.dayName}</span>
                      <span className="mt-0.5 tabular-nums text-base font-bold text-slate-900">{item.dayNumber}</span>
                      <span className="text-[9px] uppercase font-semibold text-slate-400">{item.monthName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Select Time Slot
                </label>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Morning Slots
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM - 10:30 AM', '10:30 AM - 11:30 AM', '11:30 AM - 12:30 PM'].map(
                        (slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition active:scale-[0.97] ${
                              selectedTimeSlot === slot
                                ? 'border-[#D92027] bg-[#D92027] text-white shadow-2xs font-semibold'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Afternoon Slots
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['02:00 PM - 03:00 PM', '03:30 PM - 04:30 PM', '04:30 PM - 05:30 PM'].map(
                        (slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition active:scale-[0.97] ${
                              selectedTimeSlot === slot
                                ? 'border-[#D92027] bg-[#D92027] text-white shadow-2xs font-semibold'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between rounded-lg bg-red-50/60 border border-red-200/60 px-3.5 py-2.5 text-xs font-medium text-[#D92027]">
                <span>Appointment Summary:</span>
                <span className="font-semibold">
                  {upcomingDates[selectedDateIndex].formatted} · {selectedTimeSlot}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAppointment}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D92027] px-4 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-[#A8171D] active:scale-[0.98] transition"
                >
                  <span>Confirm & Schedule</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS AND CONFIRMATION */}
          {step === 4 && confirmedData && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-red-50 text-[#D92027] border border-red-200 shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Confirmed & Synchronized
                </span>
                <h3 className="mt-2 text-base font-semibold text-slate-900">
                  Assessment Scheduled Successfully!
                </h3>
                <p className="mt-1 text-descriptive-sm max-w-md mx-auto">
                  Your appointment has been registered with the hospital blood bank team.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Hospital:</span>
                  <span className="font-semibold text-slate-900">{confirmedData.hospitalName}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-700">{confirmedData.address}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-[#D92027]">
                    {confirmedData.dateStr} · {confirmedData.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Request:</span>
                  <span className="font-semibold text-slate-800">
                    {targetRequest.bloodGroup} Blood Need (Status: Scheduled)
                  </span>
                </div>
              </div>

              {/* Pre-donation Checklist */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 text-left">
                <p className="text-xs font-semibold text-emerald-950">Pre-Donation Quick Checklist:</p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-emerald-900">
                  <li className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-emerald-600" />
                    Drink 500ml of water or fruit juice 1 hour before arrival.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-emerald-600" />
                    Eat a light, healthy meal (avoid fatty or heavy foods).
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-emerald-600" />
                    Carry a government photo ID (Aadhaar, Voter ID, PAN, or Passport).
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    if (onViewAppointment) onViewAppointment()
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#D92027] px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-[#A8171D] active:scale-[0.98] transition"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>View in My Appointments</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
