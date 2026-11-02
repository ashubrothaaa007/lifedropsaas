import Link from 'next/link'
import { Droplet, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

export const primaryButton =
  'tactile-btn inline-flex items-center justify-center gap-2 rounded-xl bg-[#D92027] px-4.5 py-2.5 text-sm font-semibold tracking-normal text-white shadow-[0_1px_2px_rgba(217,32,39,0.2),0_4px_12px_rgba(217,32,39,0.18)] transition-all duration-150 ease-[var(--ease-out)] hover:bg-[#A8171D] hover:shadow-[0_2px_4px_rgba(217,32,39,0.25),0_6px_18px_rgba(217,32,39,0.22)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none'

export const secondaryButton =
  'tactile-btn inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white px-4.5 py-2.5 text-sm font-semibold tracking-normal text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 ease-[var(--ease-out)] hover:border-slate-400 hover:bg-slate-50/80 hover:text-slate-950 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none'

export const subtleButton =
  'tactile-btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100/90 px-3 py-1.5 text-xs font-semibold tracking-normal text-slate-700 transition-all duration-150 ease-[var(--ease-out)] hover:bg-slate-200/80 hover:text-slate-900 active:scale-[0.98]'

export const dangerButton =
  'tactile-btn inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200/80 px-4 py-2.5 text-sm font-semibold tracking-normal text-[#D92027] transition-all duration-150 ease-[var(--ease-out)] hover:bg-red-100 hover:text-[#A8171D] active:scale-[0.98]'

export const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-900 shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 focus:border-[#D92027] focus:ring-2 focus:ring-[#D92027]/15 disabled:bg-slate-50 disabled:text-slate-400 tracking-normal'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="tactile-btn group inline-flex items-center gap-2.5 select-none"
      aria-label="LifeDrop home"
    >
      <span className="relative flex size-8.5 items-center justify-center rounded-xl bg-[#D92027] text-white shadow-[0_1px_3px_rgba(217,32,39,0.25),0_3px_10px_rgba(217,32,39,0.2)] transition-transform duration-150 ease-[var(--ease-out)] group-hover:scale-[1.04] group-active:scale-[0.96]">
        <Droplet size={18} strokeWidth={2.2} fill="currentColor" />
        <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-white text-[8px] font-black text-[#D92027] ring-2 ring-white">
          +
        </span>
      </span>
      <span
        className={`text-lg font-bold tracking-normal ${light ? 'text-white' : 'text-slate-900'}`}
      >
        Life<span className="text-[#D92027]">Drop</span>
      </span>
    </Link>
  )
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
        light ? 'text-[#FFF1F1]/90' : 'text-[#D92027]'
      }`}
    >
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-3xl leading-[1.18] font-bold tracking-[-0.018em] text-slate-900 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 max-w-[65ch] text-descriptive text-descriptive-lg">
          {description}
        </p>
      )}
    </div>
  )
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="tactile-btn inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[#D92027] transition-colors duration-150 hover:text-[#A8171D]"
    >
      <span>{children}</span>
      <ArrowUpRight size={15} strokeWidth={2.2} />
    </Link>
  )
}

export function AppleBadge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
}) {
  const styles = {
    neutral: 'bg-zinc-100/90 text-zinc-700 border-zinc-200/70',
    brand: 'bg-[#FFF1F1] text-[#D92027] border-[#D92027]/20',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-900 border-amber-200/70',
    danger: 'bg-red-50 text-[#A8171D] border-red-200/80',
  }[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${styles}`}
    >
      {children}
    </span>
  )
}

export function StatusDot({
  status = 'active',
}: {
  status?: 'active' | 'pending' | 'critical' | 'neutral'
}) {
  const colors = {
    active: 'bg-emerald-500 ring-emerald-500/20',
    pending: 'bg-amber-500 ring-amber-500/20',
    critical: 'bg-[#D92027] ring-[#D92027]/20',
    neutral: 'bg-zinc-400 ring-zinc-400/20',
  }[status]

  return (
    <span className="relative flex size-2 items-center justify-center">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colors}`} />
      <span className={`relative inline-flex size-1.5 rounded-full ring-2 ${colors}`} />
    </span>
  )
}

export type Photo = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

export function getPhoto(value: unknown): Photo | null {
  return value && typeof value === 'object' && 'url' in value ? (value as Photo) : null
}
