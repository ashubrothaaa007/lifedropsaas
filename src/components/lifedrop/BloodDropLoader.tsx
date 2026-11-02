'use client'

import React, { useEffect, useState } from 'react'

interface BloodDropLoaderProps {
  fullScreen?: boolean
  minDisplayTime?: number // ms before fast dismiss
  onLoaded?: () => void
}

export default function BloodDropLoader({
  fullScreen = true,
  minDisplayTime = 720,
  onLoaded,
}: BloodDropLoaderProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true)
      const fadeTimer = setTimeout(() => {
        setVisible(false)
        if (onLoaded) onLoaded()
      }, 200)
      return () => clearTimeout(fadeTimer)
    }, minDisplayTime)

    return () => clearTimeout(timer)
  }, [minDisplayTime, onLoaded])

  if (!visible) return null

  const content = (
    <div className="relative flex items-center justify-center select-none pointer-events-none">
      {/* Soft Ambient Radiance */}
      <div className="absolute size-36 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />

      {/* Unified Coaxial Fluid Simulation Canvas */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32"
        aria-hidden="true"
      >
        <defs>
          {/* Arterial Blood Gradient: Rich ruby core to translucent crimson edge */}
          <linearGradient id="arterial-blood-drop" x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="25%" stopColor="#EF4444" />
            <stop offset="65%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Liquid Pool Meniscus: Deep clinical crimson with radial depth */}
          <radialGradient id="arterial-pool" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="35%" stopColor="#E11D48" />
            <stop offset="75%" stopColor="#9F1239" />
            <stop offset="100%" stopColor="#58081E" />
          </radialGradient>

          {/* Liquid Glass Highlight: Organic curved specular reflection */}
          <linearGradient id="liquid-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Primary Perspective Ripple Gradient */}
          <linearGradient id="ripple-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0" />
            <stop offset="30%" stopColor="#FB7185" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#E11D48" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9F1239" stopOpacity="0" />
          </linearGradient>

          {/* Secondary Perspective Ripple Gradient */}
          <linearGradient id="ripple-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0" />
            <stop offset="50%" stopColor="#FDA4AF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#9F1239" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Impact Surface Dynamic Glow Pulse */}
        <ellipse
          cx="60"
          cy="88"
          rx="32"
          ry="10"
          fill="url(#arterial-pool)"
          className="origin-[60px_88px] animate-fluid-glow"
        />

        {/* 2. Outer Perspective Ripple Shockwave */}
        <ellipse
          cx="60"
          cy="88"
          rx="28"
          ry="8.5"
          fill="none"
          stroke="url(#ripple-grad-1)"
          strokeWidth="1.6"
          className="origin-[60px_88px] animate-fluid-ripple-primary"
        />

        {/* 3. Inner Perspective Ripple Shockwave */}
        <ellipse
          cx="60"
          cy="88"
          rx="28"
          ry="8.5"
          fill="none"
          stroke="url(#ripple-grad-2)"
          strokeWidth="1.2"
          className="origin-[60px_88px] animate-fluid-ripple-secondary"
        />

        {/* 4. Base Liquid Meniscus Pool */}
        <g className="origin-[60px_88px] animate-fluid-pool">
          <ellipse cx="60" cy="88" rx="28" ry="8.5" fill="url(#arterial-pool)" />
          {/* Surface Curvature Highlight */}
          <path
            d="M42 86.5C48 84.8 72 84.8 78 86.5C72 85.3 48 85.3 42 86.5Z"
            fill="#FFFFFF"
            fillOpacity="0.4"
          />
        </g>

        {/* 5. Falling Blood Droplet (Organic Tear with 3D Specular Curvature) */}
        <g className="origin-[60px_47px] animate-fluid-drip">
          {/* Blood Drop Body */}
          <path
            d="M60 30C60 30 48 44 48 52C48 58.6 53.4 64 60 64C66.6 64 72 58.6 72 52C72 44 60 30 60 30Z"
            fill="url(#arterial-blood-drop)"
            className="drop-shadow-[0_4px_8px_rgba(136,19,55,0.45)]"
          />
          {/* Curved Specular Refraction Highlight */}
          <path
            d="M53 45C52 48 52 54 54 57C53 57 51.5 53.5 51.8 48C52.1 44.5 54 41 56 38C54.5 41 53.3 43 53 45Z"
            fill="url(#liquid-gloss)"
          />
          {/* Specular Micro-Dot Glint */}
          <circle cx="63.5" cy="54" r="1.4" fill="#FFFFFF" fillOpacity="0.75" />
        </g>

        {/* 6. Surface Tension Rebound Micro-Bead */}
        <g className="origin-[60px_88px] animate-fluid-rebound">
          <path
            d="M60 84C60 84 56.5 88 56.5 90C56.5 91.9 58.1 93.5 60 93.5C61.9 93.5 63.5 91.9 63.5 90C63.5 88 60 84 60 84Z"
            fill="url(#arterial-blood-drop)"
          />
          <circle cx="58.5" cy="89" r="0.8" fill="#FFFFFF" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  )

  if (!fullScreen) {
    return <div className="py-6 flex items-center justify-center">{content}</div>
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-200 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {content}
    </div>
  )
}
