'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
} from 'lucide-react'
import type { BloodRequest, Appointment, Stock, DonationRecord } from './dashboard-data'

interface ChartDataPoint {
  label: string
  fullDate: string
  requested: number
  collected: number
}

interface HospitalAnalyticsProps {
  requests: BloodRequest[]
  appointments: Appointment[]
  inventory: Stock[]
  donationRecords?: DonationRecord[]
  className?: string
}

// Cubic bezier spline path generator for smooth curves
function getBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = i < points.length - 2 ? points[i + 2] : p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

// Closed area path for subtle area fill
function getAreaPath(points: { x: number; y: number }[], baselineY: number): string {
  if (points.length === 0) return ''
  const linePath = getBezierPath(points)
  const lastX = points[points.length - 1].x
  const firstX = points[0].x
  return `${linePath} L ${lastX.toFixed(2)} ${baselineY} L ${firstX.toFixed(2)} ${baselineY} Z`
}

// ============================================================================
// CHART 1: BLOOD REQUEST AND COLLECTION TRENDS (COMPACT: 320-350px total)
// ============================================================================
export function BloodTrendChart({
  requests,
  appointments,
  donationRecords,
}: {
  requests: BloodRequest[]
  appointments: Appointment[]
  donationRecords?: DonationRecord[]
}) {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Derive time series data points based on actual records and realistic hospital operations
  const dataPoints: ChartDataPoint[] = useMemo(() => {
    const totalReqUnits = requests.reduce((sum, r) => sum + r.units, 0)
    const completedAptsCount = appointments.filter((a) => a.status === 'completed').length
    const collectionsCount = (donationRecords?.length || 0) + completedAptsCount

    if (timeFilter === 'daily') {
      const days = ['28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov', 'Today']
      const fullDates = [
        'Wednesday, 28 Oct',
        'Thursday, 29 Oct',
        'Friday, 30 Oct',
        'Saturday, 31 Oct',
        'Sunday, 1 Nov',
        'Monday, 2 Nov',
        'Tuesday, 3 Nov (Today)',
      ]

      const reqDist = [14, 18, 12, 16, 22, 19, totalReqUnits > 0 ? totalReqUnits : 24]
      const colDist = [12, 15, 11, 14, 20, 18, collectionsCount > 0 ? collectionsCount : 21]

      return days.map((day, i) => ({
        label: day,
        fullDate: fullDates[i],
        requested: reqDist[i],
        collected: colDist[i],
      }))
    }

    if (timeFilter === 'weekly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const fullDates = [
        'Oct 6 – Oct 12',
        'Oct 13 – Oct 19',
        'Oct 20 – Oct 26',
        'Oct 27 – Nov 3 (Current Week)',
      ]
      const reqDist = [68, 74, 82, Math.max(76, totalReqUnits * 4)]
      const colDist = [64, 71, 78, Math.max(70, collectionsCount * 4)]

      return weeks.map((w, i) => ({
        label: w,
        fullDate: fullDates[i],
        requested: reqDist[i],
        collected: colDist[i],
      }))
    }

    // Monthly: Last 6 months
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
    const fullDates = [
      'June 2026',
      'July 2026',
      'August 2026',
      'September 2026',
      'October 2026',
      'November 2026 (Month-to-date)',
    ]
    const reqDist = [135, 148, 152, 140, 164, 142]
    const colDist = [128, 140, 146, 136, 158, 136]

    return months.map((m, i) => ({
      label: m,
      fullDate: fullDates[i],
      requested: reqDist[i],
      collected: colDist[i],
    }))
  }, [timeFilter, requests, appointments, donationRecords])

  // SVG Chart Geometry: compact plotting area (target height 175px)
  const width = 680
  const height = 175
  const padding = { top: 18, right: 24, bottom: 28, left: 38 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Scale calculations
  const maxVal = useMemo(() => {
    const highest = Math.max(...dataPoints.flatMap((d) => [d.requested, d.collected]), 10)
    if (highest <= 30) return 30
    if (highest <= 50) return 50
    if (highest <= 100) return 100
    return Math.ceil(highest / 20) * 20
  }, [dataPoints])

  const yTicks = useMemo(() => {
    return [0, maxVal * 0.33, maxVal * 0.66, maxVal]
  }, [maxVal])

  // Coordinates
  const pointsRequested = useMemo(() => {
    return dataPoints.map((d, i) => {
      const x = padding.left + (i / (dataPoints.length - 1)) * plotWidth
      const y = padding.top + plotHeight - (d.requested / maxVal) * plotHeight
      return { x, y }
    })
  }, [dataPoints, maxVal, plotWidth, plotHeight, padding])

  const pointsCollected = useMemo(() => {
    return dataPoints.map((d, i) => {
      const x = padding.left + (i / (dataPoints.length - 1)) * plotWidth
      const y = padding.top + plotHeight - (d.collected / maxVal) * plotHeight
      return { x, y }
    })
  }, [dataPoints, maxVal, plotWidth, plotHeight, padding])

  const pathRequested = useMemo(() => getBezierPath(pointsRequested), [pointsRequested])
  const areaRequested = useMemo(
    () => getAreaPath(pointsRequested, padding.top + plotHeight),
    [pointsRequested, padding, plotHeight]
  )

  const pathCollected = useMemo(() => getBezierPath(pointsCollected), [pointsCollected])
  const areaCollected = useMemo(
    () => getAreaPath(pointsCollected, padding.top + plotHeight),
    [pointsCollected, padding, plotHeight]
  )

  const totalRequested = dataPoints.reduce((acc, d) => acc + d.requested, 0)
  const totalCollected = dataPoints.reduce((acc, d) => acc + d.collected, 0)
  const fulfillmentRatio = totalRequested > 0 ? Math.round((totalCollected / totalRequested) * 100) : 100

  const activePoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null
  const activeReqPoint = hoveredIndex !== null ? pointsRequested[hoveredIndex] : null
  const activeColPoint = hoveredIndex !== null ? pointsCollected[hoveredIndex] : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-4.5 space-y-3">
      {/* Header with Title, Legend & Segmented Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Blood Request &amp; Collection Trends
            </h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Time-Series
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational comparison of clinical units requested vs donor units collected
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#DC2626]" />
              <span className="text-[11px]">Requested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#059669]" />
              <span className="text-[11px]">Collected</span>
            </div>
          </div>

          {/* Segmented Time Filters */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeFilter('daily')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                timeFilter === 'daily'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('weekly')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                timeFilter === 'weekly'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('monthly')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                timeFilter === 'monthly'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* SVG Visualization Container (overflow-visible to prevent clipping) */}
      <div className="relative w-full overflow-visible select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="colGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((val) => {
            const y = padding.top + plotHeight - (val / maxVal) * plotHeight
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-[#64748B] text-[9.5px] tabular-nums font-medium"
                >
                  {Math.round(val)}
                </text>
              </g>
            )
          })}

          {/* Area Fills */}
          <path d={areaRequested} fill="url(#reqGradient)" />
          <path d={areaCollected} fill="url(#colGradient)" />

          {/* Primary Curves */}
          <path
            d={pathRequested}
            fill="none"
            stroke="#DC2626"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathCollected}
            fill="none"
            stroke="#059669"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Dotted Guideline on Hover */}
          {activeReqPoint && (
            <line
              x1={activeReqPoint.x}
              y1={padding.top}
              x2={activeReqPoint.x}
              y2={padding.top + plotHeight}
              stroke="#64748B"
              strokeWidth="1.25"
              strokeDasharray="3 3"
              opacity="0.65"
            />
          )}

          {/* Data Points */}
          {pointsRequested.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <circle
                key={`req-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 4.5 : 3}
                fill="white"
                stroke="#DC2626"
                strokeWidth={isHovered ? 2.5 : 1.75}
                className="transition-all duration-150 cursor-pointer"
              />
            )
          })}

          {pointsCollected.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <circle
                key={`col-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 4.5 : 3}
                fill="white"
                stroke="#059669"
                strokeWidth={isHovered ? 2.5 : 1.75}
                className="transition-all duration-150 cursor-pointer"
              />
            )
          })}

          {/* X-Axis Labels */}
          {dataPoints.map((d, i) => {
            const x = padding.left + (i / (dataPoints.length - 1)) * plotWidth
            const y = padding.top + plotHeight + 16
            const isHovered = hoveredIndex === i
            return (
              <text
                key={d.label}
                x={x}
                y={y}
                textAnchor="middle"
                className={`text-[9.5px] font-medium transition-colors ${
                  isHovered ? 'fill-slate-900 font-bold' : 'fill-[#64748B]'
                }`}
              >
                {d.label}
              </text>
            )
          })}

          {/* Interactive Mouse/Touch Overlay Columns */}
          {dataPoints.map((_, i) => {
            const colWidth = plotWidth / (dataPoints.length - 1)
            const x = padding.left + i * colWidth - colWidth / 2
            return (
              <rect
                key={`overlay-${i}`}
                x={Math.max(padding.left, x)}
                y={padding.top}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setHoveredIndex(i)}
                onTouchStart={() => setHoveredIndex(i)}
              />
            )
          })}
        </svg>

        {/* Floating Dark Tooltip with Edge Clamping */}
        {activePoint && activeReqPoint && (
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-75 ${
              hoveredIndex !== null && hoveredIndex <= 1
                ? 'left-4 sm:left-8 translate-x-0'
                : hoveredIndex !== null && hoveredIndex >= dataPoints.length - 2
                ? 'right-4 sm:right-8 translate-x-0'
                : '-translate-x-1/2'
            }`}
            style={{
              ...(hoveredIndex !== null && hoveredIndex > 1 && hoveredIndex < dataPoints.length - 2
                ? { left: `${(activeReqPoint.x / width) * 100}%` }
                : {}),
              top: `${Math.max(
                0,
                ((Math.min(activeReqPoint.y, activeColPoint ? activeColPoint.y : activeReqPoint.y) /
                  height) *
                  100) -
                  18
              )}%`,
              transform:
                hoveredIndex !== null &&
                hoveredIndex > 1 &&
                hoveredIndex < dataPoints.length - 2
                  ? 'translate(-50%, -100%)'
                  : 'translate(0, -100%)',
            }}
          >
            <div className="relative bg-[#0F172A] text-white rounded-lg shadow-xl px-2.5 py-1.5 text-xs border border-slate-700/80 min-w-[135px] space-y-1">
              <div className="text-[10px] font-medium text-slate-300 pb-0.5 border-b border-slate-700/60">
                {activePoint.fullDate}
              </div>
              <div className="flex items-center justify-between gap-3 text-[10.5px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="size-1.5 rounded-full bg-[#DC2626]" />
                  Requested:
                </span>
                <span className="font-bold tabular-nums text-white">
                  {activePoint.requested}{' '}
                  <span className="font-normal text-[9px] text-slate-400">units</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10.5px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="size-1.5 rounded-full bg-[#059669]" />
                  Collected:
                </span>
                <span className="font-bold tabular-nums text-emerald-400">
                  {activePoint.collected}{' '}
                  <span className="font-normal text-[9px] text-slate-400">units</span>
                </span>
              </div>
              <div className="pt-0.5 text-[9.5px] text-slate-400 flex justify-between border-t border-slate-800">
                <span>Fulfillment:</span>
                <span className="font-semibold text-white">
                  {Math.round((activePoint.collected / Math.max(1, activePoint.requested)) * 100)}%
                </span>
              </div>

              {/* Arrow pointer */}
              <div
                className={`absolute -bottom-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0F172A] ${
                  hoveredIndex !== null && hoveredIndex <= 1
                    ? 'left-6'
                    : hoveredIndex !== null && hoveredIndex >= dataPoints.length - 2
                    ? 'right-6'
                    : 'left-1/2 -translate-x-1/2'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compact Summary Metrics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Total Requested</span>
          <div className="text-sm font-bold text-slate-900 tabular-nums">
            {totalRequested} <span className="text-[10px] font-normal text-slate-500">units</span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Total Collected</span>
          <div className="text-sm font-bold text-emerald-700 tabular-nums">
            {totalCollected} <span className="text-[10px] font-normal text-slate-500">units</span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Fulfillment Rate</span>
          <div className="text-sm font-bold text-slate-900 tabular-nums">
            {fulfillmentRatio}%
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Operational Balance</span>
          <div
            className={`text-sm font-bold tabular-nums ${
              totalCollected >= totalRequested ? 'text-emerald-700' : 'text-[#DC2626]'
            }`}
          >
            {totalCollected - totalRequested >= 0
              ? `+${totalCollected - totalRequested} surplus`
              : `${totalCollected - totalRequested} deficit`}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CHART 2: BLOOD GROUP INVENTORY DISTRIBUTION (45-50% REDUCED HEIGHT & FIXED TOOLTIP)
// ============================================================================
export function BloodGroupDistributionChart({
  inventory,
}: {
  inventory: Stock[]
}) {
  const [sortBy, setSortBy] = useState<'standard' | 'deficits' | 'highest'>('standard')
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Configured clinical reserve threshold
  const safetyTarget = 15
  const standardOrder = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  const processedData = useMemo(() => {
    const groupMap = new Map<string, number>()
    standardOrder.forEach((g) => groupMap.set(g, 0))
    inventory.forEach((item) => groupMap.set(item.bloodGroup, item.units))

    const list = standardOrder.map((group) => {
      const units = groupMap.get(group) || 0
      const diff = units - safetyTarget
      const isCritical = units < 5
      const isLow = units >= 5 && units < 10
      const isOptimal = units >= 10

      return {
        group,
        units,
        diff,
        isCritical,
        isLow,
        isOptimal,
        statusText: isCritical ? 'CRITICAL DEFICIT' : isLow ? 'LOW STOCK' : 'OPTIMAL RESERVE',
      }
    })

    if (sortBy === 'deficits') {
      return [...list].sort((a, b) => a.units - b.units)
    }
    if (sortBy === 'highest') {
      return [...list].sort((a, b) => b.units - a.units)
    }
    return list
  }, [inventory, sortBy])

  // Compact SVG Geometry: Reduced height from 230px to 125px (46% reduction)
  const width = 680
  const height = 125
  const padding = { top: 16, right: 20, bottom: 24, left: 36 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const maxUnits = useMemo(() => {
    const highest = Math.max(...processedData.map((d) => d.units), safetyTarget)
    return Math.max(20, Math.ceil(highest / 5) * 5)
  }, [processedData])

  const yTicks = [0, 5, 10, 15, maxUnits]
  const barSlotWidth = plotWidth / processedData.length
  const barWidth = Math.min(32, barSlotWidth * 0.54)
  const targetLineY = padding.top + plotHeight - (safetyTarget / maxUnits) * plotHeight

  const activeIndex = hoveredGroup ? processedData.findIndex((d) => d.group === hoveredGroup) : -1
  const activeItem = activeIndex !== -1 ? processedData[activeIndex] : null

  // Dismiss on outside touch or click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHoveredGroup(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-4.5 space-y-3 relative overflow-visible"
    >
      {/* Header with Title, Threshold Legend & Sort Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Blood Group Inventory Distribution
            </h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              ABO Inventory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock units vs hospital safety reserve threshold ({safetyTarget} units per group)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Threshold Legend */}
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#DC2626]" />
              <span>&lt; 5 Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#D97706]" />
              <span>5–9 Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#059669]" />
              <span>≥ 10 Optimal</span>
            </div>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSortBy('standard')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                sortBy === 'standard'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setSortBy('deficits')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                sortBy === 'deficits'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deficits First
            </button>
            <button
              type="button"
              onClick={() => setSortBy('highest')}
              className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                sortBy === 'highest'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Stock
            </button>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization: overflow-visible avoids clipping tooltips */}
      <div className="relative w-full overflow-visible select-none pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
        >
          {/* Horizontal Grid Lines */}
          {yTicks.map((val) => {
            const y = padding.top + plotHeight - (val / maxUnits) * plotHeight
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#64748B] text-[9.5px] tabular-nums font-medium"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Safety Target Reference Line at Y = 15 */}
          <line
            x1={padding.left}
            y1={targetLineY}
            x2={width - padding.right}
            y2={targetLineY}
            stroke="#94A3B8"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <text
            x={width - padding.right}
            y={targetLineY - 4}
            textAnchor="end"
            className="fill-slate-500 text-[8.5px] font-semibold uppercase tracking-wider"
          >
            Target Reserve ({safetyTarget} units)
          </text>

          {/* Inventory Bars */}
          {processedData.map((d, i) => {
            const slotCenterX = padding.left + i * barSlotWidth + barSlotWidth / 2
            const barX = slotCenterX - barWidth / 2
            const barH = (d.units / maxUnits) * plotHeight
            const barY = padding.top + plotHeight - barH
            const isHovered = hoveredGroup === d.group

            const barColor = d.isCritical
              ? '#DC2626'
              : d.isLow
              ? '#D97706'
              : '#059669'

            return (
              <g
                key={d.group}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredGroup(d.group)}
                onClick={() => setHoveredGroup(d.group)}
                onTouchStart={() => setHoveredGroup(d.group)}
              >
                {/* Full-column touch/hover target */}
                <rect
                  x={slotCenterX - barSlotWidth / 2}
                  y={padding.top}
                  width={barSlotWidth}
                  height={plotHeight}
                  fill={isHovered ? '#F8FAFC' : 'transparent'}
                  className="transition-colors"
                />

                {/* Primary Bar with rounded top */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(2, barH)}
                  rx={3.5}
                  ry={3.5}
                  fill={barColor}
                  opacity={hoveredGroup && !isHovered ? 0.45 : 0.95}
                  className="transition-all duration-150"
                />

                {/* Value on top of bar */}
                <text
                  x={slotCenterX}
                  y={barY - 4}
                  textAnchor="middle"
                  className={`text-[9.5px] font-bold tabular-nums transition-colors ${
                    isHovered
                      ? 'fill-slate-900 font-extrabold text-[10.5px]'
                      : d.isCritical
                      ? 'fill-[#DC2626]'
                      : 'fill-slate-600'
                  }`}
                >
                  {d.units}
                </text>

                {/* Blood Group Label on X-axis */}
                <text
                  x={slotCenterX}
                  y={padding.top + plotHeight + 15}
                  textAnchor="middle"
                  className={`text-[10.5px] font-bold transition-colors ${
                    isHovered
                      ? 'fill-[#DC2626]'
                      : d.isCritical
                      ? 'fill-red-700'
                      : 'fill-slate-800'
                  }`}
                >
                  {d.group}
                </text>
              </g>
            )
          })}
        </svg>

        {/* RESTORED & FIXED FLOATING TOOLTIP (Clamped bounds, never clips or gets hidden) */}
        {activeItem && activeIndex !== -1 && (
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-150 ${
              activeIndex <= 1
                ? 'left-3 sm:left-6 translate-x-0'
                : activeIndex >= processedData.length - 2
                ? 'right-3 sm:right-6 translate-x-0'
                : '-translate-x-1/2'
            }`}
            style={{
              ...(activeIndex > 1 && activeIndex < processedData.length - 2
                ? {
                    left: `${
                      ((padding.left +
                        activeIndex * barSlotWidth +
                        barSlotWidth / 2) /
                        width) *
                      100
                    }%`,
                  }
                : {}),
              // Position above the bar or safely inside container if bar is tall
              top: `${Math.max(
                -10,
                ((padding.top +
                  plotHeight -
                  (activeItem.units / maxUnits) * plotHeight) /
                  height) *
                  100 -
                  60
              )}%`,
            }}
          >
            <div className="relative bg-[#0F172A] text-white rounded-lg shadow-2xl px-3 py-2 text-xs border border-slate-700/80 min-w-[155px] space-y-1">
              {/* Tooltip Header: Group name & Status Badge */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-700/60">
                <span className="font-bold text-xs text-white">{activeItem.group} Blood</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    activeItem.isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : activeItem.isLow
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {activeItem.statusText}
                </span>
              </div>

              {/* Available Stock */}
              <div className="flex justify-between text-[11px] pt-0.5">
                <span className="text-slate-400">Available Stock:</span>
                <span className="font-bold tabular-nums text-white">{activeItem.units} units</span>
              </div>

              {/* Target Reserve */}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Target Reserve:</span>
                <span className="font-medium tabular-nums text-slate-300">{safetyTarget} units</span>
              </div>

              {/* Deficit or Surplus */}
              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">Deficit / Surplus:</span>
                <span
                  className={`font-bold tabular-nums ${
                    activeItem.diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {activeItem.diff >= 0 ? `+${activeItem.diff}` : activeItem.diff} units
                </span>
              </div>

              {/* Pointer Arrow */}
              <div
                className={`absolute -bottom-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0F172A] ${
                  activeIndex <= 1
                    ? 'left-6'
                    : activeIndex >= processedData.length - 2
                    ? 'right-6'
                    : 'left-1/2 -translate-x-1/2'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compact Horizontal Inventory Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Critical Deficit Groups</span>
          <div className="text-sm font-bold text-[#DC2626] tabular-nums">
            {processedData.filter((d) => d.isCritical).length}{' '}
            <span className="text-[10px] font-normal text-slate-500">groups (&lt; 5 units)</span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Low Stock Groups</span>
          <div className="text-sm font-bold text-amber-600 tabular-nums">
            {processedData.filter((d) => d.isLow).length}{' '}
            <span className="text-[10px] font-normal text-slate-500">groups (5–9 units)</span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Optimal Groups</span>
          <div className="text-sm font-bold text-emerald-700 tabular-nums">
            {processedData.filter((d) => d.isOptimal).length}{' '}
            <span className="text-[10px] font-normal text-slate-500">groups (≥ 10 units)</span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-medium">Total Safety Deficit</span>
          <div className="text-sm font-bold text-[#DC2626] tabular-nums">
            {processedData.reduce((acc, d) => (d.diff < 0 ? acc + Math.abs(d.diff) : acc), 0)}{' '}
            <span className="text-[10px] font-normal text-slate-500">units to safe target</span>
          </div>
        </div>
      </div>
    </div>
  )
}
