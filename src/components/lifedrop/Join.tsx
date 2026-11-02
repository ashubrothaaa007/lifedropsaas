'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Building2,
  HandHeart,
  ShieldCheck,
  Heart,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Logo, primaryButton, fieldClass, Eyebrow } from './ui'

const roles = [
  {
    role: 'donor',
    title: 'I want to donate',
    label: 'Donor',
    icon: HeartHandshake,
    description: 'Give a little of yourself. Give someone a tomorrow.',
    benefit: 'Connect with verified donation requests and track eligibility.',
  },
  {
    role: 'hospital',
    title: 'I represent a hospital',
    label: 'Hospital',
    icon: Building2,
    description: 'Coordinate care. Ensure every donation counts.',
    benefit: 'Manage blood inventory, appointments, and donor screenings.',
  },
  {
    role: 'receiver',
    title: 'I’m looking for blood',
    label: 'Receiver',
    icon: HandHeart,
    description: 'Find a helping hand when it matters most.',
    benefit: 'Discover matching nearby donors and coordinate with hospitals.',
  },
] as const

export default function Join() {
  const [role, setRole] = useState('')
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fields = Object.fromEntries(new FormData(e.currentTarget))
      const response = await fetch('/api/lifedrop/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, role, action: tab }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in. Please verify your details.')
      sessionStorage.removeItem('lifedrop-demo')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function demo() {
    sessionStorage.setItem('lifedrop-demo', role)
    router.push('/dashboard')
  }

  const selected = roles.find((r) => r.role === role)

  return (
    <main className="min-h-screen bg-[#F8F8FA]">
      {/* Top Header */}
      <header className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <Logo />
        <Link
          href="/"
          className="tactile-btn flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors duration-150 hover:text-zinc-900"
        >
          <ArrowLeft size={14} />
          <span>Back to home</span>
        </Link>
      </header>

      {/* Screen 1: Role Selection */}
      {!selected ? (
        <section className="mx-auto max-w-[1100px] px-6 pb-20 pt-8 md:pt-14">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/15">
              <Heart size={22} strokeWidth={2.2} fill="currentColor" />
            </span>
            <Eyebrow>Join the LifeDrop Network</Eyebrow>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
              A place for you.
              <br />
              <span className="text-[#D92027]">Hope for someone in need.</span>
            </h1>
            <p className="mt-3.5 text-descriptive text-descriptive-lg">
              Select your role to access your personalized portal and clinical tools.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {roles.map(({ icon: Icon, ...r }) => (
              <button
                key={r.role}
                onClick={() => {
                  setRole(r.role)
                  setError('')
                }}
                className="saas-card group relative flex flex-col justify-between rounded-3xl p-7 text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div>
                  <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/15 transition-transform duration-150 group-hover:scale-[1.04]">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <p className="mb-1 text-[11px] font-bold tracking-wider text-[#D92027] uppercase">
                    {r.label}
                  </p>
                  <h2 className="text-lg font-bold tracking-tight text-[#111827]">{r.title}</h2>
                  <p className="mt-2 text-descriptive-xs">{r.description}</p>
                </div>

                <div className="mt-6 border-t border-zinc-100 pt-5">
                  <p className="text-[11px] font-normal leading-relaxed text-slate-400">{r.benefit}</p>
                  <span className="mt-4 flex items-center justify-between text-xs font-semibold tracking-tight text-[#D92027]">
                    <span>Continue as {r.label.toLowerCase()}</span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck size={14} className="text-zinc-400" />
            <span>Strict privacy safeguards. Medical confidentiality enforced by default.</span>
          </p>
        </section>
      ) : (
        /* Screen 2: Authentication & Onboarding */
        <section className="mx-auto grid max-w-[1040px] items-start gap-12 px-6 py-8 md:grid-cols-[0.9fr_1.1fr] md:py-14">
          {/* Left Context Column */}
          <div className="md:pt-4">
            <button
              onClick={() => {
                setRole('')
                setError('')
              }}
              className="tactile-btn mb-6 flex items-center gap-1.5 text-xs font-semibold text-[#D92027] hover:text-[#A8171D]"
            >
              <ArrowLeft size={14} />
              <span>Choose a different role</span>
            </button>

            <Eyebrow>{selected.label} Portal</Eyebrow>
            <h1 className="text-3xl leading-[1.15] font-extrabold tracking-tight text-[#111827] md:text-4xl">
              You are part of
              <br />
              something <span className="text-[#D92027]">life-changing.</span>
            </h1>

            <p className="mt-3.5 max-w-sm text-xs font-normal leading-relaxed text-slate-500 md:text-sm">
              {selected.description} Let&apos;s get you signed in and ready.
            </p>

            <div className="mt-7 space-y-3.5">
              {[
                'Verified hospital and donor coordination',
                'Pre-donation eligibility screening & interval tracking',
                'End-to-end data security and medical safeguards',
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-xs text-zinc-700">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/20">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Demo Exploration Callout */}
            <div className="saas-card mt-8 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D92027]" />
                <p className="text-xs font-bold text-zinc-950">Explore interactive demonstration</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
                Experience the complete {role} workflow using pre-populated sample medical records.
                Demo mode never contacts real donors or hospitals.
              </p>
              <button
                type="button"
                onClick={demo}
                className="tactile-btn mt-3.5 flex items-center gap-1.5 rounded-xl bg-[#FFF1F1] px-3.5 py-2 text-xs font-semibold text-[#D92027] border border-[#D92027]/15 transition-colors hover:bg-red-100/60"
              >
                <span>Launch {role} demo scenario</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Right Authentication Card */}
          <div className="saas-card overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-7 shadow-sm sm:p-9">
            {/* Apple-style Segmented Control */}
            <div
              className="mb-6 flex rounded-xl bg-zinc-100/80 p-1"
              role="tablist"
              aria-label="Authentication mode"
            >
              {[
                ['login', 'Sign in'],
                ['signup', 'Create account'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  key={value}
                  onClick={() => {
                    setTab(value as 'login' | 'signup')
                    setError('')
                  }}
                  className={`tactile-btn flex-1 rounded-lg py-2 text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out)] ${
                    tab === value
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              {tab === 'login' ? 'Welcome back.' : 'Create your account.'}
            </h2>
            <p className="mb-6 mt-1 text-xs text-zinc-500">
              {tab === 'login'
                ? `Sign in with your ${role} credentials.`
                : `Set up your LifeDrop ${role} account.`}
            </p>

            <form onSubmit={submit} className="space-y-4">
              {tab === 'signup' && (
                <>
                  <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
                    <span>
                      {role === 'hospital' ? 'Hospital / Clinic name' : 'Full name'}
                    </span>
                    <input
                      name="name"
                      required
                      maxLength={100}
                      className={fieldClass}
                      placeholder={role === 'hospital' ? 'e.g. City General Hospital' : 'e.g. Rahul Sharma'}
                      autoComplete="name"
                    />
                  </label>
                  <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
                    <span>City</span>
                    <input
                      name="city"
                      required
                      maxLength={80}
                      className={fieldClass}
                      placeholder="e.g. Mumbai / Delhi / Bengaluru"
                      autoComplete="address-level2"
                    />
                  </label>
                  {role === 'donor' && (
                    <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
                      <span>Blood group</span>
                      <select name="bloodGroup" required className={fieldClass} defaultValue="">
                        <option value="" disabled>
                          Select your blood group
                        </option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}

              <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  className={fieldClass}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="block space-y-1.5 text-xs font-medium text-zinc-700">
                <span>Password</span>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={128}
                    className={`${fieldClass} pr-11`}
                    placeholder="At least 8 characters"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="tactile-btn absolute right-3 top-2.5 p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {tab === 'signup' && (
                <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-zinc-500">
                  <input type="checkbox" required className="mt-0.5 size-4 rounded accent-[#D92027]" />
                  <span>
                    I consent to LifeDrop processing my account details for donation coordination.
                    I acknowledge preliminary assessments require clinical re-verification.
                  </span>
                </label>
              )}

              {role === 'hospital' && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 p-3 text-[11px] leading-relaxed text-amber-900 border border-amber-200/50">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-700" />
                  <span>
                    Hospital accounts require admin staff verification before full access to clinical blood inventory is granted.
                  </span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl bg-[#FFF1F1] p-3 text-xs font-semibold text-[#D92027] border border-[#D92027]/20"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={busy}
                className={`${primaryButton} w-full !py-3 font-semibold text-xs`}
              >
                <span>
                  {busy
                    ? 'Processing…'
                    : tab === 'login'
                      ? `Sign in as ${role}`
                      : 'Complete Registration'}
                </span>
                <ArrowRight size={14} />
              </button>
            </form>

            <p className="mt-6 text-center text-[10px] leading-relaxed text-zinc-400">
              Encrypted credentials · Safe clinical coordination
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
