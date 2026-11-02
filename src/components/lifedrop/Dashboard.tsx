'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Droplet } from 'lucide-react'
import { Logo, secondaryButton } from './ui'
import { DonorDashboard } from '@/features/donor'
import { HospitalDashboard } from '@/features/hospital'
import { ReceiverDashboard } from '@/features/receiver'
import { demoScenario, type Role, type DashboardData } from './dashboard-data'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const loadLive = useCallback(async () => {
    try {
      const response = await fetch('/api/lifedrop/data', { cache: 'no-store' })
      const result = await response.json()
      if (response.status === 401) {
        router.replace('/join')
        return
      }
      if (!response.ok) throw new Error(result.error || 'Unable to load dashboard data.')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')
    }
  }, [router])

  useEffect(() => {
    const role = sessionStorage.getItem('lifedrop-demo') as Role | null
    if (role && ['donor', 'hospital', 'receiver'].includes(role)) {
      setIsDemo(true)
      setData(demoScenario(role))
    } else {
      loadLive().catch(() => setError('Unable to load dashboard. Please try signing in again.'))
    }
  }, [loadLive])

  const handleSignOut = useCallback(async () => {
    if (isDemo) {
      sessionStorage.removeItem('lifedrop-demo')
    } else {
      try {
        await fetch('/api/lifedrop/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        })
      } catch {
        // Fall through to client navigation on network failure
      }
    }
    router.push('/')
    router.refresh()
  }, [isDemo, router])

  const handleSwitchRole = useCallback((newRole: Role) => {
    sessionStorage.setItem('lifedrop-demo', newRole)
    setIsDemo(true)
    setData(demoScenario(newRole))
  }, [])

  if (!data) {
    return (
      <main className="lifedrop-dashboard flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8F8FA]">
        {error ? (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-sm text-center text-sm font-semibold text-[#D92027]">{error}</p>
            <button
              className={secondaryButton}
              onClick={() => {
                setError('')
                loadLive()
              }}
            >
              Try again
            </button>
            <Link href="/join" className="text-sm font-semibold text-[#D92027] hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#D92027] animate-pulse">
              <Droplet size={20} strokeWidth={2.2} fill="currentColor" />
            </span>
            <p className="text-xs font-semibold text-zinc-500">Preparing your LifeDrop workspace…</p>
          </div>
        )}
      </main>
    )
  }

  const role = data.user.role

  if (role === 'donor') {
    return (
      <DonorDashboard
        initialData={data}
        onSwitchRole={handleSwitchRole}
        onSignOut={handleSignOut}
      />
    )
  }

  if (role === 'hospital') {
    return (
      <HospitalDashboard
        initialData={data}
        onSwitchRole={handleSwitchRole}
        onExitDemo={handleSignOut}
        isDemo={isDemo}
      />
    )
  }

  if (role === 'receiver') {
    return (
      <ReceiverDashboard
        initialData={data}
        onSwitchRole={handleSwitchRole}
        onSignOut={handleSignOut}
        isDemo={isDemo}
      />
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F8FA] p-6 text-center">
      <Logo />
      <p className="text-sm text-zinc-600">Unknown account role.</p>
      <button className={secondaryButton} onClick={handleSignOut}>
        Sign out
      </button>
    </main>
  )
}
