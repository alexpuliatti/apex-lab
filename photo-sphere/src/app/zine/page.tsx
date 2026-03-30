'use client'

import { useState, useEffect } from 'react'
import StairScene from '../../components/StairScene'

export default function ZinePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="min-h-screen bg-black" />

  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      <StairScene />
    </main>
  )
}
