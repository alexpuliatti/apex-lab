'use client'

import { useState, useEffect } from 'react'
import StairScene from '../../components/StairScene'

export default function ZineLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-[100dvh] w-full bg-black" />

  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden relative">
      {/* The 3D canvas is mounted permanently here so it never unloads */}
      <StairScene />
      
      {/* Dynamic subpages (like /zine/01) will mount their overlays here */}
      <div className="absolute inset-0 pointer-events-none">
        {children}
      </div>
    </main>
  )
}
