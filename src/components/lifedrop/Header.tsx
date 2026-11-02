'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo, primaryButton } from './ui'

const links = [
  ['Home', '/'],
  ['About us', '/#about'],
  ['How it works', '/#how-it-works'],
  ['Blood groups', '/#blood-groups'],
  ['Campaigns', '/#campaigns'],
  ['Contact', '/#contact'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ease-[var(--ease-out)] ${
        scrolled
          ? 'border-b border-black/[0.06] bg-white/85 shadow-sm shadow-black/[0.03] backdrop-blur-xl'
          : 'border-b border-black/[0.04] bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-10">
        <Logo />

        {/* Desktop Navigation with tactile hover pills */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main navigation">
          {links.map(([label, href], i) => {
            const isActive = i === 0 && pathname === '/'
            return (
              <Link
                key={label}
                href={href}
                className={`tactile-btn relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-tight transition-[background-color,color] duration-150 ease-[var(--ease-out)] ${
                  isActive
                    ? 'bg-[#FFF1F1] text-[#D92027]'
                    : 'text-slate-600 hover:bg-zinc-100/80 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/join"
            className="tactile-btn rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors duration-150 hover:text-zinc-900 active:scale-[0.97]"
          >
            Sign in
          </Link>
          <Link href="/join" className={`${primaryButton} !py-2.5 !px-4 text-xs`}>
            <span>Donate Now</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="tactile-btn flex size-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/80 p-2 text-zinc-700 transition-colors active:scale-[0.92] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile navigation panel with origin-aware scale */}
      {open && (
        <div className="absolute inset-x-0 top-20 border-b border-black/[0.06] bg-white/95 p-6 shadow-xl shadow-black/[0.06] backdrop-blur-2xl transition-[opacity,transform] duration-200 ease-[var(--ease-out)] lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
            {links.map(([label, href], i) => (
              <Link
                href={href}
                key={label}
                onClick={() => setOpen(false)}
                className={`tactile-btn flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  i === 0 && pathname === '/'
                    ? 'bg-[#FFF1F1] font-semibold text-[#D92027]'
                    : 'text-zinc-700 hover:bg-zinc-100/70'
                }`}
              >
                <span>{label}</span>
                <span className="text-xs text-zinc-400">→</span>
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2.5 border-t border-zinc-100 pt-4">
              <Link
                href="/join"
                onClick={() => setOpen(false)}
                className="tactile-btn flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700"
              >
                Sign in
              </Link>
              <Link
                href="/join"
                onClick={() => setOpen(false)}
                className={`${primaryButton} !h-11 w-full !text-xs`}
              >
                <span>Donate Now</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
