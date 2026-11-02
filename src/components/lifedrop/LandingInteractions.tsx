'use client'

import { useState, type FormEvent } from 'react'
import { Droplet, ArrowRight, ShieldCheck, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { fieldClass, primaryButton, AppleBadge } from './ui'

const groupDetails: Record<
  string,
  {
    canGiveTo: string[]
    canReceiveFrom: string[]
    summary: string
    isUniversal?: 'donor' | 'receiver'
  }
> = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    summary: 'Universal red blood cell donor. Vital in emergency medicine and trauma care.',
    isUniversal: 'donor',
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    summary: 'The most commonly transfused blood type across trauma and surgical units.',
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    summary: 'Essential for matching patients with rare antibodies and complex treatments.',
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    summary: 'High demand across hospitals for routine surgeries and cancer treatments.',
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    summary: 'One of the rarest blood groups. Even a single donation has immense local impact.',
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    summary: 'Frequently needed in blood banks for scheduled transfusions and care.',
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    summary: 'Rarest blood type. Crucial for matching specialized plasma requirements.',
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    summary: 'Universal recipient for red blood cells, and universal plasma donor.',
    isUniversal: 'receiver',
  },
}

const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function BloodGuide() {
  const [group, setGroup] = useState('O+')
  const details = groupDetails[group] || groupDetails['O+']

  return (
    <div className="mt-8">
      {/* 8 Blood Groups Tactile Segmented Selector */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:grid-cols-8" role="tablist">
        {groups.map((g) => {
          const isSelected = group === g
          return (
            <button
              key={g}
              onClick={() => setGroup(g)}
              role="tab"
              aria-selected={isSelected}
              className={`tactile-btn relative flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-[transform,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] active:scale-[0.95] ${
                isSelected
                  ? 'border-brand bg-brand text-white shadow-md shadow-brand/20 ring-2 ring-brand/20'
                  : 'border-black/[0.06] bg-white text-zinc-800 shadow-sm hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Droplet
                className={`mb-2 transition-colors duration-150 ${
                  isSelected ? 'text-white' : 'text-brand/70'
                }`}
                size={18}
                strokeWidth={2}
                fill="currentColor"
              />
              <span className="tabular-nums text-lg font-bold tracking-tight">{g}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Blood Group Medical Compatibility Card */}
      <div className="apple-card mt-5 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1F1] tabular-nums text-xl font-extrabold tracking-tight text-[#D92027] ring-1 ring-[#D92027]/15">
              {group}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-[#111827]">
                  Your {group} donation transforms lives.
                </h3>
                {details.isUniversal === 'donor' && (
                  <AppleBadge variant="brand">Universal Red Cell Donor</AppleBadge>
                )}
                {details.isUniversal === 'receiver' && (
                  <AppleBadge variant="success">Universal Recipient</AppleBadge>
                )}
              </div>
              <p className="mt-1.5 max-w-2xl text-descriptive-xs">
                {details.summary}
              </p>

              {/* Compatibility Pills */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-normal text-slate-400">Can give to: </span>
                  <span className="font-semibold text-slate-800">
                    {details.canGiveTo.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-normal text-slate-400">Can receive from: </span>
                  <span className="font-semibold text-slate-800">
                    {details.canReceiveFrom.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/join"
            className={`${primaryButton} shrink-0 !py-2.5 !px-4 text-xs font-semibold`}
          >
            <span>Register as {group} Donor</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
        <ShieldCheck size={13} className="shrink-0 text-zinc-400" />
        Medical compatibility and donor eligibility are strictly re-verified by clinical blood bank staff.
      </p>
    </div>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    setStatus('')
    setIsSuccess(false)
    try {
      const data = Object.fromEntries(new FormData(form))
      const response = await fetch('/api/lifedrop/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send. Please try again.')
      setIsSuccess(true)
      setStatus('Thank you. Your message has been received by our support team.')
      form.reset()
    } catch (err) {
      setIsSuccess(false)
      setStatus(err instanceof Error ? err.message : 'Unable to send your message.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-zinc-700">
          <span>Your name</span>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Dr. John Doe / Sarah Jenkins"
            className={fieldClass}
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-zinc-700">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@hospital.org"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
        <span>How can we help?</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Inquire about hospital affiliation, blood drive campaigns, or technical assistance…"
          className={`${fieldClass} resize-y`}
        />
      </label>
      <p className="text-descriptive-xs !text-zinc-400">
        Please do not include confidential medical records or patient identifiers.
      </p>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          disabled={busy}
          className={`${primaryButton} !py-2.5 !px-5 text-xs font-semibold`}
        >
          {busy ? 'Sending message…' : 'Send message'}
          <Send size={13} />
        </button>
        {status && (
          <div
            role="status"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
              isSuccess ? 'bg-emerald-50 text-emerald-800' : 'bg-[#FFF1F1] text-[#D92027]'
            }`}
          >
            {isSuccess && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
            <span>{status}</span>
          </div>
        )}
      </div>
    </form>
  )
}
